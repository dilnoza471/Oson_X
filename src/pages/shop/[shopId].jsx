import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryTabs from '../../components/shop/CategoryTabs.jsx';
import ProductCard from '../../components/shop/ProductCard.jsx';
import useCategories from '../../hooks/useCategories.js';
import useProducts from '../../hooks/useProducts.js';
import useShop from '../../hooks/useShop.js';
import { initTelegramWebApp } from '../../lib/telegram.js';

export default function ShopPage({ shopId: propShopId }) {
  const { shopId: routeShopId } = useParams();
  const shopId = propShopId ?? routeShopId;
  const [activeCategory, setActiveCategory] = useState(null);
  const { shop, loading: shopLoading, error: shopError } = useShop(shopId);
  const { categories, loading: categoriesLoading } = useCategories(shopId);
  const { products, loading: productsLoading } = useProducts(shopId, activeCategory);

  useEffect(() => {
    initTelegramWebApp();
  }, []);
  const [debugMsg, setDebugMsg] = useState('');

useEffect(() => {
  async function test() {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();
      setDebugMsg(JSON.stringify({ data, error, shopId }));
    } catch (err) {
      setDebugMsg('CAUGHT: ' + err.message);
    }
  }
  test();
}, [shopId]);

// add this somewhere visible in your JSX


  if (shopLoading || categoriesLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl bg-white p-6 shadow-soft">Loading shop...</div>
      </div>
    );
  }

  if (shopError) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load shop. {shopError.message}
        </div>
        <div style={{ fontSize: 11, padding: 8, wordBreak: 'break-all', background: '#fff' }}>
          {debugMsg || 'loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-5 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-slate-900">{shop?.name || 'Shop'}</h1>
          <p className="mt-2 text-sm text-slate-600">Browse products and contact the seller instantly.</p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-4">
        <CategoryTabs categories={categories} activeId={activeCategory} onChange={setActiveCategory} />

        {products.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
            No products found in this category.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} shop={shop} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
