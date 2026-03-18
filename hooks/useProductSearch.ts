'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchProducts } from '@/lib/stock/matcher';
import type { Product } from '@/types';

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (data) setProducts(data);
      setLoading(false);
    }

    fetchProducts();
  }, [supabase]);

  const results = useMemo(() => {
    return searchProducts(query, products);
  }, [query, products]);

  return { results, allProducts: products, loading };
}
