import type { Preview } from '@storybook/html-vite';
import '../src/styles/site.css';
import './preview.css';

const preview: Preview = {
  beforeEach: () => {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme');
    const language = root.lang;
    const fontSize = root.style.fontSize;
    const landing = document.body.classList.contains('is-landing');
    return () => {
      if (theme === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', theme);
      root.lang = language;
      root.style.fontSize = fontSize;
      document.body.classList.toggle('is-landing', landing);
    };
  },
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: '[data-portfolio-story]',
      // These are complete pages, so keep landmark checks enabled.
      config: { rules: [{ id: 'region', enabled: true }] },
    },
    viewport: {
      options: {
        narrow: { name: 'Narrow (320px)', styles: { width: '320px', height: '900px' } },
        phone: { name: 'Phone (390px)', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet (768px)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1440px)', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
};

export default preview;
