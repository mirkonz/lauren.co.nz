import assert from 'node:assert/strict';

// Deliberately fixed to loopback: this test must never submit to a live mailbox.
const base = 'http://127.0.0.1:8788';
for (const [path, expected] of [
  ['/', 200], ['/film/', 200], ['/art/', 200], ['/about/', 200], ['/contact/', 200], ['/film/cv/', 200],
  ['/film/projects/blade-runner-2049/', 200], ['/art/collections/', 200], ['/art/collections/artificial-landscapes/', 200],
  ['/film/projects/mulan/', 200], ['/art/collections/oil-painting-landscapes/', 200],
  ['/film/projects/pearl/', 404], ['/art/collections/portrait-drawings/', 404],
  ['/admin/', 200], ['/admin/config.yml', 200], ['/admin/sveltia-cms.js', 200],
  ['/docs/audit/assets.json', 404], ['/source-assets/wix/test.jpg', 404], ['/__image-check/', 404],
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, expected, path);
  if (expected === 200) assert(response.headers.get('X-Robots-Tag')?.includes('noindex'), path);
  console.log(path, response.status);
}
for (const [method, expected] of [['GET', 405], ['POST', 503]]) {
  const response = await fetch(base + '/api/enquiry', method === 'POST'
    ? { method, headers: { 'Content-Type': 'application/json' }, body: '{}' }
    : { method });
  assert.equal(response.status, expected);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const data = await response.json();
  assert.equal(typeof data.error, 'string');
  assert.equal(data.success, undefined);
  console.log('Enquiry', method, response.status);
}
console.log('Local Pages routing and disabled-enquiry boundary passed.');
