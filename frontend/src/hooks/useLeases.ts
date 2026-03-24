import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leasesApi, type CreateLeasePayload, type TransferLeasePayload } from '@/api/leases.api'

export function useCreateLease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeasePayload) => leasesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useTerminateLease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leasesApi.terminate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useTransferLease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferLeasePayload }) =>
      leasesApi.transfer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
