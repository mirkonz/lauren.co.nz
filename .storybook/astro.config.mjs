import { defineConfig } from 'astro/config';
import base from '../astro.config.mjs';

export default defineConfig({
  ...base,
  integrations: [{
    name: 'enquiry-story-fixture',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        for (const state of ['fixture', 'similar', 'commission', 'disabled']) {
          injectRoute({ pattern: `/__enquiry-${state}/`, entrypoint: './tests/fixtures/enquiry.astro' });
        }
      },
    },
  }],
});
