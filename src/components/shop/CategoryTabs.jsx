export default function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-2 px-4">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            activeId === null
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeId === category.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
