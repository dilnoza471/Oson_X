import StatusBadge from './StatusBadge.jsx';
import { openTelegramLink } from '../../lib/telegram.js';

export default function ProductCard({ product, shop }) {
  const isOutOfStock = product.status === 'out_of_stock';
  const isComingSoon = product.status === 'coming_soon';
  const price = Number(product.price || 0).toLocaleString('uz-UZ') + ' UZS';

  function handleContact() {
    if (!shop?.tg_handle) {
      return;
    }

    const message = `Hi, I'm interested in ${product.name}`;
    const url = `https://t.me/${shop.tg_handle}?text=${encodeURIComponent(message)}`;
    openTelegramLink(url);
  }

  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-soft transition ${isOutOfStock ? 'opacity-70' : ''}`}>
      <div className="mb-4 overflow-hidden rounded-3xl bg-slate-100">
        <img
          src={product.image_url || 'https://via.placeholder.com/400x320?text=Product'}
          alt={product.name}
          className="h-40 w-full object-cover"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{price}</p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <p className="text-sm leading-6 text-slate-600 line-clamp-3">{product.description || 'No description available.'}</p>
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
              {isOutOfStock ? 'Unavailable' : 'Contact Seller'}
            </button>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              Coming Soon
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
