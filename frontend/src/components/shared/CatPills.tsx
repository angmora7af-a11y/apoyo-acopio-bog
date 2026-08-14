import { CATEGORIES } from '@/utils/categorias'
import type { CategoriasKits } from '@/types'

export function CatPills({ cats }: { cats?: CategoriasKits }) {
  if (!cats) return null
  const active = CATEGORIES.filter((c) => cats[c.key] > 0)
  if (!active.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {active.map(({ key, icon, name }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800"
        >
          {icon} {cats[key]}
        </span>
      ))}
    </div>
  )
}
