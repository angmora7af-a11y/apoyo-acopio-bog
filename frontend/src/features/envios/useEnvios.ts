import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEnvios, crearEnvio, getEnviosDisponiblesRecepcion } from '@/api/envios'

export const KEYS = {
  all:         ['envios'] as const,
  list:        (p?: object) => ['envios', 'list', p] as const,
  disponibles: ['envios', 'disponibles'] as const,
}

export function useEnvios(params?: { estado?: string; ciudad_destino?: string }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => getEnvios(params) })
}

export function useEnviosDisponibles() {
  return useQuery({ queryKey: KEYS.disponibles, queryFn: getEnviosDisponiblesRecepcion })
}

export function useCrearEnvio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearEnvio,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
