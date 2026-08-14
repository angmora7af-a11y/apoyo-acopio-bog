import client from './client'
import type { Rol, SessionData } from '@/types'

export interface LoginPayload { nombre: string; documento: string; rol: Rol }

interface LoginResponseApi {
  access_token: string
  voluntario:   { id: string; nombre: string; documento: string; rol: Rol }
}

export async function login(payload: LoginPayload): Promise<SessionData> {
  const { data } = await client.post<LoginResponseApi>('/auth/login', payload)
  return { ...data.voluntario, token: data.access_token }
}
