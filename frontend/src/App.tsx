import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSessionStore } from '@/store/sessionStore'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { LoginPage } from '@/features/auth/LoginPage'
import { HomePage } from '@/features/home/HomePage'
import { DonacionesPage } from '@/features/donaciones/DonacionesPage'
import { EnviosPage } from '@/features/envios/EnviosPage'
import { RecepcionesPage } from '@/features/recepciones/RecepcionesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1 },
  },
})

function ProtectedLayout() {
  const session = useSessionStore((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <TopBar />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/donaciones"  element={<DonacionesPage />} />
        <Route path="/envios"      element={<EnviosPage />} />
        <Route path="/recepciones" element={<RecepcionesPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
