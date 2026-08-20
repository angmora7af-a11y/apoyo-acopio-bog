import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDonaciones } from '@/api/donaciones'
import { getEnvios } from '@/api/envios'
import { getRecepciones } from '@/api/recepciones'
import { CATEGORIES, CUSTOM_ICON } from '@/utils/categorias'
import type { Donacion, Envio, Recepcion } from '@/types'

function startOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function today() {
  return new Date().toISOString().split('T')[0]
}

function inRange(dateStr: string, from: string, to: string) {
  const d = dateStr.split('T')[0]
  return d >= from && d <= to
}

export function DashboardPage() {
  const [from, setFrom] = useState(startOfMonth)
  const [to, setTo]     = useState(today)

  const { data: donaciones = [], isLoading: loadD } = useQuery({
    queryKey: ['dashboard', 'donaciones'],
    queryFn: () => getDonaciones({ limit: 5000 }),
  })
  const { data: envios = [], isLoading: loadE } = useQuery({
    queryKey: ['dashboard', 'envios'],
    queryFn: () => getEnvios({ limit: 5000 }),
  })
  const { data: recepciones = [], isLoading: loadR } = useQuery({
    queryKey: ['dashboard', 'recepciones'],
    queryFn: () => getRecepciones({ limit: 5000 }),
  })

  const loading = loadD || loadE || loadR

  const filteredD = useMemo<Donacion[]>(
    () => donaciones.filter((d) => inRange(d.fecha_hora, from, to)),
    [donaciones, from, to],
  )
  const filteredE = useMemo<Envio[]>(
    () => envios.filter((e) => inRange(e.fecha_hora, from, to)),
    [envios, from, to],
  )
  const filteredR = useMemo<Recepcion[]>(
    () => recepciones.filter((r) => inRange(r.fecha_hora, from, to)),
    [recepciones, from, to],
  )

  const totalCajasD = filteredD.reduce((s, d) => s + d.total_cajas, 0)
  const totalCajasE = filteredE.reduce((s, e) => s + e.total_cajas, 0)
  const totalCajasR = filteredR.reduce((s, r) => s + (r.total_cajas ?? 0), 0)

  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    filteredD.forEach((d) => {
      Object.entries(d.categorias).forEach(([k, v]) => {
        if (v > 0) totals[k] = (totals[k] ?? 0) + v
      })
    })
    return totals
  }, [filteredD])

  const knownCatKeys  = new Set(CATEGORIES.map((c) => c.key))
  const activeCats    = CATEGORIES.filter((c) => (catTotals[c.key] ?? 0) > 0)
  const activeCustoms = Object.keys(catTotals).filter((k) => !knownCatKeys.has(k) && catTotals[k] > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen operativo por período</p>
      </div>

      {/* Filtro de fechas */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <QuickBtn label="Este mes" onClick={() => { setFrom(startOfMonth()); setTo(today()) }} />
          <QuickBtn label="Todo" onClick={() => { setFrom('2020-01-01'); setTo(today()) }} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Cargando datos...</div>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Donaciones" count={filteredD.length} cajas={totalCajasD} color="blue" />
            <StatCard label="Envíos"     count={filteredE.length} cajas={totalCajasE} color="violet" />
            <StatCard label="Recepciones" count={filteredR.length} cajas={totalCajasR} color="green" />
          </div>


          {/* Categorías */}
          {(activeCats.length > 0 || activeCustoms.length > 0) && (
            <Section title="Cajas por categoría (donaciones)">
              <div className="space-y-2">
                {activeCats.map(({ key, icon, name }) => (
                  <CatBar
                    key={key}
                    icon={icon}
                    name={name}
                    value={catTotals[key]}
                    max={Math.max(...Object.values(catTotals))}
                    color="blue"
                  />
                ))}
                {activeCustoms.map((key) => (
                  <CatBar
                    key={key}
                    icon={CUSTOM_ICON}
                    name={key.replace(/_/g, ' ')}
                    value={catTotals[key]}
                    max={Math.max(...Object.values(catTotals))}
                    color="purple"
                  />
                ))}
              </div>
            </Section>
          )}

          {filteredD.length === 0 && filteredE.length === 0 && filteredR.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Sin registros en el período seleccionado
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, count, cajas, color }: {
  label: string; count: number; cajas: number
  color: 'blue' | 'violet' | 'green'
}) {
  const colors = {
    blue:   { num: 'text-blue-600',   sub: 'text-blue-400',   bg: 'bg-blue-50'   },
    violet: { num: 'text-violet-600', sub: 'text-violet-400', bg: 'bg-violet-50' },
    green:  { num: 'text-green-600',  sub: 'text-green-400',  bg: 'bg-green-50'  },
  }[color]

  return (
    <div className={`rounded-xl border border-gray-100 ${colors.bg} p-4 text-center`}>
      <p className={`text-2xl font-bold ${colors.num}`}>{count}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      {cajas > 0 && (
        <p className={`text-xs mt-1 ${colors.sub}`}>{cajas} cajas</p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

function CatBar({ icon, name, value, max, color }: {
  icon: string; name: string; value: number; max: number; color: 'blue' | 'purple'
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-center flex-shrink-0">{icon}</span>
      <span className="w-32 text-sm text-gray-700 capitalize truncate flex-shrink-0">{name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right flex-shrink-0">{value}</span>
    </div>
  )
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
    >
      {label}
    </button>
  )
}
