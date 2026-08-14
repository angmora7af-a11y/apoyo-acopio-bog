import { useNavigate } from 'react-router-dom'
import { useDonaciones } from '@/features/donaciones/useDonaciones'
import { useEnvios } from '@/features/envios/useEnvios'
import { useRecepciones } from '@/features/recepciones/useRecepciones'
import { useSessionStore } from '@/store/sessionStore'

export function HomePage() {
  const navigate = useNavigate()
  const session = useSessionStore((s) => s.session)
  const { data: donaciones = [] } = useDonaciones()
  const { data: envios = [] } = useEnvios()
  const { data: recepciones = [] } = useRecepciones()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Bienvenido/a, {session?.nombre.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">¿Qué módulo necesitas hoy?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Donaciones', value: donaciones.length, color: 'text-blue-600' },
          { label: 'Envíos',     value: envios.length,     color: 'text-violet-600' },
          { label: 'Recepciones', value: recepciones.length, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Módulos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '📦', title: 'Registro de Ayuda', desc: 'Donaciones y kits', path: '/donaciones', bg: 'bg-blue-50' },
          { icon: '🚚', title: 'Módulo de Envíos',  desc: 'Despacho logístico', path: '/envios',     bg: 'bg-violet-50' },
          { icon: '📥', title: 'Recepciones',        desc: 'Confirmar entrega',  path: '/recepciones', bg: 'bg-green-50' },
        ].map(({ icon, title, desc, path, bg }) => (
          <button key={path} onClick={() => navigate(path)}
            className={`flex items-center gap-4 sm:flex-col sm:items-start p-5 rounded-xl border-2 border-transparent hover:border-blue-500 bg-white shadow-sm transition group text-left`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${bg}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <span className="ml-auto sm:hidden text-gray-300 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
