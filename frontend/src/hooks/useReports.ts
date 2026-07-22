import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports.api'

export function useRevenueByMonth(complexId?: string) {
  return useQuery({
    queryKey: ['reports-revenue-month', complexId],
    queryFn: () => reportsApi.revenueByMonth(complexId || undefined),
  })
}

export function useRevenueByComplex() {
  return useQuery({
    queryKey: ['reports-revenue-complex'],
    queryFn: reportsApi.revenueByComplex,
  })
}

export function useOutstandingBalances() {
  return useQuery({
    queryKey: ['reports-outstanding'],
    queryFn: reportsApi.outstandingBalances,
  })
}

export function useMaintenanceCosts(complexId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports-maintenance-costs', complexId, from, to],
    queryFn: () => reportsApi.maintenanceCosts(complexId || undefined, from || undefined, to || undefined),
  })
}

export function useExpensesByCategory(complexId?: string) {
  return useQuery({
    queryKey: ['reports-expenses-category', complexId],
    queryFn: () => reportsApi.expensesByCategory(complexId || undefined),
  })
}
