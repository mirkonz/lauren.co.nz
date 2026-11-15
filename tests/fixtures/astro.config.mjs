import { defineConfig } from 'astro/config';
import base from '../../astro.config.mjs';

// A separate output proves image optimisation without publishing unapproved test media.
export default defineConfig({
  ...base,
  outDir: '.verification-dist',
  integrations: [{
    name: 'local-image-proof',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => injectRoute({
        pattern: '/__image-check/', entrypoint: './tests/fixtures/image-check.astro',
      }),
    },
  }],
});
