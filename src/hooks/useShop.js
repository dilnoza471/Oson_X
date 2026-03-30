import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function useShop(shopId) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId) {
      setShop(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchShop() {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .maybeSingle();

      if (!mounted) return;
      if (fetchError) {
        setError(fetchError);
      } else if (!data) {
        setError({ message: 'Shop not found.' });
      } else {
        setShop(data);
      }
      setLoading(false);
    }

    fetchShop();

    return () => {
      mounted = false;
    };
  }, [shopId]);

  return { shop, loading, error };
}
