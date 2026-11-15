import { z } from 'astro/zod';
import type { RecordData } from './content-schemas';

export interface EnquiryTarget {
  id: string;
  title: string;
  path: string;
  kind: 'purchase' | 'similar' | 'commission' | 'image';
}

export function enquiryCatalogue(
  artworks: readonly RecordData<'artworks'>[],
  settings: Pick<RecordData<'settings'>, 'commissions_enabled' | 'sold_enquiries_enabled'>,
): EnquiryTarget[] {
  const ids = new Set<string>();
  return artworks.flatMap((work): EnquiryTarget[] => {
    if (ids.has(work.key)) throw new Error(`Duplicate artwork ID: ${work.key}`);
    ids.add(work.key);
    const media = [work.cover, ...work.gallery];
    if (work.publication !== 'published' || !work.facts_verified || !work.cover || !work.enquiries_enabled ||
      media.some((image) => !image || image.permission !== 'approved' || (!image.decorative && !image.alt.trim()))) return [];
    let kind: EnquiryTarget['kind'];
    switch (work.availability) {
      case 'available': case 'price-on-request': kind = 'purchase'; break;
      case 'sold':
        if (!work.similar_work_enquiries || !settings.sold_enquiries_enabled) return [];
        kind = 'similar'; break;
      case 'commission':
        if (!settings.commissions_enabled) return [];
        kind = 'commission'; break;
      default: return [];
    }
    return [{ id: work.key, title: work.title, path: `/art/works/${work.url_slug}/`, kind }];
  });
}

const headerText = (max: number) => z.string().max(max).refine((value) => !/[\u0000-\u001f\u007f]/.test(value), 'Remove control characters.');
export const enquiryPayload = z.strictObject({
  artwork_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  name: headerText(100).pipe(z.string().trim().min(1, 'Enter your name.')),
  email: headerText(254).pipe(z.string().trim().pipe(z.email('Enter a valid email address.'))),
  message: z.string().max(5000, 'Keep your message to 5,000 characters.').refine((value) => !value.includes('\0')).pipe(z.string().trim().min(1, 'Enter your message.')),
  turnstile_token: headerText(2048).pipe(z.string().trim().min(1, 'Complete the verification before sending.')),
  company: z.literal(''),
});
export type EnquiryPayload = z.infer<typeof enquiryPayload>;
