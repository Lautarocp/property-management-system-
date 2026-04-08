import apiClient from './client'
import type { RevenueByMonth, RevenueByComplex, OutstandingBalance } from '@/types'

export const reportsApi = {
  revenueByMonth: (complexId?: string) =>
    apiClient.get<RevenueByMonth[]>('/reports/revenue/by-month', { params: { complexId } }).then(r => r.data),
  revenueByComplex: () =>
    apiClient.get<RevenueByComplex[]>('/reports/revenue/by-complex').then(r => r.data),
  outstandingBalances: () =>
    apiClient.get<OutstandingBalance[]>('/reports/outstanding-balances').then(r => r.data),
  maintenanceCosts: (complexId?: string, from?: string, to?: string) =>
    apiClient.get<{ total: number }>('/reports/maintenance-costs', { params: { complexId, from, to } }).then(r => r.data),
  expensesByCategory: (complexId?: string) =>
    apiClient.get<{ category: string; total: number }[]>('/reports/expenses/by-category', { params: { complexId } }).then(r => r.data),
}
