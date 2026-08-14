import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CategoryGrid } from '@/components/shared/CategoryGrid'
import { EMPTY_CATEGORIAS } from '@/utils/categorias'
import { useCrearDonacion } from './useDonaciones'
import { useSessionStore } from '@/store/sessionStore'

const schema = z.object({
  acopio:      z.string().min(2, 'Requerido'),
  fecha_hora:  z.string().min(1, 'Requerido'),
  hora:        z.string().optional(),
  destino:     z.string().optional(),
  comentarios: z.string().optional(),
  categorias:  z.any(),
  listo:       z.boolean().default(false),
})
type Form = z.infer<typeof schema>

function nowDate() { return new Date().toISOString().split('T')[0] }
function nowTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}

export function NuevaDonacionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const session = useSessionStore((s) => s.session)
  const crear = useCrearDonacion()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha_hora: nowDate(),
      hora:       nowTime(),
      categorias: EMPTY_CATEGORIAS,
      listo:      false,
    },
  })

  const onSubmit = (data: Form) => {
    const dt = `${data.fecha_hora}T${data.hora ?? '00:00'}:00`
    crear.mutate(
      {
        acopio:      data.acopio,
        fecha_hora:  dt,
        destino:     data.destino,
        comentarios: data.comentarios,
        categorias:  data.categorias,
        estado:      data.listo ? 'listo' : 'pendiente',
      },
      { onSuccess: () => { reset(); onClose() } },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="📦 Nueva Donación">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cabecera */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos de cabecera</p>
          <Input label="Centro de acopio" placeholder="Ej: Centro Norte, Suba..."
            {...register('acopio')} error={errors.acopio?.message} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-gray-700">
            <span className="text-xs font-medium text-gray-500 block mb-0.5">Registrado por</span>
            <span className="font-semibold">{session?.nombre}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" {...register('fecha_hora')} error={errors.fecha_hora?.message} />
            <Input label="Hora" type="time" {...register('hora')} />
          </div>
          <Input label="Destino asignado (opcional)" placeholder="Ciudad o zona" {...register('destino')} />
        </div>

        {/* Categorías */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorías de kits / cajas</p>
          <Controller
            name="categorias"
            control={control}
            render={({ field }) => (
              <CategoryGrid value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalles adicionales</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Comentarios</label>
            <textarea {...register('comentarios')} rows={2}
              placeholder="Observaciones, notas especiales..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" {...register('listo')}
              className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <span className="text-sm font-medium text-gray-700">
              Marcar como <strong>Listo para enviar</strong>
            </span>
          </label>
        </div>

        <Button type="submit" full loading={crear.isPending}>Guardar donación</Button>
      </form>
    </Modal>
  )
}
