import apiClient from './client'
import type { Payment } from '@/types'

export interface CreatePaymentPayload {
  leaseId: string
  amount: number
  dueDate: string
  type?: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER'
  notes?: string
}

export const paymentsApi = {
  getAll: (params?: { leaseId?: string; tenantId?: string; status?: string }) =>
    apiClient.get<Payment[]>('/payments', { params }).then(r => r.data),
  getOne: (id: string) => apiClient.get<Payment>(`/payments/${id}`).then(r => r.data),
  create: (data: CreatePaymentPayload) => apiClient.post<Payment>('/payments', data).then(r => r.data),
  markAsPaid: (id: string) => apiClient.patch<Payment>(`/payments/${id}/pay`).then(r => r.data),
}
