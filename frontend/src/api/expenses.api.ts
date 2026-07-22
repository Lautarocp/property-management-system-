import apiClient from './client'
import type { Expense } from '@/types'

export interface CreateExpensePayload {
  description: string
  amount: number
  date: string
  category?: Expense['category']
  complexId: string
  receipt?: string
  notes?: string
  maintenanceRequestId?: string
  distributeToTenants?: boolean
  assignToTenantId?: string
}

export const expensesApi = {
  getAll: (complexId?: string, category?: string) =>
    apiClient.get<Expense[]>('/expenses', { params: { complexId, category } }).then(r => r.data),
  getOne: (id: string) =>
    apiClient.get<Expense>(`/expenses/${id}`).then(r => r.data),
  create: (data: CreateExpensePayload) =>
    apiClient.post<Expense>('/expenses', data).then(r => r.data),
  update: (id: string, data: Partial<CreateExpensePayload>) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then(r => r.data),
}
