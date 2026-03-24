import apiClient from './client'
import type { Lease } from '@/types'

export interface CreateLeasePayload {
  apartmentId: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  notes?: string
}

export interface TransferLeasePayload {
  newApartmentId: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
}

export const leasesApi = {
  getAll: (apartmentId?: string) =>
    apiClient.get<Lease[]>('/leases', { params: apartmentId ? { apartmentId } : {} }).then(r => r.data),
  create: (data: CreateLeasePayload) => apiClient.post<Lease>('/leases', data).then(r => r.data),
  terminate: (id: string) => apiClient.patch(`/leases/${id}/terminate`).then(r => r.data),
  transfer: (id: string, data: TransferLeasePayload) =>
    apiClient.patch(`/leases/${id}/transfer`, data).then(r => r.data),
}
