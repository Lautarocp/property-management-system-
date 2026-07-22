import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'

export function Sidebar() {
  const logout = useLogout()
  const token = useAuthStore(s => s.token)
  const { t, i18n } = useTranslation()
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
    staleTime: Infinity,
  })

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: '📊' },
    { to: '/complexes', label: t('nav.complexes'), icon: '🏢' },
    { to: '/apartments', label: t('nav.apartments'), icon: '🏠' },
    { to: '/tenants', label: t('nav.tenants'), icon: '👥' },
    { to: '/payments', label: t('nav.payments'), icon: '💰' },
    { to: '/maintenance', label: t('nav.maintenance'), icon: '🔧' },
    { to: '/expenses', label: t('nav.expenses'), icon: '💸' },
    { to: '/billing', label: t('nav.billing'), icon: '🗓️' },
    { to: '/reports', label: t('nav.reports'), icon: '📈' },
  ]

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('pms-lang', next)
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">{t('nav.appName')}</h1>
        <p className="text-xs text-gray-400 mt-1">{t('nav.propertyManagement')}</p>
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
        <div className="flex items-center justify-between">
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t('nav.signOut')}
          </button>
          <button
            onClick={toggleLanguage}
            className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 rounded px-2 py-0.5 transition-colors font-medium"
            title={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
          >
            {i18n.language === 'en' ? 'ES' : 'EN'}
          </button>
        </div>
      </div>
    </aside>
  )
}
