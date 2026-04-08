import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi, type CreateExpensePayload } from '@/api/expenses.api'

export function useExpenses(complexId?: string, category?: string) {
  return useQuery({
    queryKey: ['expenses', { complexId, category }],
    queryFn: () => expensesApi.getAll(complexId || undefined, category || undefined),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExpensePayload) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpensePayload> }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })
}
