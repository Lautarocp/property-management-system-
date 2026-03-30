import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apartmentsApi, type CreateApartmentPayload } from '@/api/apartments.api'

export function useApartments(complexId?: string) {
  return useQuery({
    queryKey: ['apartments', complexId],
    queryFn: () => apartmentsApi.getAll(complexId),
  })
}

export function useCreateApartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateApartmentPayload) => apartmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  })
}

export function useUpdateApartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApartmentPayload> }) =>
      apartmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  })
}

export function useDeleteApartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apartmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  })
}

export function useIncreaseRent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, percentage }: { id: string; percentage: number }) =>
      apartmentsApi.increaseRent(id, percentage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  })
}
