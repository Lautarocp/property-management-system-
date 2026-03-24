import apiClient from './client'

export interface DashboardStats {
  totalComplexes: number
  totalApartments: number
  availableApartments: number
  occupiedApartments: number
  totalTenants: number
  activeLeases: number
  pendingPayments: number
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats').then(r => r.data),
}
