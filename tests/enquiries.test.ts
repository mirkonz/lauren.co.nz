import assert from 'node:assert/strict';
import test from 'node:test';
import { createContentSchemas, entryImagePath } from '../src/lib/content-schemas';
import { enquiryCatalogue, enquiryPayload } from '../src/lib/enquiries';
import { MAX_ENQUIRY_BYTES, validateEnquiryRequest } from '../src/lib/enquiry-request';

const schemas = createContentSchemas(entryImagePath);
const artwork = schemas.artworks.parse({
  key: 'example-work', url_slug: 'example-work', title: 'Synthetic fixture',
  publication: 'published', facts_verified: true, availability: 'available', enquiries_enabled: true,
  cover: { file: 'fixture.jpg', alt: 'Synthetic image.', permission: 'approved' },
});
const switches = { commissions_enabled: true, sold_enquiries_enabled: true };
const catalogue = enquiryCatalogue([artwork], switches);
const payload = { artwork_id: 'example-work', name: 'Visitor', email: 'visitor@example.test', message: 'A synthetic enquiry.\nSecond line.', turnstile_token: 'synthetic-token', company: '' };
const policy = { allowedOrigin: 'https://lauren.co.nz', catalogue };
const headers = { Origin: policy.allowedOrigin, 'Content-Type': 'application/json' };
const request = (body: unknown = payload, extra: Record<string, string> = {}) => new Request('https://internal.invalid/api/enquiry', { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(body) });

test('catalogue includes only cleared, enabled artwork and applies both sold/commission switches', () => {
  assert.deepEqual(catalogue, [{ id: artwork.key, title: artwork.title, path: '/art/works/example-work/', kind: 'purchase' }]);
  for (const change of [
    { publication: 'draft' as const }, { publication: 'review' as const }, { facts_verified: false },
    { enquiries_enabled: false }, { cover: undefined }, { availability: 'unknown' as const },
    { availability: 'not-for-sale' as const }, { cover: { ...artwork.cover!, permission: 'restricted' as const } },
    { gallery: [{ ...artwork.cover!, alt: '' }] },
  ]) assert.deepEqual(enquiryCatalogue([{ ...artwork, ...change }], switches), []);
  const sold = { ...artwork, availability: 'sold' as const, similar_work_enquiries: true };
  assert.equal(enquiryCatalogue([sold], switches)[0]?.kind, 'similar');
  assert.deepEqual(enquiryCatalogue([{ ...sold, similar_work_enquiries: false }], switches), []);
  assert.deepEqual(enquiryCatalogue([sold], { ...switches, sold_enquiries_enabled: false }), []);
  const commission = { ...artwork, availability: 'commission' as const };
  assert.equal(enquiryCatalogue([commission], switches)[0]?.kind, 'commission');
  assert.deepEqual(enquiryCatalogue([commission], { ...switches, commissions_enabled: false }), []);
  assert.equal(enquiryCatalogue([{ ...artwork, availability: 'price-on-request' }], switches)[0]?.kind, 'purchase');
  assert.throws(() => enquiryCatalogue([artwork, artwork], switches), /Duplicate/);
});

test('payload rejects header injection, forged metadata, spam and oversized fields', () => {
  for (const change of [
    { name: '\nVisitor' }, { email: 'visitor@example.test\r\nBcc: x@example.test' },
    { email: 'invalid' }, { message: '\0' }, { message: 'x'.repeat(5001) }, { name: ' ' },
    { name: 'x'.repeat(101) }, { turnstile_token: '' }, { company: 'bot' },
    { recipient: 'other@example.test' }, { title: 'Forged title' }, { url: 'https://evil.test' },
  ]) assert.equal(enquiryPayload.safeParse({ ...payload, ...change }).success, false);
  assert.equal(enquiryPayload.parse({ ...payload, name: ' Visitor ' }).name, 'Visitor');
});

test('request validation uses configured origin and canonical catalogue, never client host/title', async () => {
  const result = await validateEnquiryRequest(request(), policy);
  assert(result.ok);
  assert.equal(result.target, catalogue[0]);
  assert.equal(result.payload.email, payload.email);
  for (const body of [{ ...payload, artwork_id: 'unknown' }, { ...payload, title: 'Forged' }]) {
    assert.deepEqual(await validateEnquiryRequest(request(body), policy), { ok: false, status: 400 });
  }
  assert.deepEqual(await validateEnquiryRequest(request(), { ...policy, catalogue: [] }), { ok: false, status: 400 });
  for (const origin of ['https://evil.test', 'null', '', 'https://lauren.co.nz.evil.test']) {
    assert.deepEqual(await validateEnquiryRequest(request(payload, { Origin: origin }), policy), { ok: false, status: 403 });
  }
  assert.deepEqual(await validateEnquiryRequest(new Request('https://lauren.co.nz/api/enquiry'), policy), { ok: false, status: 405 });
  assert.deepEqual(await validateEnquiryRequest(request(payload, { 'Content-Type': 'text/plain' }), policy), { ok: false, status: 415 });
  await assert.rejects(validateEnquiryRequest(request(), { ...policy, allowedOrigin: 'https://lauren.co.nz/' }), /exact enquiry origin/);
});

test('request validation bounds actual streamed bytes and rejects malformed JSON/UTF-8', async () => {
  for (const length of ['invalid', '-1', String(MAX_ENQUIRY_BYTES + 1)]) {
    assert.deepEqual(await validateEnquiryRequest(request(payload, { 'Content-Length': length }), policy), { ok: false, status: 413 });
  }
  for (const body of ['{', new Uint8Array([0xff])]) {
    assert.deepEqual(await validateEnquiryRequest(new Request('https://local.test', { method: 'POST', headers, body }), policy), { ok: false, status: 400 });
  }
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(4096)); },
    cancel() { cancelled = true; },
  });
  const streamed = new Request('https://local.test', { method: 'POST', headers: { ...headers, 'Content-Length': '1' }, body: stream, duplex: 'half' } as RequestInit);
  assert.deepEqual(await validateEnquiryRequest(streamed, policy), { ok: false, status: 413 });
  assert.equal(cancelled, true);
});

test('collection enquiries identify cleared images without inventing artwork or availability', async () => {
  const { collectionImageTargets } = await import('../src/lib/collection-enquiries');
  const collection = schemas.collections.parse({
    key: 'example-collection', url_slug: 'example-collection', title: 'Synthetic collection', publication: 'published', facts_verified: true,
    gallery: [{ file: './a01.jpg', alt: 'A synthetic image.', permission: 'approved' }, { file: 'a02.jpg', alt: 'Another image.', permission: 'approved' }],
  });
  const targets = collectionImageTargets(collection);
  assert.equal(targets[0]?.kind, 'image');
  assert.equal(targets[0]?.id, 'image-example-collection-a01');
  assert.equal(targets[0]?.title, 'Synthetic collection / A01');
  assert.equal(targets[0]?.path, '/art/collections/example-collection/#image-example-collection-a01');
  assert.deepEqual(collectionImageTargets({ ...collection, gallery: [...collection.gallery].reverse() }).reverse(), targets);
  for (const publication of ['draft', 'review'] as const) assert.deepEqual(collectionImageTargets({ ...collection, publication }), []);
  assert.deepEqual(collectionImageTargets({ ...collection, facts_verified: false }), []);
  assert.equal(collectionImageTargets({ ...collection, gallery: [{ ...collection.gallery[0]!, permission: 'restricted' }] })[0], undefined);
  assert.throws(() => collectionImageTargets({ ...collection, gallery: [collection.gallery[0]!, collection.gallery[0]!] }), /duplicate/);
});
