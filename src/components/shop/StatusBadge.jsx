export default function StatusBadge({ status }) {
  const statusMap = {
    in_stock: { label: 'Sotuvda', className: 'bg-emerald-100 text-emerald-700' },
    out_of_stock: { label: 'Sotuvda yo\'q', className: 'bg-slate-100 text-slate-700' },
    coming_soon: { label: 'Tez orada', className: 'bg-amber-100 text-amber-700' },
  };

  const statusConfig = statusMap[status] || statusMap.in_stock;

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}>
      {statusConfig.label}
    </span>
  );
}
