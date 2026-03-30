import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/complexes', label: 'Complexes', icon: '🏢' },
  { to: '/apartments', label: 'Apartments', icon: '🏠' },
  { to: '/tenants', label: 'Tenants', icon: '👥' },
  { to: '/payments', label: 'Payments', icon: '💰' },
  { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
]

export function Sidebar() {
  const logout = useLogout()
  const token = useAuthStore(s => s.token)
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
    staleTime: Infinity,
  })

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">PMS</h1>
        <p className="text-xs text-gray-400 mt-1">Property Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <span className="ml-auto shrink-0 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
              {user.role}
            </span>
          </div>
        ) : (
          <div className="h-8 bg-gray-800 rounded animate-pulse" />
        )}
        <button
          onClick={logout}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
