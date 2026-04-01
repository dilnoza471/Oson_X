import { useEffect, useRef, useState } from 'react';
import { uploadProductImage, deleteProductImage } from '../../lib/storage.js';

const STATUS_OPTIONS = [
  { value: 'in_stock', label: 'Sotuvda' },
  { value: 'out_of_stock', label: 'Sotuvda yo\'q' },
  { value: 'coming_soon', label: 'Tez orada' },
];

function Initials({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-400">
      {initials || '?'}
    </div>
  );
}

export default function ProductForm({ product, categories, onClose, shopId, onSubmit }) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [status, setStatus] = useState(product?.status || 'in_stock');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(product?.name || '');
    setDescription(product?.description || '');
    setPrice(product?.price || '');
    setCategoryId(product?.category_id || '');
    setImageUrl(product?.image_url || '');
    setImagePreview(product?.image_url || '');
    setImageFile(null);
    setStatus(product?.status || 'in_stock');
  }, [product]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be under 3MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!shopId) {
      setError('Birozdan keyin harakat qilib ko\'ring.');
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // New file selected — upload it, delete old one if editing
      if (imageFile) {
        if (product?.image_url) {
          await deleteProductImage(product.image_url);
        }
        finalImageUrl = await uploadProductImage(imageFile, shopId);
      }

      // Image was removed entirely
      if (!imagePreview && !imageFile) {
        if (product?.image_url) {
          await deleteProductImage(product.image_url);
        }
        finalImageUrl = null;
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category_id: categoryId || null,
        image_url: finalImageUrl || null,
        status,
        shop_id: shopId,
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 px-4 py-8">
      <div className="mx-auto w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Mahsulotni boshqaring.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Image upload */}
          <div>
            <span className="text-sm font-medium text-slate-700">Mahsulot Rasm</span>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Initials name={name} />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {imagePreview ? 'Rasmni o\'zgartirish' : 'Rasmni yuklash'}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Rasmni olib tashlash
                  </button>
                )}
                <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 3MB</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nomi</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tavsif</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Narx (UZS)</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Kategoriya</span>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
              >
                <option value="">Umumiy</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? 'Yuklanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}