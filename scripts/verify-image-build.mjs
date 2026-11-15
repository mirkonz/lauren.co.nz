import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
const root = new URL('../.verification-dist/', import.meta.url);
const html = await readFile(new URL('__image-check/index.html', root), 'utf8');
assert(html.includes('srcset='), 'Responsive image srcset is missing.');
assert(html.includes('width="747"') && html.includes('height="504"'), 'Intrinsic image dimensions are missing.');
const images = (await readdir(new URL('_astro/', root))).filter((name) => name.endsWith('.webp'));
assert(images.length >= 2, 'Expected at least two optimised image widths.');
for (const image of images) {
  const bytes = await readFile(new URL('_astro/'+image, root));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
}
console.log(`Image proof passed: ${images.length} WebP variants, srcset and intrinsic dimensions.`);
