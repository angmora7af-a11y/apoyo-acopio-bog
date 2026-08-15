import { CATEGORIES } from '@/utils/categorias'
import type { CategoriasKits } from '@/types'

interface Props {
  value:    CategoriasKits
  onChange: (cats: CategoriasKits) => void
}

export function CategoryGrid({ value, onChange }: Props) {
  const set = (key: keyof CategoriasKits, v: number) =>
    onChange({ ...value, [key]: Math.max(0, isNaN(v) ? 0 : v) })

  const total = Object.values(value).reduce((s, n) => s + n, 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CATEGORIES.map(({ key, icon, name }) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 leading-tight">{name}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => set(key, value[key] - 1)}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-white rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition text-base"
              >−</button>
              <input
                type="number"
                min={0}
                value={value[key]}
                onChange={(e) => set(key, parseInt(e.target.value))}
                className="w-12 text-center text-sm font-semibold border border-gray-300 rounded-md py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => set(key, value[key] + 1)}
                className="w-7 h-7 flex items-center justify-center border border-blue-500 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 transition text-base"
              >+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <span className="text-sm font-medium text-blue-800">Total de cajas</span>
        <span className="text-xl font-bold text-blue-600">{total}</span>
      </div>
    </div>
  )
}
