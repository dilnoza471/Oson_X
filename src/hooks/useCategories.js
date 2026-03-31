import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export default function useCategories(shopId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!shopId) {
      setCategories([]);
      setError(null);
      setLoading(false);
      return;
    }

    async function fetchCategories() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order', { ascending: true });

      if (fetchError) {
        setCategories([]);
        setError(fetchError);
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    }

    fetchCategories();
  }, [shopId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { categories, loading, error, refetch };
}