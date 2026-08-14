import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CatPills } from '@/components/shared/CatPills'
import { useEnviosDisponibles } from '@/features/envios/useEnvios'
import { useConfirmarRecepcion } from './useRecepciones'
import type { Envio, TipoTransporte } from '@/types'

const schema = z.object({
  receptor_nombre: z.string().min(2, 'Requerido'),
  fecha_hora:      z.string().min(1, 'Requerido'),
  hora:            z.string().optional(),
  tipo_transporte: z.string().optional(),
  capacidad_ton:   z.string().optional(),
  empresa:         z.string().optional(),
  responsable_nombre: z.string().optional(),
  contacto:        z.string().optional(),
  placa:           z.string().optional(),
  ciudad_origen:   z.string().optional(),
  ciudad_destino:  z.string().optional(),
})
type Form = z.infer<typeof schema>

function nowDate() { return new Date().toISOString().split('T')[0] }
function nowTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}

const TIPO_OPTS: { value: string; label: string }[] = [
  { value: 'carro', label: '🚗 Carro' },
  { value: 'camion', label: '🚛 Camión' },
  { value: 'avion_vuelo', label: '✈️ Avión/Vuelo' },
  { value: 'barco', label: '🚢 Barco' },
  { value: 'otro', label: '🚚 Otro' },
]

export function NuevaRecepcionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: envios = [] } = useEnviosDisponibles()
  const confirmar = useConfirmarRecepcion()
  const [envioSel, setEnvioSel] = useState<Envio | null>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { fecha_hora: nowDate(), hora: nowTime() },
  })

  const selectEnvio = (e: Envio) => {
    setEnvioSel(e)
    setValue('tipo_transporte',    e.tipo_transporte)
    setValue('capacidad_ton',      e.capacidad_ton?.toString() ?? '')
    setValue('empresa',            e.empresa ?? '')
    setValue('responsable_nombre', e.responsable_nombre)
    setValue('contacto',           e.contacto ?? '')
    setValue('placa',              e.placa ?? '')
    setValue('ciudad_origen',      e.ciudad_origen)
    setValue('ciudad_destino',     e.ciudad_destino)
  }

  const onSubmit = (data: Form) => {
    if (!envioSel) return
    const dt = `${data.fecha_hora}T${data.hora ?? '00:00'}:00`
    confirmar.mutate(
      {
        receptor_nombre:    data.receptor_nombre,
        envio_id:           envioSel.id,
        tipo_transporte:    (data.tipo_transporte as TipoTransporte) || undefined,
        capacidad_ton:      data.capacidad_ton ? parseFloat(data.capacidad_ton) : undefined,
        empresa:            data.empresa,
        responsable_nombre: data.responsable_nombre,
        contacto:           data.contacto,
        placa:              data.placa,
        fecha_hora:         dt,
        ciudad_origen:      data.ciudad_origen,
        ciudad_destino:     data.ciudad_destino,
      },
      { onSuccess: () => { reset(); setEnvioSel(null); onClose() } },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="📥 Nueva Recepción">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Receptor */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Receptor en destino</p>
          <Input label="Nombre de quien recibe" placeholder="Nombre completo"
            {...register('receptor_nombre')} error={errors.receptor_nombre?.message} />
        </div>

        {/* Asociar envío */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asociar envío en tránsito</p>
          {!envios.length ? (
            <p className="text-sm text-gray-400 italic">Sin envíos en tránsito actualmente</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {envios.map((e) => (
                <label key={e.id}
                  className="flex gap-2.5 items-start p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50 transition">
                  <input type="radio" name="envio-sel" value={e.id}
                    checked={envioSel?.id === e.id}
                    onChange={() => selectEnvio(e)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {e.codigo} — {e.tipo_transporte} {e.empresa ? `· ${e.empresa}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{e.ciudad_origen} → {e.ciudad_destino} · {e.total_cajas} cajas</p>
                    <CatPills cats={e.carga_categorias} />
                  </div>
                </label>
              ))}
            </div>
          )}
          {envioSel && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Carga que llega</p>
              <CatPills cats={envioSel.carga_categorias} />
              <p className="text-sm font-bold text-green-700 mt-1.5">📦 {envioSel.total_cajas} cajas</p>
            </div>
          )}
        </div>

        {/* Verificación transporte */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verificación del transporte</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select {...register('tipo_transporte')}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500">
                <option value="">— Seleccionar —</option>
                {TIPO_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <Input label="Capacidad (Ton)" type="number" step="0.5" min="0" {...register('capacidad_ton')} />
          </div>
          <Input label="Empresa aliada (opcional)" {...register('empresa')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Responsable transportador" {...register('responsable_nombre')} />
            <Input label="Contacto" type="tel" {...register('contacto')} />
          </div>
          <Input label="Placa / Matrícula" {...register('placa')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha llegada" type="date" {...register('fecha_hora')} error={errors.fecha_hora?.message} />
            <Input label="Hora llegada" type="time" {...register('hora')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ciudad origen" {...register('ciudad_origen')} />
            <Input label="Ciudad destino" {...register('ciudad_destino')} />
          </div>
        </div>

        <Button type="submit" variant="success" full loading={confirmar.isPending}
          disabled={!envioSel}>
          Confirmar recepción
        </Button>
      </form>
    </Modal>
  )
}
