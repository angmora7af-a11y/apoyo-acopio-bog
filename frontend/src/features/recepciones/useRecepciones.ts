import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecepciones, confirmarRecepcion } from '@/api/recepciones'

export const KEYS = {
  all:  ['recepciones'] as const,
  list: (p?: object) => ['recepciones', 'list', p] as const,
}

export function useRecepciones() {
  return useQuery({ queryKey: KEYS.list(), queryFn: () => getRecepciones() })
}

export function useConfirmarRecepcion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: confirmarRecepcion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: ['envios'] })
      qc.invalidateQueries({ queryKey: ['donaciones'] })
    },
  })
}
