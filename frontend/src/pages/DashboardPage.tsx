import { useTranslation } from 'react-i18next'
import { useDashboardStats, useFinancialSummary } from '@/hooks/useDashboard'

interface StatCardProps {
  label: string
  value: number | undefined
  icon: string
  color: string
}

interface FinancialCardProps {
  label: string
  value: number | undefined
  icon: string
  color: string
  valueClass?: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function FinancialCard({ label, value, icon, color, valueClass = 'text-gray-900' }: FinancialCardProps) {
  const formatted = value != null
    ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—'
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>{formatted}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: financial, isLoading: financialLoading } = useFinancialSummary()

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h2>
      <p className="text-gray-500 mb-8">{t('dashboard.subtitle')}</p>

      {isLoading ? (
        <div className="text-gray-400">{t('dashboard.loadingStats')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard label={t('dashboard.complexes')} value={stats?.totalComplexes} icon="🏢" color="bg-blue-100" />
          <StatCard label={t('dashboard.totalApartments')} value={stats?.totalApartments} icon="🏠" color="bg-purple-100" />
          <StatCard label={t('dashboard.available')} value={stats?.availableApartments} icon="✅" color="bg-green-100" />
          <StatCard label={t('dashboard.occupied')} value={stats?.occupiedApartments} icon="🔑" color="bg-orange-100" />
          <StatCard label={t('dashboard.tenants')} value={stats?.totalTenants} icon="👥" color="bg-cyan-100" />
          <StatCard label={t('dashboard.activeLeases')} value={stats?.activeLeases} icon="📄" color="bg-indigo-100" />
          <StatCard label={t('dashboard.pendingPayments')} value={stats?.pendingPayments} icon="💰" color="bg-yellow-100" />
          <StatCard label={t('dashboard.overduePayments')} value={stats?.overduePayments} icon="⚠️" color="bg-red-100" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mt-10 mb-5">{t('dashboard.financialSummary')}</h3>
      {financialLoading ? (
        <div className="text-gray-400 text-sm">{t('dashboard.loadingFinancial')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            label={t('dashboard.totalRevenue')}
            value={financial?.totalRevenue}
            icon="📈"
            color="bg-green-100"
            valueClass="text-green-700"
          />
          <FinancialCard
            label={t('dashboard.totalCharges')}
            value={financial?.totalCharges}
            icon="📋"
            color="bg-blue-100"
          />
          <FinancialCard
            label={t('dashboard.outstanding')}
            value={financial?.totalOutstanding}
            icon="⏳"
            color="bg-red-100"
            valueClass={financial?.totalOutstanding ? 'text-red-600' : 'text-gray-900'}
          />
          <FinancialCard
            label={t('dashboard.totalExpenses')}
            value={financial?.totalExpenses}
            icon="💸"
            color="bg-orange-100"
            valueClass="text-orange-600"
          />
        </div>
      )}
    </div>
  )
}
