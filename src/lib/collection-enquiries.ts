import type { RecordData } from './content-schemas';
import type { EnquiryTarget } from './enquiries';

/** Image references identify the displayed source, not an artwork or sale state. */
export function collectionImageTargets(collection: RecordData<'collections'>): (EnquiryTarget | undefined)[] {
  if (collection.publication !== 'published' || !collection.facts_verified) return [];
  const ids = new Set<string>();
  return collection.gallery.map((image) => {
    if (image.permission !== 'approved' || image.decorative || !image.alt.trim()) return undefined;
    if (typeof image.file !== 'string') throw new Error('Build image references from validated entry-relative source paths.');
    const reference = image.file.replace(/^\.\//, '').replace(/\.[^.]+$/, '').replaceAll('/', '-');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reference)) throw new Error(`Use a stable lowercase image filename: ${image.file}`);
    const id = `image-${collection.key}-${reference}`;
    if (id.length > 100 || ids.has(id)) throw new Error(`Invalid or duplicate image reference: ${id}`);
    ids.add(id);
    return {
      id, title: `${collection.title} / ${reference.toUpperCase()}`,
      path: `/art/collections/${collection.url_slug}/#${id}`, kind: 'image',
    };
  });
}
