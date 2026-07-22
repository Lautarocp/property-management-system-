import apiClient from './client'
import type { FinancialSummary } from '@/types'

export interface DashboardStats {
  totalComplexes: number
  totalApartments: number
  availableApartments: number
  occupiedApartments: number
  totalTenants: number
  activeLeases: number
  pendingPayments: number
  overduePayments: number
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats').then(r => r.data),
  getFinancialSummary: () => apiClient.get<FinancialSummary>('/dashboard/financial-summary').then(r => r.data),
}
