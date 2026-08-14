import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CatPills } from '@/components/shared/CatPills'
import { NuevaRecepcionModal } from './NuevaRecepcionModal'
import { useRecepciones } from './useRecepciones'

export function RecepcionesPage() {
  const [open, setOpen] = useState(false)
  const { data: recepciones = [], isLoading } = useRecepciones()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">📥 Módulo de Recepciones</h1>
          <p className="text-xs text-gray-500 mt-0.5">Confirmación de llegada en destino</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nueva</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : !recepciones.length ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-2">📥</span>
          <p className="text-sm text-gray-400">Sin recepciones registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recepciones.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
              <span className="text-2xl">📥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{r.codigo} — {r.receptor_nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {r.ciudad_origen ?? '—'} → {r.ciudad_destino ?? '—'}
                  {' · '}{new Date(r.fecha_hora).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                {r.envio_codigo && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Envío: {r.envio_codigo}
                    {r.total_cajas ? ` · ${r.total_cajas} cajas` : ''}
                  </p>
                )}
                <CatPills cats={r.carga_categorias} />
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-semibold">
                    ✔ Entregado / Recibido
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NuevaRecepcionModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
