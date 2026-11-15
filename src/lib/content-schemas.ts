import { z } from 'astro/zod';

const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a stable lowercase reference ID.');
const webUrl = z.url({ protocol: /^https?$/ });
const seo = z.object({ title: z.string().optional(), description: z.string().optional() }).optional();
const base = {
  key,
  url_slug: key,
  title: z.string().min(1),
  publication: z.enum(['draft', 'review', 'published']).default('draft'),
  facts_verified: z.boolean().default(false),
  source_url: webUrl.optional(),
  seo,
};

/** Sveltia writes bare entry-relative paths; hand-authored ./ paths are equivalent. */
export const entryImagePath = z.string().refine((file) => {
  if (/[\\:\u0000-\u001f?#]/.test(file)) return false;
  const parts = file.replace(/^\.\//, '').split('/');
  return parts.every((part) => part !== '' && part !== '.' && part !== '..');
}, 'Images must stay inside their entry folder, using a relative path such as image.jpg or ./image.jpg.');

export function createContentSchemas<T extends z.ZodType>(image: T) {
  const media = z.object({
    file: image,
    alt: z.string().default(''),
    decorative: z.boolean().default(false),
    caption: z.string().optional(),
    credit: z.string().optional(),
    permission: z.enum(['unreviewed', 'approved', 'restricted']).default('unreviewed'),
  });
  const gallery = z.array(media).default([]);
  const publicChecks = (
    data: { publication: string; facts_verified: boolean; cover?: z.infer<typeof media> | undefined; gallery: z.infer<typeof gallery> },
    ctx: z.RefinementCtx,
  ) => {
    if (data.publication !== 'published') return;
    if (!data.facts_verified) ctx.addIssue({ code: 'custom', path: ['facts_verified'], message: 'Verify facts before publishing.' });
    const check = (item: z.infer<typeof media>, path: (string | number)[]) => {
      if (item.permission !== 'approved') ctx.addIssue({ code: 'custom', path: [...path, 'permission'], message: 'Publication permission is required.' });
      if (!item.decorative && !item.alt.trim()) ctx.addIssue({ code: 'custom', path: [...path, 'alt'], message: 'Describe this image before publishing.' });
    };
    if (data.cover) check(data.cover, ['cover']);
    data.gallery.forEach((item, i) => check(item, ['gallery', i]));
  };
  const visual = { cover: media.optional(), gallery };
  const film = z.object({
    ...base, ...visual,
    year_label: z.string().optional(),
    release_year: z.number().int().min(1888).optional(),
    roles: z.array(z.string().min(1)).min(1),
    credits: z.array(z.object({ label: z.string().min(1), name: z.string().min(1) })).default([]),
    categories: z.array(z.enum(['on-set', 'scenic', 'props', 'fabrication', 'theatre'])).default([]),
  }).superRefine(publicChecks);
  const practice = z.object({ ...base, ...visual, films: z.array(key).default([]) }).superRefine(publicChecks);
  const artworks = z.object({
    ...base, ...visual,
    year_label: z.string().optional(), medium: z.string().optional(), dimensions: z.string().optional(),
    availability: z.enum(['unknown', 'available', 'price-on-request', 'sold', 'not-for-sale', 'commission']).default('unknown'),
    enquiries_enabled: z.boolean().default(false),
    similar_work_enquiries: z.boolean().default(false),
    show_price: z.boolean().default(false),
    price: z.object({ amount: z.number().positive(), currency: z.string().regex(/^[A-Z]{3}$/) }).optional(),
  }).superRefine((data, ctx) => {
    publicChecks(data, ctx);
    if (data.publication === 'published' && !data.cover) ctx.addIssue({ code: 'custom', path: ['cover'], message: 'An artwork needs its main image.' });
    if (data.show_price && !data.price) ctx.addIssue({ code: 'custom', path: ['price'], message: 'Set a positive price and currency before showing it.' });
    if (data.enquiries_enabled && ['unknown', 'not-for-sale'].includes(data.availability)) ctx.addIssue({ code: 'custom', path: ['enquiries_enabled'], message: 'This availability does not allow purchase enquiries.' });
    if (data.enquiries_enabled && data.availability === 'sold' && !data.similar_work_enquiries) ctx.addIssue({ code: 'custom', path: ['similar_work_enquiries'], message: 'Enable similar-work enquiries for a sold artwork.' });
  });
  const collections = z.object({ ...base, ...visual, year_label: z.string().optional(), artworks: z.array(key).default([]) }).superRefine(publicChecks);
  const pages = z.object({
    ...base,
    kind: z.enum(['about', 'contact', 'cv']),
    skills: z.array(z.object({ title: z.string().min(1), items: z.array(z.string().min(1)) })).default([]),
    education: z.array(z.object({ institution: z.string().min(1), qualification: z.string().min(1), date_label: z.string().optional(), details: z.array(z.string()).default([]) })).default([]),
    experience: z.array(z.object({ organisation: z.string().min(1), role: z.string().min(1), date_label: z.string().optional() })).default([]),
    languages: z.array(z.object({ name: z.string().min(1), proficiency: z.string().min(1) })).default([]),
  }).superRefine((data, ctx) => {
    if (data.publication === 'published' && !data.facts_verified) ctx.addIssue({ code: 'custom', path: ['facts_verified'], message: 'Verify facts before publishing.' });
  });
  const settings = z.object({
    key: z.literal('site'),
    professional_name: z.string().min(1),
    name_confirmed: z.boolean().default(false),
    contact_email: z.email().optional(),
    social_links: z.array(z.object({ label: z.string().min(1), url: webUrl })).default([]),
    default_description: z.string().min(1),
    featured_film: z.array(key).default([]),
    featured_artworks: z.array(key).default([]),
    commissions_enabled: z.boolean().default(false),
    sold_enquiries_enabled: z.boolean().default(false),
  });
  return { film, practice, artworks, collections, pages, settings };
}

export type Schemas = ReturnType<typeof createContentSchemas>;
export type RecordData<T extends keyof Schemas> = z.infer<Schemas[T]>;
export type ContentRecord<T extends keyof Schemas> = { id: string; data: RecordData<T> };
