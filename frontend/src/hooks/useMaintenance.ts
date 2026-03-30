import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi, type CreateMaintenancePayload, type UpdateMaintenancePayload } from '@/api/maintenance.api'

export function useMaintenance(apartmentId?: string, status?: string) {
  return useQuery({
    queryKey: ['maintenance', apartmentId, status],
    queryFn: () => maintenanceApi.getAll(apartmentId, status),
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMaintenancePayload) => maintenanceApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useUpdateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenancePayload }) => maintenanceApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}

export function useDeleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  })
}
