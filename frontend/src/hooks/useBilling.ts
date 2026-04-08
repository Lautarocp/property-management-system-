import { useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '@/api/billing.api'

export function useGenerateMonthlyRent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (month?: string) => billingApi.generateMonthlyRent(month),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}
