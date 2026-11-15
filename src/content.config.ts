import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { createContentSchemas } from './lib/content-schemas';

const load = (folder: string) => glob({
  pattern: '**/index.md',
  base: `./src/content/${folder}`,
  generateId: ({ entry }) => entry.split('/')[0] ?? entry,
});

export const collections = {
  film: defineCollection({ loader: load('film'), schema: ({ image }) => createContentSchemas(image()).film }),
  practice: defineCollection({ loader: load('film-practice'), schema: ({ image }) => createContentSchemas(image()).practice }),
  artworks: defineCollection({ loader: load('artworks'), schema: ({ image }) => createContentSchemas(image()).artworks }),
  collections: defineCollection({ loader: load('art-collections'), schema: ({ image }) => createContentSchemas(image()).collections }),
  pages: defineCollection({ loader: load('pages'), schema: ({ image }) => createContentSchemas(image()).pages }),
  settings: defineCollection({ loader: load('settings'), schema: ({ image }) => createContentSchemas(image()).settings }),
};
