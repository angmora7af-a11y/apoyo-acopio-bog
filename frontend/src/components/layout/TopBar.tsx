import { useSessionStore } from '@/store/sessionStore'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const { session, clearSession } = useSessionStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
        <span>🏔️</span> Ayuda Logística
      </div>
      {session && (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
            {session.nombre[0].toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {session.nombre.split(' ')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition"
          >
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
