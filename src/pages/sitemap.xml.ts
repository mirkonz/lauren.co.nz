import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Configure the canonical site URL.');
  const films = await getCollection('film', ({ data }) => data.publication === 'published' && data.facts_verified);
  const collections = await getCollection('collections', ({ data }) => data.publication === 'published' && data.facts_verified);
  // Holding pages, unimplemented artwork/practice routes and the 404 are omitted.
  const paths = ['/', '/film/', '/art/', '/art/collections/',
    ...films.map(({ data }) => `/film/projects/${data.url_slug}/`),
    ...collections.map(({ data }) => `/art/collections/${data.url_slug}/`),
  ].sort();
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const urls = paths.map((path) => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
