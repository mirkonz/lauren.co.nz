import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import { createContentSchemas, entryImagePath } from '../src/lib/content-schemas';
import { validatePortfolio, type Portfolio } from '../src/lib/content-integrity';

const image: z.ZodType<ImageMetadata> = z.object({ src: z.string(), width: z.number().positive(), height: z.number().positive(), format: z.literal('jpg') });
const schemas = createContentSchemas(image);
const draft = { key: 'work-a', url_slug: 'work-a', title: 'Schema test fixture' };
const approvedImage = { file: { src: '/fixture.jpg', width: 747, height: 504, format: 'jpg' }, alt: 'Painted geometric forms.', permission: 'approved' };
const publicArtwork = { ...draft, publication: 'published', facts_verified: true, cover: approvedImage };
const portfolio = (): Portfolio => ({ film: [], practice: [], artworks: [], collections: [], pages: [], settings: [{ id: 'site', data: schemas.settings.parse({ key: 'site', professional_name: 'Lauren', default_description: 'Portfolio test.' }) }] });

test('new artwork remains unknown and cannot accept enquiries by default', () => {
  const data = schemas.artworks.parse(draft);
  assert.equal(data.publication, 'draft');
  assert.equal(data.availability, 'unknown');
  assert.equal(data.enquiries_enabled, false);
  assert.equal(data.show_price, false);
});

test('publication requires verified facts, main image, image permission and alt text', () => {
  for (const invalid of [
    { ...publicArtwork, facts_verified: false },
    { ...publicArtwork, cover: undefined },
    { ...publicArtwork, cover: { ...approvedImage, permission: 'unreviewed' } },
    { ...publicArtwork, cover: { ...approvedImage, permission: 'restricted' } },
    { ...publicArtwork, cover: { ...approvedImage, alt: ' ' } },
    { ...publicArtwork, gallery: [{ ...approvedImage, permission: 'unreviewed' }] },
  ]) assert.equal(schemas.artworks.safeParse(invalid).success, false);
  assert.equal(schemas.artworks.safeParse(publicArtwork).success, true);
});

test('unknown/not-for-sale states cannot enable enquiries; sold requires similar-work permission', () => {
  for (const availability of ['unknown', 'not-for-sale', 'sold']) {
    assert.equal(schemas.artworks.safeParse({ ...draft, availability, enquiries_enabled: true }).success, false);
  }
  assert.equal(schemas.artworks.safeParse({ ...draft, availability: 'sold', enquiries_enabled: true, similar_work_enquiries: true }).success, true);
});

test('visible prices require a positive amount and uppercase currency', () => {
  for (const price of [undefined, { amount: 0, currency: 'NZD' }, { amount: 20, currency: 'nzd' }]) {
    assert.equal(schemas.artworks.safeParse({ ...draft, show_price: true, price }).success, false);
  }
  assert.equal(schemas.artworks.safeParse({ ...draft, show_price: true, price: { amount: 20, currency: 'NZD' } }).success, true);
});

test('unsafe URL slugs are rejected and missing dates/prices stay missing', () => {
  assert.equal(schemas.artworks.safeParse({ ...draft, url_slug: '../contact' }).success, false);
  const data = schemas.artworks.parse(draft);
  assert.equal(data.year_label, undefined);
  assert.equal(data.price, undefined);
});

test('stable ID must match its folder and stay unique across collections', () => {
  const data = schemas.artworks.parse(draft);
  const p = portfolio();
  p.artworks = [{ id: 'wrong-folder', data }];
  assert.throws(() => validatePortfolio(p), /folder must match/);
  p.artworks = [{ id: data.key, data }, { id: data.key, data }];
  assert.throws(() => validatePortfolio(p), /Duplicate reference/);
});

test('broken, repeated and published-to-draft relationships fail', () => {
  const p = portfolio();
  p.collections = [{ id: 'collection-a', data: schemas.collections.parse({ ...draft, key: 'collection-a', artworks: ['missing'] }) }];
  assert.throws(() => validatePortfolio(p), /missing reference/);
  p.artworks = [{ id: 'work-a', data: schemas.artworks.parse(draft) }];
  p.collections[0]!.data.artworks = ['work-a', 'work-a'];
  assert.throws(() => validatePortfolio(p), /duplicate references/);
  p.collections[0]!.data.artworks = ['work-a'];
  p.collections[0]!.data.publication = 'published';
  assert.throws(() => validatePortfolio(p), /cannot publish a reference/);
});

test('production rejects draft media even when no draft page renders it', () => {
  const p = portfolio();
  p.artworks = [{ id: 'work-a', data: schemas.artworks.parse({ ...draft, cover: approvedImage }) }];
  assert.throws(() => validatePortfolio(p), /draft media can be emitted/);
  assert.doesNotThrow(() => validatePortfolio(p, { allowDraftMedia: true }));
});

test('featured work must be published and global enquiry switches are enforced', () => {
  const p = portfolio();
  p.artworks = [{ id: 'work-a', data: schemas.artworks.parse(draft) }];
  p.settings[0]!.data.featured_artworks = ['work-a'];
  assert.throws(() => validatePortfolio(p), /cannot publish a reference/);
  p.settings[0]!.data.featured_artworks = [];
  p.artworks[0]!.data = schemas.artworks.parse({ ...publicArtwork, availability: 'commission', enquiries_enabled: true });
  assert.throws(() => validatePortfolio(p), /commissions are disabled/);
  p.settings[0]!.data.commissions_enabled = true;
  assert.doesNotThrow(() => validatePortfolio(p));
});

test('CMS exposes every top-level schema field and omits empty optional values', () => {
  const field = z.object({ name: z.string() });
  const config = z.object({
    output: z.object({ omit_empty_optional_fields: z.literal(true) }),
    publish_mode: z.literal('editorial_workflow'),
    collections: z.array(z.object({ name: z.string(), fields: z.array(field).optional(), files: z.array(z.object({ fields: z.array(field) })).optional() })),
  }).parse(parse(readFileSync('public/admin/config.yml', 'utf8')));
  for (const [name, schema] of Object.entries(schemas)) {
    const cms = config.collections.find((collection) => collection.name === name);
    assert(cms, `Missing CMS collection ${name}`);
    const fields = cms.fields ?? cms.files?.[0]?.fields ?? [];
    assert.deepEqual(fields.map((item) => item.name).filter((name) => name !== 'body').sort(), Object.keys(schema.shape).sort(), `Schema/CMS field mismatch: ${name}`);
  }
});

test('CMS bare image paths and explicit relative paths validate while unsafe references fail', () => {
  for (const file of ['image.jpg', './image.jpg', 'detail/image.jpg', './detail/image.jpg']) {
    assert.equal(entryImagePath.safeParse(file).success, true, file);
  }
  for (const file of ['', '/', '/image.jpg', '../image.jpg', './a/../../image.jpg',
    'https://example.com/image.jpg', '//example.com/image.jpg', 'C:\\image.jpg',
    './image.jpg?x=1', './image.jpg#fragment', 'a//image.jpg', '././image.jpg', 'a/../image.jpg']) {
    assert.equal(entryImagePath.safeParse(file).success, false, file);
  }
});


test('remote CMS login has an explicit GitHub repository and HTTPS authenticator', () => {
  const config = parse(readFileSync('public/admin/config.yml', 'utf8'));
  assert.equal(config.backend.name, 'github');
  assert.equal(config.backend.repo, 'mirkonz/lauren.co.nz');
  const authenticator = new URL(config.backend.base_url);
  assert.equal(authenticator.protocol, 'https:');
  assert.equal(authenticator.origin, 'https://lauren-cms-auth.ygknxzgpg4.workers.dev');
  assert.equal(authenticator.pathname, '/');
  assert.deepEqual(config.backend.auth_methods, ['oauth']);
});
