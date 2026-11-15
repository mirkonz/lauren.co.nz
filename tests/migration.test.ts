import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';

const read = (path: string) => readFileSync(path, 'utf8');
const audit = (name: string) => JSON.parse(read(`docs/audit/${name}.json`));
const migration = JSON.parse(read('docs/migration.json'));
const supplemental = JSON.parse(read('docs/source-media-review.json'));
const approvals = JSON.parse(read('docs/content-approvals.json'));
const approvedRecord = (path: string) => approvals.records.find((item: {destination: string}) => item.destination === path);
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const record = (path: string) => {
  const text = read(path);
  return { text, data: parse(text.match(/^---\n([\s\S]*?)\n---\n/)![1]!) };
};

test('migration accounts for every source page, renderer occurrence and asset without approving media', () => {
  const pages = audit('pages');
  const occurrences = audit('occurrences');
  const assets = audit('assets');
  assert.equal(migration.pages.length, pages.length);
  assert.equal(migration.occurrences.length, occurrences.length);
  assert.equal(migration.assets.length, assets.length);
  for (const [index, page] of pages.entries()) {
    const mapped = migration.pages[index];
    assert.equal(mapped.source_url, page.url);
    assert.equal(mapped.source_snapshot, page.snapshot);
    assert(mapped.destinations.length || mapped.disposition === 'archive-only review');
    for (const path of mapped.destinations) assert(path in migration.record_hashes);
  }
  for (const [index, occurrence] of occurrences.entries()) {
    const mapped = migration.occurrences[index];
    assert.equal(mapped.source_pointer, `occurrences.json#/${index}`);
    for (const key of ['source_url', 'component_path', 'asset_url']) assert.equal(mapped[key], occurrence[key]);
    assert.equal(mapped.permission, 'unreviewed');
    assert(mapped.disposition.startsWith('archive-only'));
    for (const path of mapped.destinations) assert(path in migration.record_hashes);
  }
  for (const [index, asset] of assets.entries()) {
    const mapped = migration.assets[index];
    assert.equal(mapped.asset_url, asset.url);
    assert.equal(mapped.sha256, asset.sha256 ?? null);
    assert.equal(mapped.permission, 'unreviewed');
    assert.deepEqual(mapped.occurrence_indices, occurrences.flatMap((o: {asset_url: string}, i: number) => o.asset_url === asset.url ? [i] : []));
  }
});

test('gallery destinations retain all ordered source items and distinguish repeater templates', () => {
  const raw = audit('galleries');
  const canonical = raw.filter((g: {component: string; source_url: string}) =>
    g.component.includes('__') || !raw.some((other: typeof g) => other.source_url === g.source_url && other.component.startsWith(g.component + '__')));
  assert.equal(migration.galleries.length, canonical.length);
  assert.equal(migration.galleries.reduce((n: number, g: {items: unknown[]}) => n + g.items.length, 0), 395);
  for (const source of canonical) {
    const mapped = migration.galleries.find((g: typeof source) => g.source_url === source.source_url && g.component === source.component);
    assert(mapped);
    assert(mapped.destination in migration.record_hashes);
    assert.equal(mapped.items.length, source.items.length);
    for (const [i, item] of source.items.entries()) {
      assert.equal(mapped.items[i].position, i);
      assert.equal(mapped.items[i].source_pointer, `galleries.json#/${raw.indexOf(source)}/items/${i}`);
      assert.equal(mapped.items[i].asset_url, 'https://static.wixstatic.com/media/' + item.image.uri);
    }
  }
  for (const occurrence of migration.occurrences) {
    const component = occurrence.component_path.split('/')[1];
    const template = raw.some((g: {source_url: string; component: string}) => g.source_url === occurrence.source_url && g.component.startsWith(component + '__'));
    assert.equal(occurrence.disposition === 'archive-only repeater template', template);
  }
  const streets = migration.galleries.filter((g: {source_title: string}) => g.source_title === 'City Streets Illustrations');
  assert.equal(streets.length, 2);
  assert.equal(streets[0].destination, streets[1].destination);
});

test('unapproved drafts retain their source text and cannot acquire facts or media', () => {
  for (const [path, expectedHash] of Object.entries(migration.record_hashes)) {
    const { text, data } = record(path);
    const approved = approvedRecord(path);
    if (approved) {
      assert.equal(approved.source_record_sha256, expectedHash, path);
      assert.equal(hash(text), approved.approved_record_sha256, path);
      continue;
    }
    const annotation = supplemental.deferred_image_review.records.find((item: {destination: string}) => item.destination === path);
    const initialText = annotation ? text.replace(
      '"title": ' + JSON.stringify(annotation.title),
      '"title": ' + JSON.stringify(annotation.original_title),
    ) : text;
    assert.equal(hash(initialText), expectedHash, path);
    assert.equal(data.publication, 'draft', path);
    assert.equal(data.facts_verified, false, path);
    assert.equal(data.cover, undefined, path);
    assert.equal(data.gallery, undefined, path);
    assert(!path.startsWith('src/content/artworks/'));
  }
  for (const [name, expectedHash] of Object.entries(migration.source_hashes)) {
    assert.equal(hash(read(`docs/audit/${name}`)), expectedHash, name);
  }
  assert.equal(record('src/content/settings/site/index.md').data.name_confirmed, true);
  assert.equal(record('src/content/settings/site/index.md').data.professional_name, 'Lauren May Stewart');
});

test('missing-image titles cover exactly the affected posts and all 17 originals', () => {
  const missing = new Set<string>([
    ...audit('assets').filter((a: {status: string}) => a.status === 'failed').map((a: {url: string}) => a.url),
    ...supplemental.supplemental_downloads.filter((a: {status: string}) => a.status === 'failed').map((a: {url: string}) => a.url),
  ]);
  const expected = new Map<string, Set<string>>();
  const add = (path: string, url: string) => {
    if (!missing.has(url)) return;
    if (!expected.has(path)) expected.set(path, new Set());
    expected.get(path)!.add(url);
  };
  for (const gallery of migration.galleries) {
    for (const item of gallery.items) add(gallery.destination, item.asset_url);
  }
  for (const item of supplemental.legacy_3d_gallery.items) {
    add('src/content/film-practice/practice-3d-objects/index.md', item.source_media_url);
  }
  const annotations = supplemental.deferred_image_review.records;
  assert.equal(missing.size, 17);
  assert.equal(expected.size, 6);
  assert.deepEqual(annotations.map((a: {destination: string}) => a.destination).sort(), [...expected.keys()].sort());
  assert.deepEqual(new Set(annotations.flatMap((a: {missing_original_urls: string[]}) => a.missing_original_urls)), missing);
  for (const [path, initialHash] of Object.entries(migration.record_hashes)) {
    const { data, text } = record(path);
    const annotation = annotations.find((a: {destination: string}) => a.destination === path);
    if (!annotation) {
      assert.equal(hash(text), approvedRecord(path)?.approved_record_sha256 ?? initialHash, path);
      assert(!data.title.startsWith('[IMAGES MISSING] '), path);
      continue;
    }
    assert.deepEqual(new Set(annotation.missing_original_urls), expected.get(path), path);
    assert.equal(annotation.title, '[IMAGES MISSING] ' + annotation.original_title);
    assert.equal(data.title, annotation.title, path);
    assert.equal(data.publication, 'draft', path);
  }
  assert.deepEqual(supplemental.approval, { facts_verified: false, image_permissions_approved: false, design_approved: true, publication_approved: false });
});

test('all CV film claims point to their own source text while conflicting filmography dates remain separate', () => {
  const claims = audit('cv-transcription').film_experience;
  assert.equal(migration.cv_claims.length, claims.length);
  for (const [i, claim] of claims.entries()) {
    const mapped = migration.cv_claims[i];
    assert.equal(mapped.source_pointer, `cv-transcription.json#/film_experience/${i}`);
    const { text } = record(mapped.destination);
    if (approvedRecord(mapped.destination)) {
      assert(['Blade Runner 2049', 'Mulan'].includes(claim.title));
      assert(!text.includes('VES Award'), 'Unverified source award must not enter approved copy.');
    } else assert(text.includes(JSON.stringify(claim, null, 2)), claim.title);
  }
  const { text, data } = record('src/content/film/film-pearl/index.md');
  assert.equal(data.year_label, '2023');
  assert(text.includes('"date_label": "2021"'));
  assert.equal(data.release_year, undefined);
  assert.equal(migration.pages.find((p: {source_url: string}) => p.source_url.endsWith('/filmography')).destinations.length, 18);
});

test('only the confirmed Film and Art subset is build-ready with exact approved image identities', () => {
  const selections: Record<string, string[]> = {
    'artificial-landscapes': ['A01', 'A03', 'A04', 'A05', 'A06', 'A07'],
    'film-blade-runner-2049': ['F02', 'F03', 'F05', 'F07'],
    'film-mulan': ['M03', 'M05', 'M07', 'M08'],
    'oil-painting-landscapes': ['L02', 'L01', 'L03', 'L04', 'L05', 'L06'],
  };
  assert.deepEqual(approvals.records.map((r: {key: string}) => r.key).sort(), Object.keys(selections).sort());
  for (const approved of approvals.records) {
    const { text, data } = record(approved.destination);
    assert.equal(data.publication, 'published');
    assert.equal(data.facts_verified, true);
    assert.equal(data.year_label, undefined);
    assert.equal(data.release_year, undefined);
    assert(!text.includes('Exhibition at the Waikato Society of Arts'));
    assert.equal(hash(text), approved.approved_record_sha256);
    const ids = approved.images.map((image: {review_id: string}) => image.review_id);
    const expectedIds = selections[approved.key];
    assert(expectedIds, `Unexpected approved record: ${approved.key}`);
    assert.deepEqual(ids, expectedIds);
    if (approved.key === 'film-mulan') assert(!/200 extra|2019|2020|Weta Workshop/.test(text));
    if (approved.key === 'oil-painting-landscapes') assert(!text.includes('oil on canvas'));
    assert.deepEqual(data.cover, data.gallery[0]);
    assert.equal(data.gallery.length, ids.length);
    assert.equal(readdirSync(dirname(approved.destination)).length, ids.length + 1);
    for (const [i, image] of approved.images.entries()) {
      assert.equal(createHash('sha256').update(readFileSync(image.destination)).digest('hex'), image.sha256);
      assert.equal(data.gallery[i].permission, 'approved');
      assert(data.gallery[i].alt.length > 0);
      assert(image.destination.endsWith('/' + data.gallery[i].file));
      const source = migration.assets.find((asset: {asset_url: string}) => asset.asset_url === image.source_url);
      assert.equal(source.sha256, image.sha256);
    }
  }
  assert.equal(readdirSync('src/content/artworks').filter((name) => name !== '.gitkeep').length, 0);
});
