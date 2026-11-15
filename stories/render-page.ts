import { expect, waitFor, within } from 'storybook/test';

export function renderPage(html: string, textScale = 100): HTMLElement {
  const page = new DOMParser().parseFromString(html, 'text/html');
  if (!page.querySelector('main#main') || !page.querySelector('h1')) {
    throw new Error('Expected an Astro-built page with a main landmark and heading.');
  }
  if (page.body.querySelector('script')) {
    throw new Error('Page stories currently support static HTML only; review script behaviour first.');
  }
  document.documentElement.lang = page.documentElement.lang;
  document.documentElement.dataset.theme = page.documentElement.dataset.theme;
  document.documentElement.style.fontSize = `${textScale}%`;
  document.body.classList.toggle('is-landing', page.body.classList.contains('is-landing'));
  const wrapper = document.createElement('div');
  wrapper.dataset.portfolioStory = '';
  wrapper.innerHTML = page.body.innerHTML;
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
  const expected = ['/film/', '/art/', '/about/', '/contact/'];
  const navigation = within(canvas.getByRole('navigation', { name: 'Main navigation' }));
  for (const [index, label] of ['Film', 'Art', 'About', 'Contact'].entries()) {
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
  const cards = canvasElement.querySelectorAll('.portfolio-card img');
  for (const [index, image] of cards.entries()) {
    await expect(image).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy');
  }
}
