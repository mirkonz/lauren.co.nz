import { mkdir, writeFile } from 'node:fs/promises';
import { loadPortfolio } from './load-portfolio';
import { collectionImageTargets } from '../src/lib/collection-enquiries';
import { enquiryCatalogue } from '../src/lib/enquiries';

const portfolio = loadPortfolio();
const settings = portfolio.settings.find(({ data }) => data.key === 'site');
if (!settings) throw new Error('Site settings required for enquiry catalogue.');
const catalogue = [
  ...enquiryCatalogue(portfolio.artworks.map(({ data }) => data), settings.data),
  ...portfolio.collections.flatMap(({ data }) => collectionImageTargets(data).filter((target) => target !== undefined)),
];
if (new Set(catalogue.map(({ id }) => id)).size !== catalogue.length) throw new Error('Duplicate canonical enquiry reference.');
// Kept outside dist: a future authorised Function bundle must consume this build artifact.
await mkdir('.generated', { recursive: true });
await writeFile('.generated/enquiry-catalogue.json', JSON.stringify(catalogue, null, 2) + '\n');
console.log(`Generated server-only enquiry catalogue: ${catalogue.length} artwork/image references.`);
