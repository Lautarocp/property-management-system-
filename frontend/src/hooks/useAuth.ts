import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

export function useLogin() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: ({ user, access_token }) => {
      login(user, access_token)
      navigate('/')
    },
  })
}

export function useRegister() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: ({ user, access_token }) => {
      login(user, access_token)
      navigate('/')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/login')
  }
}
