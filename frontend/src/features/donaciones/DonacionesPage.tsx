import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CatPills } from '@/components/shared/CatPills'
import { NuevaDonacionModal } from './NuevaDonacionModal'
import { useDonaciones } from './useDonaciones'

export function DonacionesPage() {
  const [open, setOpen] = useState(false)
  const { data: donaciones = [], isLoading } = useDonaciones()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">📦 Registro de Ayuda</h1>
          <p className="text-xs text-gray-500 mt-0.5">Bitácora de donaciones recibidas</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nueva</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : !donaciones.length ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-2">📦</span>
          <p className="text-sm text-gray-400">Sin donaciones registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donaciones.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
              <span className="text-2xl">📦</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {d.codigo} — {d.donante_nombre} → {d.receptor_nombre}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(d.fecha_hora).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  {' · '}<strong>{d.total_cajas}</strong> cajas
                </p>
                {d.comentarios && <p className="text-xs text-gray-400 mt-0.5">{d.comentarios}</p>}
                <CatPills cats={d.categorias} />
              </div>
            </div>
          ))}
        </div>
      )}

      <NuevaDonacionModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
