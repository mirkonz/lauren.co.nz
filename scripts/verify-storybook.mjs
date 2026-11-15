import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const root = new URL('../storybook-static/', import.meta.url);
const paths = await readdir(root, { recursive: true });
for (const path of paths) {
  assert(!/(?:^|\/)(?:admin|source-assets|docs|\.audit-cache|\.storybook|generated)(?:\/|$)/.test(path),
    `Non-story content leaked into Storybook: ${path}`);
}
const index = JSON.parse(await readFile(new URL('index.json', root), 'utf8'));
const stories = Object.values(index.entries).filter(({ type }) => type === 'story');
assert.equal(stories.length, 40, 'Expected 24 page examples and 16 enquiry examples.');
assert(paths.some((path) => path.startsWith('_astro/') && /\.webp$/.test(path)), 'Optimised story images missing.');
for (const file of ['index.html', 'iframe.html']) {
  const html = await readFile(new URL(file, root), 'utf8');
  assert(html.includes('noindex,nofollow'), `${file}: local Storybook must remain noindex.`);
}
console.log('Storybook output verified: 40 stories, optimised images, noindex and no CMS/source archive.');
