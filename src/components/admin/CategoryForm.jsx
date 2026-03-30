import { useState } from 'react';

export default function CategoryForm({ onCreate }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    await onCreate(name);
    setName('');
    setSubmitting(false);
  }

  return (
    <form className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-slate-700">New category</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="Category name"
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? 'Adding…' : 'Add category'}
      </button>
    </form>
  );
}
