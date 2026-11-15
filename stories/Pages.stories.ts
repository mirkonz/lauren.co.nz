import type { Meta, StoryObj } from '@storybook/html-vite';
import { expect } from 'storybook/test';
import landing from '../.storybook/generated/site/index.html?raw';
import film from '../.storybook/generated/site/film/index.html?raw';
import art from '../.storybook/generated/site/art/index.html?raw';
import about from '../.storybook/generated/site/about/index.html?raw';
import contact from '../.storybook/generated/site/contact/index.html?raw';
import cv from '../.storybook/generated/site/film/cv/index.html?raw';
import notFound from '../.storybook/generated/site/404.html?raw';
import collections from '../.storybook/generated/site/art/collections/index.html?raw';
import filmProject from '../.storybook/generated/site/film/projects/blade-runner-2049/index.html?raw';
import artCollection from '../.storybook/generated/site/art/collections/artificial-landscapes/index.html?raw';
import mulan from '../.storybook/generated/site/film/projects/mulan/index.html?raw';
import landscapes from '../.storybook/generated/site/art/collections/oil-painting-landscapes/index.html?raw';
import { checkPage, renderPage } from './render-page';

const meta = {
  title: 'Portfolio/Pages',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement, globals, parameters }) => {
    await checkPage(canvasElement);
    if (parameters.galleryCount !== undefined) {
      await expect(canvasElement.querySelectorAll('.image-gallery img')).toHaveLength(parameters.galleryCount);
    }
    if (globals.viewport?.value === 'narrow') {
      await expect(window.innerWidth).toBe(320);
    }
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Landing: Story = { render: () => renderPage(landing) };
export const Film: Story = { render: () => renderPage(film) };
export const Art: Story = { render: () => renderPage(art) };
export const About: Story = { render: () => renderPage(about) };
export const Contact: Story = { render: () => renderPage(contact) };
export const CV: Story = { render: () => renderPage(cv) };
export const NotFound: Story = { render: () => renderPage(notFound) };
export const Collections: Story = { render: () => renderPage(collections) };
export const BladeRunner: Story = { render: () => renderPage(filmProject), parameters: { galleryCount: 4 } };
export const ArtificialLandscapes: Story = { render: () => renderPage(artCollection), parameters: { galleryCount: 6 } };
export const Mulan: Story = { render: () => renderPage(mulan), parameters: { galleryCount: 4 } };
export const OilPaintingLandscapes: Story = { render: () => renderPage(landscapes), parameters: { galleryCount: 6 } };
export const MulanNarrow: Story = { ...Mulan, globals: { viewport: { value: 'narrow', isRotated: false } } };
export const LandscapesNarrow: Story = { ...OilPaintingLandscapes, globals: { viewport: { value: 'narrow', isRotated: false } } };
export const MulanLargeText: Story = { ...MulanNarrow, render: () => renderPage(mulan, 200) };
export const LandscapesLargeText: Story = { ...LandscapesNarrow, render: () => renderPage(landscapes, 200) };
export const FilmProjectNarrow: Story = {
  ...BladeRunner, globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const ArtCollectionNarrow: Story = {
  ...ArtificialLandscapes, globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const FilmProjectLargeText: Story = {
  ...FilmProjectNarrow, render: () => renderPage(filmProject, 200),
};
export const ArtCollectionLargeText: Story = {
  ...ArtCollectionNarrow, render: () => renderPage(artCollection, 200),
};

export const LandingNarrow: Story = {
  render: () => renderPage(landing),
  globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const LandingLargeText: Story = {
  render: () => renderPage(landing, 200),
  globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const FilmLargeText: Story = {
  render: () => renderPage(film, 200),
  globals: { viewport: { value: 'narrow', isRotated: false } },
};
export const ArtLargeText: Story = {
  render: () => renderPage(art, 200),
  globals: { viewport: { value: 'narrow', isRotated: false } },
};
