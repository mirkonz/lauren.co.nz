import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = join(root, '.audit-cache');
await mkdir(cache, { recursive: true });
const sandbox = await mkdtemp(join(cache, 'publication-build-'));

// Build a disposable copy: never introduce test media into the editorial worktree.
try {
  for (const path of ['src', 'public', 'scripts', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
    await cp(join(root, path), join(sandbox, path), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(sandbox, 'node_modules'), 'dir');
  const build = () => {
    const result = spawnSync('npm', ['run', 'build'], {
      cwd: sandbox, encoding: 'utf8', timeout: 60_000, maxBuffer: 4 * 1024 * 1024,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null, `Build interrupted: ${result.signal}`);
    return { status: result.status, output: result.stdout + result.stderr };
  };
  const baseline = build();
  assert.equal(baseline.status, 0, baseline.output);
  console.log('Production baseline built successfully in an isolated copy.');

  const folder = join(sandbox, 'src/content/film-practice/publication-proof');
  await mkdir(folder);
  await cp(join(root, 'tests/fixtures/source-image.jpg'), join(folder, 'proof.jpg'));
  const image = { file: 'proof.jpg', alt: 'Isolated publication boundary fixture.', permission: 'approved' };
  const base = { key: 'publication-proof', url_slug: 'publication-proof', title: 'Publication boundary fixture' };
  const cases = [
    ['draft cover', { ...base, cover: image }, /draft media can be emitted/],
    ['review gallery', { ...base, publication: 'review', gallery: [image] }, /draft media can be emitted/],
    ['restricted published image', { ...base, publication: 'published', facts_verified: true, cover: { ...image, permission: 'restricted' } }, /Publication permission is required/],
    ['unverified published facts', { ...base, publication: 'published', cover: image }, /Verify facts before publishing/],
  ];
  // A failed command must not be mistaken for a fresh deployable build.
  await rm(join(sandbox, 'dist'), { recursive: true });
  for (const [label, data, expected] of cases) {
    await writeFile(join(folder, 'index.md'), `---\n${JSON.stringify(data, null, 2)}\n---\n`);
    const result = build();
    assert.notEqual(result.status, 0, `${label}: unsafe production build succeeded.`);
    assert.match(result.output, expected, `${label}: failed for an unexpected reason.\n${result.output}`);
    await assert.rejects(readFile(join(sandbox, 'dist/index.html')), { code: 'ENOENT' });
    console.log(`Production rejected ${label} before emitting a site.`);
  }
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
