import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats })
}

export function useFinancialSummary() {
  return useQuery({ queryKey: ['financial-summary'], queryFn: dashboardApi.getFinancialSummary })
}
