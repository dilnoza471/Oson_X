import StatusBadge from './StatusBadge.jsx';
import { openTelegramLink } from '../../lib/telegram.js';

function getDiscountedPrice(price, discountType, discountValue) {
  if (!discountType || !discountValue) return null;
  if (discountType === 'percentage') {
    return Math.round(price - (price * discountValue) / 100);
  }
  return Number(discountValue);
}

function formatPrice(amount) {
  return Number(amount || 0).toLocaleString('uz-UZ') + ' UZS';
}

function ProductImage({ imageUrl, name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  if (imageUrl) {
    return (
      <div className="mb-4 overflow-hidden rounded-3xl bg-white border border-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="h-40 w-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="h-40 w-full items-center justify-center bg-slate-100 text-3xl font-semibold text-slate-400"
          style={{ display: 'none' }}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-3xl font-semibold text-slate-400">
      {initials}
    </div>
  );
}

export default function ProductCard({ product, shop }) {
  const isOutOfStock = product.status === 'out_of_stock';
  const isComingSoon = product.status === 'coming_soon';

  const discountedPrice = getDiscountedPrice(
    product.price,
    product.discount_type,
    product.discount_value
  );
  const hasDiscount = discountedPrice !== null;

  function handleContact() {
    if (!shop?.tg_handle) return;
    const message = `Hi, I'm interested in ${product.name}`;
    const url = `https://t.me/${shop.tg_handle}?text=${encodeURIComponent(message)}`;
    openTelegramLink(url);
  }

  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-soft transition ${isOutOfStock ? 'opacity-70' : ''}`}>
      <ProductImage imageUrl={product.image_url} name={product.name} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>

            {/* Price */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
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
                <span className="text-sm text-slate-500">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          <StatusBadge status={product.status} />
        </div>

        <p className="text-sm leading-6 text-slate-600 line-clamp-3">
          {product.description || 'Tavsif mavjud emas.'}
        </p>

        <div>
          {!isComingSoon ? (
            <button
              type="button"
              onClick={handleContact}
              disabled={isOutOfStock}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isOutOfStock
                  ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isOutOfStock ? 'Sotuvda yo\'q' : 'Sotuvchi bilan bog\'lanish'}
            </button>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              Tez orada
            </div>
          )}
        </div>
      </div>
    </article>
  );
}