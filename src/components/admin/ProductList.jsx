const STATUS_CONFIG = {
  in_stock: { label: 'In stock', classes: 'bg-green-50 text-green-700 border-green-200' },
  out_of_stock: { label: 'Out of stock', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
  coming_soon: { label: 'Coming soon', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function ImageOrInitials({ imageUrl, name }) {
  if (imageUrl) {
    return (
      <img
        className="h-16 w-16 rounded-2xl object-cover"
        src={imageUrl}
        alt={name}
        onError={(e) => {
          // If image URL is broken, swap to initials
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-lg select-none">
      {initials}
    </div>
  );
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

export default function ProductList({ products, categories, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {products.map((product) => {
        const category = categories.find((item) => item.id === product.category_id);
        const status = STATUS_CONFIG[product.status] || STATUS_CONFIG.in_stock;

        return (
          <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Image or initials */}
                <div className="relative flex-shrink-0">
                  {product.image_url ? (
                    <>
                      <img
                        className="h-16 w-16 rounded-2xl object-cover"
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                      <InitialsFallback name={product.name} />
                    </>
                  ) : (
                    <ImageOrInitials imageUrl={null} name={product.name} />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500">{category?.name || 'Uncategorized'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {Number(product.price || 0).toLocaleString('uz-UZ')} UZS
                  </p>
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
                  onClick={() => onEdit(product)}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}