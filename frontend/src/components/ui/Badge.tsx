import type { EstadoDonacion, EstadoEnvio } from '@/types'

type Estado = EstadoDonacion | EstadoEnvio | 'entregado_recepcion'

const MAP: Record<string, { label: string; className: string }> = {
  pendiente:   { label: '⏳ Pendiente',        className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  listo:       { label: '✔ Listo para enviar', className: 'bg-green-50 text-green-700 border border-green-200' },
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
