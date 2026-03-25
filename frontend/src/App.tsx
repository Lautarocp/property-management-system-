import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ComplexesPage } from '@/pages/complexes/ComplexesPage'
import { ApartmentsPage } from '@/pages/apartments/ApartmentsPage'
import { TenantsPage } from '@/pages/tenants/TenantsPage'
import { PaymentsPage } from '@/pages/payments/PaymentsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/complexes" element={<ComplexesPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
