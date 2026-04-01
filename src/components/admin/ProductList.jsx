import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

const STATUS_CONFIG = {
  in_stock: { label: 'Sotuvda', classes: 'bg-green-50 text-green-700 border-green-200' },
  out_of_stock: { label: 'Sotuvda yo\'q', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
  coming_soon: { label: 'Tez orada', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function getDiscountedPrice(price, discountType, discountValue) {
  if (!discountType || !discountValue) return null;
  if (discountType === 'percentage') {
    return Math.round(price - (price * discountValue) / 100);
  }
  return Number(discountValue); // fixed = final price directly
}

function formatPrice(amount) {
  return Number(amount || 0).toLocaleString('uz-UZ') + ' UZS';
}

function InitialsFallback({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');
  return (
    <div
      className="h-16 w-16 rounded-2xl bg-slate-100 items-center justify-center text-slate-500 font-semibold text-lg select-none"
      style={{ display: 'none' }}
    >
      {initials}
    </div>
  );
}

function ProductImage({ imageUrl, name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  if (imageUrl) {
    return (
      <>
        <img
          className="h-16 w-16 rounded-2xl object-cover"
          src={imageUrl}
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <InitialsFallback name={name} />
      </>
    );
  }

  return (
    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-lg select-none">
      {initials}
    </div>
  );
}

function DiscountForm({ product, onSave, onCancel }) {
  const [discountType, setDiscountType] = useState(product.discount_type || 'percentage');
  const [discountValue, setDiscountValue] = useState(product.discount_value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const value = Number(discountValue);

    if (!value || value <= 0) {
      setError('To\'g\'ri raqam kiriting.');
      return;
    }
    if (discountType === 'percentage' && value >= 100) {
      setError('Foiz 100 dan kam bo\'lishi kerak.');
      return;
    }
    if (discountType === 'fixed' && value >= product.price) {
      setError('Chegirmali narx asl narxidan kam bo\'lishi kerak.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from('products')
      .update({ discount_type: discountType, discount_value: value })
      .eq('id', product.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    onSave({ discount_type: discountType, discount_value: value });
  }

  async function handleRemove() {
    setSaving(true);
    const { error: updateError } = await supabase
      .from('products')
      .update({ discount_type: null, discount_value: null })
      .eq('id', product.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    onSave({ discount_type: null, discount_value: null });
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Type</p>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="percentage">Foiz (%)</option>
            <option value="fixed">Oxirgi narx (UZS)</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            {discountType === 'percentage' ? 'Chegirma %' : 'Oxirgi narx'}
          </p>
          <input
            type="number"
            min="1"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? '20' : '120000'}
            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Save
        </button>
        {product.discount_type && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProductList({ products, categories, onToggleStatus, onEdit, onDelete, setProducts }) {
  const [discountOpenId, setDiscountOpenId] = useState(null);

  function handleDiscountSave(product, updates) {
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, ...updates } : item
      )
    );
    setDiscountOpenId(null);
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const category = categories.find((item) => item.id === product.category_id);
        const status = STATUS_CONFIG[product.status] || STATUS_CONFIG.in_stock;
        const discountedPrice = getDiscountedPrice(product.price, product.discount_type, product.discount_value);
        const hasDiscount = discountedPrice !== null;
        const isDiscountOpen = discountOpenId === product.id;

        return (
          <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="relative flex-shrink-0">
                  <ProductImage imageUrl={product.image_url} name={product.name} />
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500">{category?.name || 'Umumiy'}</p>

                  {/* Price with discount */}
                  <div className="mt-1 flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm line-through text-slate-400">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm font-semibold text-green-700">
                          {formatPrice(discountedPrice)}
                        </span>
                        {product.discount_type === 'percentage' && (
                          <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                            -{product.discount_value}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm font-medium text-slate-700">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${status.classes}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 sm:items-center">
                <button
                  type="button"
                  onClick={() => onToggleStatus(product)}
                  className={`rounded-3xl border px-4 py-2 text-sm font-medium transition hover:opacity-80 ${status.classes}`}
                >
                  {status.label}
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountOpenId(isDiscountOpen ? null : product.id)}
                  className={`rounded-3xl border px-4 py-2 text-sm font-medium transition ${
                    hasDiscount
                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {hasDiscount ? 'Chegirmani o\'zgartirish' : 'Chegirma qo\'shish'}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  O'zgartirish
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Olib tashlash
                </button>
              </div>
            </div>

            {/* Inline discount form */}
            {isDiscountOpen && (
              <DiscountForm
                product={product}
                onSave={(updates) => handleDiscountSave(product, updates)}
                onCancel={() => setDiscountOpenId(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}