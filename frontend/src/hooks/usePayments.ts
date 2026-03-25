import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi, type CreatePaymentPayload } from '@/api/payments.api'

export function usePayments(params?: { leaseId?: string; tenantId?: string; status?: string }) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getAll(params),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePaymentPayload) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useMarkAsPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.markAsPaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
