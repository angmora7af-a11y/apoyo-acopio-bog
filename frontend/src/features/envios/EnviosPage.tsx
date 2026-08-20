import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CatPills } from '@/components/shared/CatPills'
import { NuevoEnvioModal } from './NuevoEnvioModal'
import { useEnvios } from './useEnvios'

const TIPO_LABEL: Record<string, string> = {
  carro: '🚗 Carro', camion: '🚛 Camión',
  avion_vuelo: '✈️ Avión/Vuelo', barco: '🚢 Barco', otro: '🚚 Otro',
}

export function EnviosPage() {
  const [open, setOpen] = useState(false)
  const { data: envios = [], isLoading } = useEnvios()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🚚 Módulo de Envíos</h1>
          <p className="text-xs text-gray-500 mt-0.5">Despacho de carga hacia destinos</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>+ Nuevo</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : !envios.length ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-2">🚚</span>
          <p className="text-sm text-gray-400">Sin envíos registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {envios.map((e) => (
            <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
              <span className="text-2xl">{TIPO_LABEL[e.tipo_transporte]?.split(' ')[0] ?? '🚚'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {e.codigo} — {TIPO_LABEL[e.tipo_transporte] ?? e.tipo_transporte}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {e.ciudad_origen} → {e.ciudad_destino}
                  {' · '}{new Date(e.fecha_hora).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                {e.empresa && <p className="text-xs text-gray-400 mt-0.5">{e.empresa} · {e.responsable_nombre}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  <strong>{e.total_cajas}</strong> cajas
                </p>
                <CatPills cats={e.carga_categorias} />
                <div className="mt-2"><Badge estado={e.estado} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NuevoEnvioModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
