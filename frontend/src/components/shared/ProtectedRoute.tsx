import { Navigate } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  // Placeholder for Phase 2 - Auth implementation
  const isAuthenticated = !!localStorage.getItem('token')

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
