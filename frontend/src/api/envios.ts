import client from './client'
import type { Envio, TipoTransporte } from '@/types'

export interface CrearEnvioPayload {
  tipo_transporte:    TipoTransporte
  capacidad_ton?:     number
  empresa?:           string
  placa?:             string
  responsable_nombre: string
  contacto?:          string
  fecha_hora:         string
  ciudad_origen:      string
  ciudad_destino:     string
  donaciones_ids:     string[]
}

export async function getEnvios(params?: {
  estado?: string; ciudad_destino?: string; page?: number; limit?: number
}): Promise<Envio[]> {
  const { data } = await client.get<Envio[]>('/envios', { params })
  return data
}

export async function getEnvio(id: string): Promise<Envio> {
  const { data } = await client.get<Envio>(`/envios/${id}`)
  return data
}

export async function getEnviosDisponiblesRecepcion(): Promise<Envio[]> {
  const { data } = await client.get<Envio[]>('/envios/disponibles-recepcion')
  return data
}

export async function crearEnvio(payload: CrearEnvioPayload): Promise<Envio> {
  const { data } = await client.post<Envio>('/envios', payload)
  return data
}
