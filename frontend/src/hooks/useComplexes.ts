import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complexesApi, type CreateComplexPayload } from '@/api/complexes.api'

export function useComplexes() {
  return useQuery({ queryKey: ['complexes'], queryFn: complexesApi.getAll })
}

export function useCreateComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateComplexPayload) => complexesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complexes'] }),
  })
}

export function useUpdateComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateComplexPayload> }) =>
      complexesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complexes'] }),
  })
}

export function useDeleteComplex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => complexesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complexes'] }),
  })
}
