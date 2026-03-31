import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export default function useProducts(shopId, categoryId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let query = supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)     
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError);
      setProducts([]);
    } else {
      setProducts(data || []);
      setError(null);
    }
    setLoading(false);
  }, [shopId, categoryId]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      if (!mounted) return;
      await fetchProducts();
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [fetchProducts]);

  return { products, loading, error, setProducts, refetch: fetchProducts };
}