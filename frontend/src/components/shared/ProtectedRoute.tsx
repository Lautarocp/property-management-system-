import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, user, setUser } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      authApi.me().then(setUser).catch(() => {})
    }
  }, [isAuthenticated, user, setUser])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
