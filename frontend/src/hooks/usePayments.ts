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
    mutationFn: ({ id, paidItemIds }: { id: string; paidItemIds?: string[] }) =>
      paymentsApi.markAsPaid(id, paidItemIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useMarkAsUnpaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.markAsUnpaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentPayload> }) =>
      paymentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }) },
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDownloadPaymentPdf() {
  return useMutation({
    mutationFn: async (payment: { id: string; tenantName: string }) => {
      const blob = await paymentsApi.downloadPdf(payment.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante-${payment.tenantName.replace(/\s+/g, '-')}-${payment.id.slice(-6)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
