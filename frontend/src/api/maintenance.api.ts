import apiClient from './client'
import type { MaintenanceRequest } from '@/types'

export interface CreateMaintenancePayload {
  title: string
  description: string
  apartmentId: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  repairCost?: number
  tenantChargeAmount?: number
  notes?: string
}

export interface UpdateMaintenancePayload {
  title?: string
  description?: string
  status?: MaintenanceRequest['status']
  priority?: MaintenanceRequest['priority']
  repairCost?: number
  tenantChargeAmount?: number
  notes?: string
}

export const maintenanceApi = {
  getAll: (apartmentId?: string, status?: string) =>
    apiClient.get<MaintenanceRequest[]>('/maintenance', {
      params: {
        ...(apartmentId ? { apartmentId } : {}),
        ...(status ? { status } : {}),
      },
    }).then(r => r.data),
  getOne: (id: string) => apiClient.get<MaintenanceRequest>(`/maintenance/${id}`).then(r => r.data),
  create: (data: CreateMaintenancePayload) => apiClient.post<MaintenanceRequest>('/maintenance', data).then(r => r.data),
  update: (id: string, data: UpdateMaintenancePayload) => apiClient.patch<MaintenanceRequest>(`/maintenance/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/maintenance/${id}`).then(r => r.data),
}
