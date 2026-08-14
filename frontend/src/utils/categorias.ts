import type { CategoriasKits } from '@/types'

export interface CategoriaConfig {
  key:  keyof CategoriasKits
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

export const EMPTY_CATEGORIAS: CategoriasKits = {
  aseo: 0, alimentos: 0, mascotas: 0, medicamentos: 0,
  insumos: 0, rescate: 0, refugio: 0, ropa: 0,
}

export function totalCajas(c: CategoriasKits): number {
  return Object.values(c).reduce((s, v) => s + v, 0)
}

export function sumarCategorias(a: CategoriasKits, b: CategoriasKits): CategoriasKits {
  return {
    aseo:         a.aseo + b.aseo,
    alimentos:    a.alimentos + b.alimentos,
    mascotas:     a.mascotas + b.mascotas,
    medicamentos: a.medicamentos + b.medicamentos,
    insumos:      a.insumos + b.insumos,
    rescate:      a.rescate + b.rescate,
    refugio:      a.refugio + b.refugio,
    ropa:         a.ropa + b.ropa,
  }
}
