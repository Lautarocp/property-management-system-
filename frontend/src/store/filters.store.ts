import { create } from 'zustand'

interface PaymentsFilters {
  status: 'ALL' | 'PENDING' | 'OVERDUE' | 'PAID'
}

interface MaintenanceFilters {
  apartmentId: string
  status: string
}

interface ExpensesFilters {
  complexId: string
  category: string
}

interface FiltersStore {
  payments: PaymentsFilters
  maintenance: MaintenanceFilters
  expenses: ExpensesFilters
  setPaymentsFilter: (f: Partial<PaymentsFilters>) => void
  setMaintenanceFilter: (f: Partial<MaintenanceFilters>) => void
  setExpensesFilter: (f: Partial<ExpensesFilters>) => void
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  payments: { status: 'ALL' },
  maintenance: { apartmentId: '', status: '' },
  expenses: { complexId: '', category: '' },

  setPaymentsFilter: (f) =>
    set((s) => ({ payments: { ...s.payments, ...f } })),
  setMaintenanceFilter: (f) =>
    set((s) => ({ maintenance: { ...s.maintenance, ...f } })),
  setExpensesFilter: (f) =>
    set((s) => ({ expenses: { ...s.expenses, ...f } })),
}))
