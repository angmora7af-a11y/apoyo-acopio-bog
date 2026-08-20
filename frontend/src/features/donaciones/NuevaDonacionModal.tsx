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
  fecha_hora:      z.string().min(1, 'Requerido'),
  hora:            z.string().optional(),
  donante_nombre:  z.string().min(2, 'Requerido'),
  receptor_nombre: z.string().min(2, 'Requerido'),
  categorias:      z.any(),
  comentarios:     z.string().optional(),
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
      fecha_hora:      nowDate(),
      hora:            nowTime(),
      receptor_nombre: session?.nombre ?? '',
      categorias:      EMPTY_CATEGORIAS,
    },
  })

  const onSubmit = (data: Form) => {
    const dt = `${data.fecha_hora}T${data.hora ?? '00:00'}:00`
    crear.mutate(
      {
        fecha_hora:      dt,
        donante_nombre:  data.donante_nombre,
        receptor_nombre: data.receptor_nombre,
        categorias:      data.categorias,
        comentarios:     data.comentarios,
      },
      { onSuccess: () => { reset(); onClose() } },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="📦 Nueva Donación">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Fecha y hora */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha y hora</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" {...register('fecha_hora')} error={errors.fecha_hora?.message} />
            <Input label="Hora" type="time" {...register('hora')} />
          </div>
        </div>

        {/* Donante y receptor */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Donante y receptor</p>
          <Input label="Nombre de quien dona" placeholder="Nombre completo"
            {...register('donante_nombre')} error={errors.donante_nombre?.message} />
          <Input label="Nombre de quien recibe" placeholder="Nombre completo"
            {...register('receptor_nombre')} error={errors.receptor_nombre?.message} />
        </div>

        {/* Set entregado */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qué se entregó</p>
          <Controller
            name="categorias"
            control={control}
            render={({ field }) => (
              <CategoryGrid value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Notas */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Comentarios</label>
            <textarea {...register('comentarios')} rows={2}
              placeholder="Observaciones, notas especiales..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>

        <Button type="submit" full loading={crear.isPending}>Guardar donación</Button>
      </form>
    </Modal>
  )
}
