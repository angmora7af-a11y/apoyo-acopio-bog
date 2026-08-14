import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CatPills } from '@/components/shared/CatPills'
import { useDonaciones } from '@/features/donaciones/useDonaciones'
import { useCrearEnvio } from './useEnvios'
import { CATEGORIES, sumarCategorias, totalCajas, EMPTY_CATEGORIAS } from '@/utils/categorias'
import type { Donacion, TipoTransporte } from '@/types'

const schema = z.object({
  tipo_transporte:    z.string(),
  capacidad_ton:      z.string().optional(),
  empresa:            z.string().optional(),
  placa:              z.string().optional(),
  responsable_nombre: z.string().min(2, 'Requerido'),
  contacto:           z.string().optional(),
  fecha_hora:         z.string().min(1, 'Requerido'),
  hora:               z.string().optional(),
  ciudad_origen:      z.string().min(2, 'Requerido'),
  ciudad_destino:     z.string().min(2, 'Requerido'),
})
type Form = z.infer<typeof schema>

function nowDate() { return new Date().toISOString().split('T')[0] }
function nowTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}

export function NuevoEnvioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: donaciones = [] } = useDonaciones({ estado: 'listo' })
  const crear = useCrearEnvio()
  const [selIds, setSelIds] = useState<string[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tipo_transporte: 'camion', fecha_hora: nowDate(), hora: nowTime() },
  })

  // Resumen de carga seleccionada
  const selDons = donaciones.filter((d) => selIds.includes(d.id))
  const cargaAgg = selDons.reduce(
    (acc, d) => sumarCategorias(acc, d.categorias),
    EMPTY_CATEGORIAS,
  )
  const totalSel = selDons.reduce((s, d) => s + d.total_cajas, 0)

  const toggleDon = (id: string) =>
    setSelIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const onSubmit = (data: Form) => {
    const dt = `${data.fecha_hora}T${data.hora ?? '00:00'}:00`
    crear.mutate(
      {
        tipo_transporte:    data.tipo_transporte as TipoTransporte,
        capacidad_ton:      data.capacidad_ton ? parseFloat(data.capacidad_ton) : undefined,
        empresa:            data.empresa,
        placa:              data.placa,
        responsable_nombre: data.responsable_nombre,
        contacto:           data.contacto,
        fecha_hora:         dt,
        ciudad_origen:      data.ciudad_origen,
        ciudad_destino:     data.ciudad_destino,
        donaciones_ids:     selIds,
      },
      { onSuccess: () => { reset(); setSelIds([]); onClose() } },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="🚚 Nuevo Envío">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Transporte */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transporte</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select {...register('tipo_transporte')}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500">
                <option value="carro">🚗 Carro</option>
                <option value="camion">🚛 Camión</option>
                <option value="avion_vuelo">✈️ Avión / Vuelo</option>
                <option value="barco">🚢 Barco</option>
                <option value="otro">🚚 Otro</option>
              </select>
            </div>
            <Input label="Capacidad (Ton)" type="number" step="0.5" min="0" placeholder="0.0" {...register('capacidad_ton')} />
          </div>
          <Input label="Empresa / Aliado (opcional)" placeholder="Ej: Satena, Avianca..." {...register('empresa')} />
        </div>

        {/* Responsable */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsable del transporte</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre responsable" placeholder="Nombre completo"
              {...register('responsable_nombre')} error={errors.responsable_nombre?.message} />
            <Input label="Teléfono" type="tel" placeholder="Ej: 310..." {...register('contacto')} />
          </div>
        </div>

        {/* Ruta */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ruta y tiempo</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha despacho" type="date" {...register('fecha_hora')} error={errors.fecha_hora?.message} />
            <Input label="Hora" type="time" {...register('hora')} />
          </div>
          <Input label="Placa / Matrícula" placeholder="Ej: ABC-123" {...register('placa')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ciudad origen" placeholder="Ej: Bogotá"
              {...register('ciudad_origen')} error={errors.ciudad_origen?.message} />
            <Input label="Ciudad destino" placeholder="Ej: Mocoa"
              {...register('ciudad_destino')} error={errors.ciudad_destino?.message} />
          </div>
        </div>

        {/* Asociar carga */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asociar carga</p>
          <p className="text-xs text-gray-400">Selecciona las donaciones listas para enviar.</p>
          {!donaciones.length ? (
            <p className="text-sm text-gray-400 italic">Sin donaciones marcadas como "Listo para enviar"</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {donaciones.map((d) => (
                <label key={d.id}
                  className="flex gap-2.5 items-start p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50 transition">
                  <input type="checkbox" checked={selIds.includes(d.id)}
                    onChange={() => toggleDon(d.id)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{d.codigo} — {d.acopio}</p>
                    <p className="text-xs text-gray-500">{d.total_cajas} cajas · {d.responsable_nombre}</p>
                    <CatPills cats={d.categorias} />
                  </div>
                </label>
              ))}
            </div>
          )}

          {selDons.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                Resumen de carga seleccionada
              </p>
              <CatPills cats={cargaAgg} />
              <p className="text-sm font-bold text-blue-700">
                📦 Total: {totalSel} cajas en {selDons.length} donación(es)
              </p>
            </div>
          )}
        </div>

        <Button type="submit" full loading={crear.isPending}>Registrar envío</Button>
      </form>
    </Modal>
  )
}
