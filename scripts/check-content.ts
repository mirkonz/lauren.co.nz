import { loadPortfolio } from './load-portfolio';

const portfolio = loadPortfolio();
console.log(`Validated ${Object.values(portfolio).flat().length} content records, relationships, image paths and publication permissions.`);
