import apiClient from './client'

export const billingApi = {
  generateMonthlyRent: (month?: string) =>
    apiClient.post<{ created: number; skipped: number }>('/billing/generate-monthly-rent', { month }).then(r => r.data),
}
