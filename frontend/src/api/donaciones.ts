import client from './client'
import type { Donacion, EstadoDonacion, CategoriasKits } from '@/types'

export interface CrearDonacionPayload {
  acopio:      string
  fecha_hora:  string
  destino?:    string
  comentarios?: string
  categorias:  CategoriasKits
  estado:      EstadoDonacion
}

export async function getDonaciones(params?: {
  estado?: string; acopio?: string; page?: number; limit?: number
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

export async function cambiarEstadoDonacion(id: string, estado: EstadoDonacion): Promise<Donacion> {
  const { data } = await client.patch<Donacion>(`/donaciones/${id}/estado`, { estado })
  return data
}
