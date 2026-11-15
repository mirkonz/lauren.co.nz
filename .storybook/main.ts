import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  staticDirs: [{ from: './generated/site/_astro', to: '/_astro' }],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  core: { disableTelemetry: true },
  viteFinal: (config) => ({
    ...config,
    publicDir: false,
    server: {
      ...config.server,
      fs: {
        ...config.server?.fs,
        deny: [
          '.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.dev.vars*',
          '**/.generated/**', '**/source-assets/**', '**/docs/**', '**/.audit-cache/**', '**/public/**',
          '**/.storybook/generated/site/admin/**',
        ],
      },
    },
  }),
};

export default config;
