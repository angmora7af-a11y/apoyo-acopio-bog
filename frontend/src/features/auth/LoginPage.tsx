import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/voluntarios'
import { useSessionStore } from '@/store/sessionStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  nombre:    z.string().min(2, 'Mínimo 2 caracteres'),
  documento: z.string().min(4, 'Mínimo 4 caracteres'),
  rol:       z.enum(['voluntario', 'administrador']),
})
type Form = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rol: 'voluntario' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => { setSession(data); navigate('/') },
  })

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <div className="text-center mb-7">
          <span className="text-5xl block">🏔️</span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Ayuda Logística BOG</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de gestión humanitaria</p>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <Input label="Nombre completo" placeholder="Ej: María García"
            {...register('nombre')} error={errors.nombre?.message} />
          <Input label="Número de documento" placeholder="Ej: 1020304050"
            {...register('documento')} error={errors.documento?.message} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Rol</label>
            <select {...register('rol')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="voluntario">Voluntario</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600 text-center">
              Error al ingresar. Intenta de nuevo.
            </p>
          )}

          <Button type="submit" full loading={mutation.isPending} className="mt-2">
            Ingresar al sistema
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          No se requiere contraseña. Solo identifícate para continuar.
        </p>
      </div>
    </div>
  )
}
