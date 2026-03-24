import { NavLink } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/complexes', label: 'Complexes', icon: '🏢' },
  { to: '/apartments', label: 'Apartments', icon: '🏠' },
  { to: '/tenants', label: 'Tenants', icon: '👥' },
]

export function Sidebar() {
  const logout = useLogout()
  const user = useAuthStore(s => s.user)

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

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-3">
          <p className="font-medium text-gray-200">{user?.firstName} {user?.lastName}</p>
          <p>{user?.email}</p>
          <p className="mt-1 inline-block bg-blue-600 text-white px-2 py-0.5 rounded text-xs">{user?.role}</p>
        </div>
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
