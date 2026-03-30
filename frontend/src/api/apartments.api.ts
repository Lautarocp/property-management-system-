import apiClient from './client'
import type { Apartment } from '@/types'

export interface CreateApartmentPayload {
  number: string
  floor?: number
  area?: number
  monthlyRent: number
  status?: Apartment['status']
  complexId: string
}

export const apartmentsApi = {
  getAll: (complexId?: string) =>
    apiClient.get<Apartment[]>('/apartments', { params: complexId ? { complexId } : {} }).then(r => r.data),
  getOne: (id: string) => apiClient.get<Apartment>(`/apartments/${id}`).then(r => r.data),
  create: (data: CreateApartmentPayload) => apiClient.post<Apartment>('/apartments', data).then(r => r.data),
  update: (id: string, data: Partial<CreateApartmentPayload>) =>
    apiClient.patch<Apartment>(`/apartments/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/apartments/${id}`).then(r => r.data),
  increaseRent: (id: string, percentage: number) =>
    apiClient.patch(`/apartments/${id}/increase-rent`, { percentage }).then(r => r.data),
}
