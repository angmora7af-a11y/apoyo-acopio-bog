import client from './client'
import type { Recepcion, TipoTransporte } from '@/types'

export interface CrearRecepcionPayload {
  receptor_nombre:    string
  envio_id:           string
  tipo_transporte?:   TipoTransporte
  capacidad_ton?:     number
  empresa?:           string
  responsable_nombre?: string
  contacto?:          string
  placa?:             string
  fecha_hora:         string
  ciudad_origen?:     string
  ciudad_destino?:    string
}

export async function getRecepciones(params?: { page?: number; limit?: number }): Promise<Recepcion[]> {
  const { data } = await client.get<Recepcion[]>('/recepciones', { params })
  return data
}

export async function getRecepcion(id: string): Promise<Recepcion> {
  const { data } = await client.get<Recepcion>(`/recepciones/${id}`)
  return data
}

export async function confirmarRecepcion(payload: CrearRecepcionPayload): Promise<Recepcion> {
  const { data } = await client.post<Recepcion>('/recepciones', payload)
  return data
}
