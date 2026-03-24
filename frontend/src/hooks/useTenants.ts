import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsApi, type CreateTenantPayload } from '@/api/tenants.api'

export function useTenants() {
  return useQuery({ queryKey: ['tenants'], queryFn: tenantsApi.getAll })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantPayload) => tenantsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTenantPayload> }) =>
      tenantsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}

export function useDeleteTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}
