const MAP: Record<string, { label: string; className: string }> = {
  en_transito: { label: '🚚 En tránsito',       className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  entregado:   { label: '✔ Entregado',          className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

export function Badge({ estado }: { estado: string }) {
  const cfg = MAP[estado] ?? { label: estado, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
