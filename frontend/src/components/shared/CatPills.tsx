import { CATEGORIES, CUSTOM_ICON, customCategories } from '@/utils/categorias'
import type { CategoriasKits } from '@/types'

export function CatPills({ cats }: { cats?: CategoriasKits }) {
  if (!cats) return null
  const known  = CATEGORIES.filter((c) => (cats[c.key] ?? 0) > 0)
  const extras = customCategories(cats).filter((k) => cats[k] > 0)
  if (!known.length && !extras.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {known.map(({ key, icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800"
        >
          {icon} {cats[key]}
        </span>
      ))}
      {extras.map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800"
        >
          {CUSTOM_ICON} {key.replace(/_/g, ' ')} · {cats[key]}
        </span>
      ))}
    </div>
  )
}
