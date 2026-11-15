import type { ContentRecord } from './content-schemas';

export type Portfolio = {
  film: ContentRecord<'film'>[];
  practice: ContentRecord<'practice'>[];
  artworks: ContentRecord<'artworks'>[];
  collections: ContentRecord<'collections'>[];
  pages: ContentRecord<'pages'>[];
  settings: ContentRecord<'settings'>[];
};

/** Validate all records, including drafts, so broken edits fail before publication. */
export function validatePortfolio(portfolio: Portfolio, options = { allowDraftMedia: false }): void {
  const allKeys = new Set<string>();
  for (const [collection, entries] of Object.entries(portfolio)) {
    const slugs = new Set<string>();
    for (const entry of entries) {
      if (entry.id !== entry.data.key) throw new Error(`${collection}/${entry.id}: folder must match stable reference ${entry.data.key}`);
      if (allKeys.has(entry.data.key)) throw new Error(`Duplicate reference ID: ${entry.data.key}`);
      allKeys.add(entry.data.key);
      if (!options.allowDraftMedia && 'publication' in entry.data && entry.data.publication !== 'published' && 'gallery' in entry.data && (entry.data.cover || entry.data.gallery.length)) {
        throw new Error(`${collection}/${entry.id}: draft media can be emitted by Astro; keep it in the source archive until publication is approved`);
      }
      if ('url_slug' in entry.data) {
        if (slugs.has(entry.data.url_slug)) throw new Error(`${collection}: duplicate URL slug ${entry.data.url_slug}`);
        slugs.add(entry.data.url_slug);
      }
    }
  }
  const settings = portfolio.settings[0];
  if (portfolio.settings.length !== 1 || settings?.id !== 'site') throw new Error('Exactly one site settings record is required.');
  const checkReferences = (
    owner: string,
    references: string[],
    targets: { data: { key: string; publication: string } }[],
    published: boolean,
  ) => {
    if (new Set(references).size !== references.length) throw new Error(`${owner}: duplicate references`);
    for (const key of references) {
      const target = targets.find((entry) => entry.data.key === key);
      if (!target) throw new Error(`${owner}: missing reference ${key}`);
      if (published && target.data.publication !== 'published') throw new Error(`${owner}: cannot publish a reference to draft/review ${key}`);
    }
  };
  for (const entry of portfolio.practice) checkReferences(entry.id, entry.data.films, portfolio.film, entry.data.publication === 'published');
  for (const entry of portfolio.collections) checkReferences(entry.id, entry.data.artworks, portfolio.artworks, entry.data.publication === 'published');
  checkReferences('Featured film', settings.data.featured_film, portfolio.film, true);
  checkReferences('Featured artworks', settings.data.featured_artworks, portfolio.artworks, true);
  for (const entry of portfolio.artworks) {
    if (entry.data.publication !== 'published' || !entry.data.enquiries_enabled) continue;
    if (entry.data.availability === 'commission' && !settings.data.commissions_enabled) throw new Error(`${entry.id}: commissions are disabled`);
    if (entry.data.availability === 'sold' && !settings.data.sold_enquiries_enabled) throw new Error(`${entry.id}: similar-work enquiries are disabled`);
  }
}
