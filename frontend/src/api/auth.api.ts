import apiClient from './client'
import type { User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  access_token: string
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', data).then(r => r.data),
  register: (data: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),
  me: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),
}
