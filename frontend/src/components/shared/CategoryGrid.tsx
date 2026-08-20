import { useState, useRef } from 'react'
import { CATEGORIES, CUSTOM_ICON, customCategories } from '@/utils/categorias'
import type { CategoriasKits } from '@/types'

interface Props {
  value:    CategoriasKits
  onChange: (cats: CategoriasKits) => void
}

export function CategoryGrid({ value, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const set = (key: string, v: number) =>
    onChange({ ...value, [key]: Math.max(0, isNaN(v) ? 0 : v) })

  const removeCustom = (key: string) => {
    const next = { ...value }
    delete next[key]
    onChange(next)
  }

  const confirmAdd = () => {
    const name = newName.trim()
    if (!name) { setAdding(false); setNewName(''); return }
    const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (!key || key in value) { setAdding(false); setNewName(''); return }
    onChange({ ...value, [key]: 0 })
    setNewName('')
    setAdding(false)
  }

  const total = Object.values(value).reduce((s, n) => s + n, 0)
  const extras = customCategories(value)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CATEGORIES.map(({ key, icon, name }) => (
          <CategoryRow
            key={key}
            icon={icon}
            name={name}
            value={value[key] ?? 0}
            onSet={(v) => set(key, v)}
          />
        ))}
        {extras.map((key) => (
          <CategoryRow
            key={key}
            icon={CUSTOM_ICON}
            name={key.replace(/_/g, ' ')}
            value={value[key] ?? 0}
            onSet={(v) => set(key, v)}
            onRemove={() => removeCustom(key)}
          />
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); confirmAdd() }
              if (e.key === 'Escape') { setAdding(false); setNewName('') }
            }}
            placeholder="Nombre de la categoría..."
            className="flex-1 px-3 py-2 text-sm border border-blue-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={confirmAdd}
            className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <span className="text-lg">+</span> Agregar categoría
        </button>
      )}

      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <span className="text-sm font-medium text-blue-800">Total de cajas</span>
        <span className="text-xl font-bold text-blue-600">{total}</span>
      </div>
    </div>
  )
}

interface RowProps {
  icon:     string
  name:     string
  value:    number
  onSet:    (v: number) => void
  onRemove?: () => void
}

function CategoryRow({ icon, name, value, onSet, onRemove }: RowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium text-gray-700 leading-tight capitalize">{name}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onSet(value - 1)}
          className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-white rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition text-base"
        >−</button>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onSet(parseInt(e.target.value))}
          className="w-12 text-center text-sm font-semibold border border-gray-300 rounded-md py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onSet(value + 1)}
          className="w-7 h-7 flex items-center justify-center border border-blue-500 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 transition text-base"
        >+</button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition ml-0.5"
            title="Eliminar categoría"
          >×</button>
        )}
      </div>
    </div>
  )
}
