import Fuse from 'fuse.js';
import type { Product } from '@/types';

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.6 },
    { name: 'aliases', weight: 0.3 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export function findBestMatch(
  query: string,
  products: Product[]
): { product: Product; score: number } | null {
  const fuse = new Fuse(products, fuseOptions);
  const results = fuse.search(query);

  if (results.length === 0) return null;

  return {
    product: results[0].item,
    score: 1 - (results[0].score ?? 0),
  };
}

export function searchProducts(
  query: string,
  products: Product[],
  limit = 5
): Product[] {
  if (!query.trim()) return products.slice(0, limit);

  const fuse = new Fuse(products, fuseOptions);
  return fuse.search(query).slice(0, limit).map(r => r.item);
}
