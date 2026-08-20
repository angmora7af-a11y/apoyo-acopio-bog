import client from './client'
import type { Donacion, CategoriasKits } from '@/types'

export interface CrearDonacionPayload {
  fecha_hora:      string
  donante_nombre:  string
  receptor_nombre: string
  categorias:      CategoriasKits
  comentarios?:    string
}

export async function getDonaciones(params?: {
  donante?: string; page?: number; limit?: number
}): Promise<Donacion[]> {
  const { data } = await client.get<Donacion[]>('/donaciones', { params })
  return data
}

export async function getDonacion(id: string): Promise<Donacion> {
  const { data } = await client.get<Donacion>(`/donaciones/${id}`)
  return data
}

export async function crearDonacion(payload: CrearDonacionPayload): Promise<Donacion> {
  const { data } = await client.post<Donacion>('/donaciones', payload)
  return data
}
