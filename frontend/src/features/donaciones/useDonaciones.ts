import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDonaciones, crearDonacion } from '@/api/donaciones'

export const KEYS = {
  all:  ['donaciones'] as const,
  list: (params?: object) => ['donaciones', 'list', params] as const,
}

export function useDonaciones(params?: { donante?: string }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => getDonaciones(params) })
}

export function useCrearDonacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearDonacion,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
