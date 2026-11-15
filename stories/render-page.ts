import { expect, waitFor, within } from 'storybook/test';
import { enhanceParallax } from '../src/lib/parallax';

let dispose: (() => void) | undefined;
export function disposeRenderedPage(): void { dispose?.(); dispose = undefined; }

export function renderPage(html: string, textScale = 100): HTMLElement {
  const page = new DOMParser().parseFromString(html, 'text/html');
  if (!page.querySelector('main#main') || !page.querySelector('h1')) {
    throw new Error('Expected an Astro-built page with a main landmark and heading.');
  }
  // innerHTML cannot run Astro's bootstrap. Only the reviewed site module is
  // removed; stories mount the same controller and reject any other script.
  const scripts = [...page.querySelectorAll('script')];
  if (scripts.length !== 1 || scripts[0]?.type !== 'module' ||
    !/^\/_astro\/SiteEnhancement\.astro_astro_type_script_index_0_lang\.[\w-]+\.js$/.test(scripts[0]?.getAttribute('src') ?? '')) {
    throw new Error('Review changed site scripts before rendering stories.');
  }
  scripts[0].remove();
  disposeRenderedPage();
  document.documentElement.lang = page.documentElement.lang;
  document.documentElement.dataset.theme = page.documentElement.dataset.theme;
  document.documentElement.style.fontSize = `${textScale}%`;
  document.body.classList.toggle('is-landing', page.body.classList.contains('is-landing'));
  const wrapper = document.createElement('div');
  wrapper.dataset.portfolioStory = '';
  wrapper.innerHTML = page.body.innerHTML;
  dispose = enhanceParallax(wrapper);
  return wrapper;
}

export async function checkPage(canvasElement: HTMLElement): Promise<void> {
  canvasElement.style.display = 'contents';
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  const main = canvas.getByRole('main');
  const skip = canvas.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toHaveAttribute('href', '#main');
  await expect(main).toHaveAttribute('id', 'main');
  await expect(main).toHaveAttribute('tabindex', '-1');
  skip.focus();
  await expect(skip).toHaveFocus();
  // Fragment navigation leaves Vitest's frame. Check focusability here;
  // actual route/fragment activation remains a separate integration check.
  main.focus();
  await expect(main).toHaveFocus();
  // Keep stories inside Storybook while checking the real destination contract.
  const landing = document.body.classList.contains('is-landing');
  const links = landing ? ['About', 'Contact'] : ['Film', 'Art', 'About', 'Contact'];
  const expected = landing ? ['/about/', '/contact/'] : ['/film/', '/art/', '/about/', '/contact/'];
  await expect(canvas.getByRole('link', { name: 'Lauren May Stewart' })).toHaveClass('wordmark');
  await expect(canvas.getByRole('contentinfo')).not.toHaveTextContent('Lauren May Stewart');
  if (landing) {
    for (const label of ['Film', 'Art']) {
      await expect(canvas.getByRole('link', { name: label })).toHaveClass('world');
    }
    await expect(canvasElement.querySelector('.split')).not.toHaveTextContent(/01|02|Enter Film|Enter Art/);
  }
  const groups = [...canvasElement.querySelectorAll<HTMLElement>('[data-section-decor]')];
  await expect(groups).toHaveLength(landing ? 2 : 1);
  for (const group of groups) {
    await expect(getComputedStyle(group).position).toBe('fixed');
    await expect(getComputedStyle(group).pointerEvents).toBe('none');
    await expect(group).toHaveAttribute('aria-hidden', 'true');
    await expect(group.querySelectorAll('.motif-layer')).toHaveLength(3);
  }
  const layers = [...canvasElement.querySelectorAll<HTMLElement>('[data-parallax-depth]')];
  window.scrollTo(0, 0);
  await waitFor(() => {
    for (const layer of layers) expect(Number.parseFloat(layer.style.getPropertyValue('--parallax-y')) || 0).toBe(0);
  });
  const navigation = within(canvas.getByRole('navigation', { name: 'Main navigation' }));
  for (const [index, label] of links.entries()) {
    await expect(navigation.getByRole('link', { name: label }))
      .toHaveAttribute('href', expected[index]);
  }
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  for (const image of canvasElement.querySelectorAll('img')) {
    image.scrollIntoView({ block: 'center' });
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
    await expect(image).toHaveAttribute('width');
    await expect(image).toHaveAttribute('height');
    await expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(Number(image.getAttribute('width')) + 1);
  }
  const previousScroll = window.scrollY;
  window.scrollTo(0, document.documentElement.scrollHeight);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.documentElement.scrollHeight > window.innerHeight + 1) await expect(window.scrollY).toBeGreaterThan(0);
  await waitFor(() => {
    const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, window.scrollY / range));
    for (const layer of layers) {
      const expected = reduced ? 0 : Math.max(-72, Math.min(72, progress * 720 * Number(layer.dataset.parallaxDepth)));
      expect(Number.parseFloat(layer.style.getPropertyValue('--parallax-y')) || 0).toBeCloseTo(expected, 1);
      const transform = getComputedStyle(layer).transform;
      const actual = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
      expect(actual).toBeCloseTo(expected, 1);
    }
  });
  window.scrollTo(0, previousScroll);
  const cards = canvasElement.querySelectorAll('.portfolio-card img');
  for (const [index, image] of cards.entries()) {
    await expect(image).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy');
  }
}
