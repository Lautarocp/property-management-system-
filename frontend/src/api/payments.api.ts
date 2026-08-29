import apiClient from './client'
import type { Payment } from '@/types'

export interface PaymentItemPayload {
  name: string
  amount: number
}

export interface CreatePaymentPayload {
  leaseId: string
  amount?: number
  dueDate: string
  type?: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER'
  notes?: string
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'MERCADO_PAGO'
  feeAmount?: number
  items?: PaymentItemPayload[]
}

export interface MarkAsPaidPayload {
  paidItemIds?: string[]
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'MERCADO_PAGO'
  feeAmount?: number
}

export const paymentsApi = {
  getAll: (params?: { leaseId?: string; tenantId?: string; status?: string }) =>
    apiClient.get<Payment[]>('/payments', { params }).then(r => r.data),
  getOne: (id: string) => apiClient.get<Payment>(`/payments/${id}`).then(r => r.data),
  create: (data: CreatePaymentPayload) => apiClient.post<Payment>('/payments', data).then(r => r.data),
  markAsPaid: (id: string, data: MarkAsPaidPayload) =>
    apiClient.patch<Payment>(`/payments/${id}/pay`, data).then(r => r.data),
  markAsUnpaid: (id: string) => apiClient.patch<Payment>(`/payments/${id}/unpay`).then(r => r.data),
  update: (id: string, data: Partial<CreatePaymentPayload>) =>
    apiClient.patch<Payment>(`/payments/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/payments/${id}`).then(r => r.data),
  downloadPdf: (id: string) =>
    apiClient.get(`/payments/${id}/pdf`, { responseType: 'blob' }).then(r => r.data),
}
