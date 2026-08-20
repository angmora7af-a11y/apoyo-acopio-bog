import type { CategoriasKits } from '@/types'

export interface CategoriaConfig {
  key:  string
  icon: string
  name: string
}

export const CATEGORIES: CategoriaConfig[] = [
  { key: 'aseo',         icon: '🧴', name: 'Aseo / Cuidado personal' },
  { key: 'alimentos',    icon: '🥫', name: 'Alimentos no perecederos' },
  { key: 'mascotas',     icon: '🐾', name: 'Alimentos para mascotas' },
  { key: 'medicamentos', icon: '💊', name: 'Medicamentos' },
  { key: 'insumos',      icon: '🩺', name: 'Insumos médicos' },
  { key: 'rescate',      icon: '⛑️',  name: 'Suministros de rescate' },
  { key: 'refugio',      icon: '🏕️',  name: 'Refugio' },
  { key: 'ropa',         icon: '👕', name: 'Ropa' },
]

const KNOWN_KEYS = new Set(CATEGORIES.map((c) => c.key))

export const CUSTOM_ICON = '📦'

export const EMPTY_CATEGORIAS: CategoriasKits = {
  aseo: 0, alimentos: 0, mascotas: 0, medicamentos: 0,
  insumos: 0, rescate: 0, refugio: 0, ropa: 0,
}

<<<<<<< HEAD
export function totalCajas(c: CategoriasKits): number {
  return Object.values(c).reduce((s, v) => s + v, 0)
}

export function sumarCategorias(a: CategoriasKits, b: CategoriasKits): CategoriasKits {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const result: CategoriasKits = { ...EMPTY_CATEGORIAS }
  keys.forEach((k) => { result[k] = (a[k] ?? 0) + (b[k] ?? 0) })
  return result
}

export function customCategories(c: CategoriasKits): string[] {
  return Object.keys(c).filter((k) => !KNOWN_KEYS.has(k))
}
=======
>>>>>>> 6454f18a99171ebb1221c985a1661387fb2ec240
