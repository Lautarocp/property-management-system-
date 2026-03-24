import apiClient from './client'
import type { ApartmentComplex } from '@/types'

export interface CreateComplexPayload {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  description?: string
}

export const complexesApi = {
  getAll: () => apiClient.get<ApartmentComplex[]>('/complexes').then(r => r.data),
  getOne: (id: string) => apiClient.get<ApartmentComplex>(`/complexes/${id}`).then(r => r.data),
  create: (data: CreateComplexPayload) => apiClient.post<ApartmentComplex>('/complexes', data).then(r => r.data),
  update: (id: string, data: Partial<CreateComplexPayload>) => apiClient.patch<ApartmentComplex>(`/complexes/${id}`, data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/complexes/${id}`).then(r => r.data),
}
