import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import useSession from '../../hooks/useSession.js';
import useCategories from '../../hooks/useCategories.js';
import useProducts from '../../hooks/useProducts.js';
import ProductForm from '../../components/admin/ProductForm.jsx';
import CategoryForm from '../../components/admin/CategoryForm.jsx';
import ProductList from '../../components/admin/ProductList.jsx';

const STATUS_CYCLE = ['in_stock', 'out_of_stock', 'coming_soon'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const [shopId, setShopId] = useState(null);
  const [shopName, setShopName] = useState('');
  const [tab, setTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories(shopId);
  const { products, loading: productsLoading, setProducts } = useProducts(shopId);

  // Auto-clear status message after 3 seconds
  const showStatus = useCallback((msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function loadAdminShop() {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('shop_id')
        .eq('id', session.user.id)
        .single();

      if (adminError || !admin?.shop_id) {
        showStatus(adminError?.message || 'Unable to load admin shop.');
        return;
      }

      setShopId(admin.shop_id);

      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('name')
        .eq('id', admin.shop_id)
        .single();

      if (shopError) {
        showStatus(shopError.message);
      } else {
        setShopName(shop?.name || 'My Shop');
      }
    }

    loadAdminShop();
  }, [session, showStatus]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  }

  async function handleCreateOrUpdateProduct(payload) {
  if (!shopId) return;

  if (editingProduct) {
    // Don't update shop_id or deleted — extract only editable fields
    const { shop_id, deleted, ...editableFields } = payload;
    const cleanedFields = {
      ...editableFields,
      category_id: editableFields.category_id ? Number(editableFields.category_id) : null, // Ensure empty category becomes null
    }
    const { error } = await supabase
      .from('products')
      .update(cleanedFields)
      .eq('id', editingProduct.id);

    if (error) {
      showStatus(error.message);
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProduct.id ? { ...product, ...cleanedFields } : product
      )
    );
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...payload, shop_id: shopId, 
        category_id: payload.category_id ? Number(payload.category_id) : null, }])
      .select()
      .single();

    if (error) {
      showStatus(error.message);
      return;
    }

    setProducts((current) => [data, ...current]);
  }

  setShowForm(false);
  setEditingProduct(null);
  showStatus('Muvaffaqiyatli saqlandi.');
}

  async function handleToggleStatus(product) {
    const nextIndex = (STATUS_CYCLE.indexOf(product.status) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];

    const { error } = await supabase
      .from('products')
      .update({ status: nextStatus })
      .eq('id', product.id);

    if (error) {
      showStatus(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, status: nextStatus } : item
      )
    );
  }

 async function handleDeleteProduct(product) {
  const confirmed = window.confirm(`Delete "${product.name}"?`);
  if (!confirmed) return;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', product.id);

  if (error) {
    showStatus(error.message);
    return;
  }

  setProducts((current) => current.filter((item) => item.id !== product.id));
  showStatus('Mahsulot o\'chirildi.');
}

  async function handleCreateCategory(name) {
    if (!shopId) return;

    const { error } = await supabase
      .from('categories')
      .insert([{ name, shop_id: shopId }]);

    if (error) {
      showStatus(error.message);
      return;
    }

    refetchCategories();
    showStatus('Kategoriya qo\'shildi.');
  }

  async function handleDeleteCategory(category) {
  if (!shopId) return;

  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('category_id', category.id);

  if (countError) {
    showStatus(countError.message);
    return;
  }

  if (count > 0) {
    const confirmed = window.confirm(
      `${count} product${count > 1 ? 's' : ''} use this category and will become uncategorized. Continue?`
    );
    if (!confirmed) return;
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', category.id);

  if (error) {
    showStatus(error.message);
    return;
  }

  refetchCategories();
  showStatus('Kategoriya o\'chirildi.');
}

  const activeProducts = useMemo(() => products || [], [products]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl bg-white p-6 shadow-soft">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-5 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{shopName || 'My Shop'}</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Chiqish
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
              tab === 'products'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Mahsulotlar
          </button>
          <button
            type="button"
            onClick={() => setTab('categories')}
            className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
              tab === 'categories'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Kategoriyalar
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {statusMessage}
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' ? (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Products</h2>
                <p className="mt-1 text-sm text-slate-600">Mahsulotlar ro'yxati</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Mahsulot qo'shish
              </button>
            </div>

            {productsLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
                Mahsulotlar yuklanmoqda…
              </div>
            ) : activeProducts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
                Mahsulotlar mavjud emas. Yuqoridagi tugma orqali birinchi mahsulotni qo'shing.
              </div>
            ) : (
              <ProductList
                products={activeProducts}
                categories={categories}
                onToggleStatus={handleToggleStatus}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setShowForm(true);
                }}
                onDelete={handleDeleteProduct}
                setProducts={setProducts} 
              />
            )}
          </section>
        ) : (
          /* Categories tab */
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
              <p className="mt-1 text-sm text-slate-600">Kategoriyalarni yaratish va o'chirish</p>
            </div>

            <CategoryForm onCreate={handleCreateCategory} />

            {categoriesLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
                Kategoriyalar yuklanmoqda…
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
                Kategoriyalar mavjud emas. Yuqoridagi tugma orqali birinchi kategoriyani qo'shing.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      className="rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Olib tashlash
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Product form modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          shopId={shopId}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSubmit={handleCreateOrUpdateProduct}
        />
      )}
    </div>
  );
}