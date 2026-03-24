import apiClient from './client'
import type { Tenant } from '@/types'

export interface CreateTenantPayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dni?: string
  birthDate?: string
  notes?: string
}

export const tenantsApi = {
  getAll: () => apiClient.get<Tenant[]>('/tenants').then(r => r.data),
  getOne: (id: string) => apiClient.get<Tenant>(`/tenants/${id}`).then(r => r.data),
  create: (data: CreateTenantPayload) => apiClient.post<Tenant>('/tenants', data).then(r => r.data),
  update: (id: string, data: Partial<CreateTenantPayload>) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/tenants/${id}`).then(r => r.data),
}
