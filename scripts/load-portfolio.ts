import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { createContentSchemas, entryImagePath } from '../src/lib/content-schemas';
import { validatePortfolio } from '../src/lib/content-integrity';

const schemas = createContentSchemas(entryImagePath);

function checkFiles(value: unknown, entryFile: string): void {
  if (Array.isArray(value)) {
    value.forEach((item) => checkFiles(item, entryFile));
  } else if (value && typeof value === 'object') {
    if ('file' in value && typeof value.file === 'string' && !existsSync(join(dirname(entryFile), value.file))) {
      throw new Error(`${entryFile}: missing image ${value.file}`);
    }
    Object.values(value).forEach((item) => checkFiles(item, entryFile));
  }
}

function load<T>(folder: string, schema: z.ZodType<T>) {
  const base = join('src/content', folder);
  return readdirSync(base, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('/index.md')).map((file) => {
    const path = join(base, file);
    const source = readFileSync(path, 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (!frontmatter) throw new Error(`${path}: missing YAML frontmatter`);
    const raw: unknown = parse(frontmatter);
    const data = schema.parse(raw);
    checkFiles(data, path);
    return { id: relative(base, dirname(path)).replaceAll('\\', '/'), data };
  });
}

export function loadPortfolio() {
  const portfolio = {
    film: load('film', schemas.film),
    practice: load('film-practice', schemas.practice),
    artworks: load('artworks', schemas.artworks),
    collections: load('art-collections', schemas.collections),
    pages: load('pages', schemas.pages),
    settings: load('settings', schemas.settings),
  };
  validatePortfolio(portfolio);
  return portfolio;
}
