import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export default function useCategories(shopId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!shopId) return;

    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order', { ascending: true });

      if (!error) setCategories(data || []);
      setLoading(false);
    }

    fetchCategories();
  }, [shopId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { categories, loading, refetch };
}