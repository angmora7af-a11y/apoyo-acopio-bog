import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDonaciones, crearDonacion, cambiarEstadoDonacion } from '@/api/donaciones'
import type { EstadoDonacion } from '@/types'

export const KEYS = {
  all:  ['donaciones'] as const,
  list: (params?: object) => ['donaciones', 'list', params] as const,
}

export function useDonaciones(params?: { estado?: string; acopio?: string }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => getDonaciones(params) })
}

export function useCrearDonacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearDonacion,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useCambiarEstado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoDonacion }) =>
      cambiarEstadoDonacion(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
