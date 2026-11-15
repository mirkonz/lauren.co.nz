import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const paths = await readdir(root, { recursive: true });
for (const name of paths) {
  assert(!/(?:^|\/)(?:docs|source-assets|tests|scripts|stories|\.storybook|storybook-static|\.generated|\.audit-cache)(?:\/|$)/.test(name), `Source evidence or Storybook leaked into build: ${name}`);
  assert(!name.includes('__enquiry-') && !name.includes('enquiry-catalogue'), `Enquiry test/server artifact leaked into build: ${name}`);
  assert(!name.includes('source-image'), `Unapproved draft image leaked into build: ${name}`);
}
const index = await readFile(new URL('index.html', root), 'utf8');
assert(index.includes('noindex,nofollow'), 'Prelaunch pages must be noindex.');
assert(!index.includes('East of Eden'), 'Draft film content leaked into build.');
assert(!index.includes('Artificial Landscapes'), 'Draft art content leaked into build.');
const portfolioPages = ['index.html', 'film/index.html', 'art/index.html', 'about/index.html', 'contact/index.html', 'film/cv/index.html', '404.html', 'art/collections/index.html', 'film/projects/blade-runner-2049/index.html', 'art/collections/artificial-landscapes/index.html', 'film/projects/mulan/index.html', 'art/collections/oil-painting-landscapes/index.html'];
for (const page of portfolioPages) {
  const html = await readFile(new URL(page, root), 'utf8');
  assert(html.includes('noindex,nofollow'), `${page}: prelaunch indexing boundary missing.`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/g) ?? [];
  if (page === '404.html') assert.equal(canonical.length, 0, '404 must not claim a canonical page.');
  else {
    const path = page === 'index.html' ? '/' : '/' + page.replace(/index\.html$/, '');
    assert.equal(canonical.length, 1, `${page}: expected one canonical.`);
    assert(canonical[0].includes(`https://lauren.co.nz${path}"`), `${page}: canonical address mismatch.`);
  }
  assert(html.includes('Lauren May Stewart'), `${page}: confirmed professional name missing.`);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${page}: expected one primary heading.`);
  assert.equal((html.match(/<main(?:\s|>)/g) ?? []).length, 1, `${page}: expected one main landmark.`);
  assert(html.includes('href="#main"') && html.includes('id="main"'), `${page}: skip link target missing.`);
  assert(!/wixstatic\.com|source-assets\/|\[IMAGES MISSING\]/.test(html), `${page}: unapproved source content leaked.`);
  for (const [, href] of html.matchAll(/href="(\/[^"?#]*)"/g)) {
    const target = href.endsWith('/') ? href.slice(1) + 'index.html' : href.slice(1);
    assert(paths.includes(target), `${page}: broken local link ${href}`);
  }
}
for (const [page, count] of [['film/projects/blade-runner-2049/index.html', 4], ['art/collections/artificial-landscapes/index.html', 6], ['film/projects/mulan/index.html', 4], ['art/collections/oil-painting-landscapes/index.html', 6]]) {
  const html = await readFile(new URL(page, root), 'utf8');
  assert.equal((html.match(/<img\s/g) ?? []).length, count, `${page}: approved gallery count changed.`);
  assert(!/CV source claim|VES Award|Waikato Society of Arts|2016/.test(html), `${page}: unapproved source claim leaked.`);
  assert(!/<button|<form/.test(html), `${page}: unrequested interactive/enquiry controls appeared.`);
  for (const tag of html.matchAll(/<img\s[^>]*>/g)) {
    assert(/width="\d+"/.test(tag[0]) && /height="\d+"/.test(tag[0]), 'Gallery image must reserve intrinsic dimensions.');
    const width = Number(tag[0].match(/width="(\d+)"/)[1]);
    if (width > 480) assert(tag[0].includes('srcset='), 'Responsive image sources missing for a source wider than 480px.');
  }
}
assert(!paths.includes('film/projects/pearl/index.html'), 'Unapproved film route leaked.');
assert(!paths.includes('art/collections/portrait-drawings/index.html'), 'Unapproved collection route leaked.');
for (const page of ['film/index.html', 'art/index.html', 'art/collections/index.html']) {
  const html = await readFile(new URL(page, root), 'utf8');
  const images = [...html.matchAll(/<img\s[^>]*>/g)].map((match) => match[0]);
  assert.equal(images.length, 2, `${page}: expected two approved entries.`);
  assert(images[0].includes('loading="eager"') && images[1].includes('loading="lazy"'), `${page}: only the lead card should load eagerly.`);
}
assert.equal((index.match(/class="world world-/g) ?? []).length, 2, 'Landing needs two directly linked panels.');
assert(paths.includes('admin/config.yml'), 'CMS config is missing.');
assert(paths.includes('admin/sveltia-cms.js'), 'Pinned CMS bundle is missing. Run npm ci.');
console.log('Build boundaries verified: draft content and source archives excluded; CMS files present.');

const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedLocations = portfolioPages.filter((page) => !['about/index.html', 'contact/index.html', 'film/cv/index.html', '404.html'].includes(page))
  .map((page) => 'https://lauren.co.nz/' + (page === 'index.html' ? '' : page.replace(/index\.html$/, ''))).sort();
assert.deepEqual(locations, expectedLocations, 'Sitemap must contain exactly the implemented approved routes.');
assert(!sitemap.includes('<lastmod>'), 'Do not invent editorial update dates.');
const robots = await readFile(new URL('robots.txt', root), 'utf8');
const headers = await readFile(new URL('_headers', root), 'utf8');
assert(robots.includes('Disallow: /') && !/^Sitemap:/m.test(robots), 'Keep prelaunch crawler blocking.');
assert(headers.includes('X-Robots-Tag: noindex, nofollow'), 'Keep prelaunch indexing header.');
console.log('Canonical addresses and eight-route sitemap verified; prelaunch noindex remains.');
