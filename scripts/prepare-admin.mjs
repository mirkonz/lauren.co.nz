import { copyFile, mkdir } from 'node:fs/promises';

await mkdir(new URL('../public/admin/', import.meta.url), { recursive: true });
await copyFile(
  new URL('../node_modules/@sveltia/cms/dist/sveltia-cms.js', import.meta.url),
  new URL('../public/admin/sveltia-cms.js', import.meta.url),
);
