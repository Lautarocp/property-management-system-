import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leasesApi, type CreateLeasePayload, type TransferLeasePayload, type LeaseItemPayload } from '@/api/leases.api'

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
    mutationFn: ({ id, deductFromDeposit }: { id: string; deductFromDeposit?: boolean }) =>
      leasesApi.terminate(id, deductFromDeposit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
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

export function useAddLeaseItem(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaseId, data }: { leaseId: string; data: LeaseItemPayload }) =>
      leasesApi.addItem(leaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant', tenantId] })
      qc.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export function useUpdateLeaseItem(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaseId, itemId, data }: { leaseId: string; itemId: string; data: LeaseItemPayload }) =>
      leasesApi.updateItem(leaseId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant', tenantId] })
      qc.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export function useRemoveLeaseItem(tenantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaseId, itemId }: { leaseId: string; itemId: string }) =>
      leasesApi.removeItem(leaseId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant', tenantId] })
      qc.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export function useAddLeaseItemForApartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaseId, data }: { leaseId: string; data: LeaseItemPayload }) =>
      leasesApi.addItem(leaseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['tenant'] })
    },
  })
}

export function useRemoveLeaseItemForApartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaseId, itemId }: { leaseId: string; itemId: string }) =>
      leasesApi.removeItem(leaseId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['apartments'] })
      qc.invalidateQueries({ queryKey: ['tenant'] })
    },
  })
}
