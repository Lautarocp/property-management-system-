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
  const { data: stats, isLoading } = useDashboardStats()
  const { data: financial, isLoading: financialLoading } = useFinancialSummary()

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
      <p className="text-gray-500 mb-8">Overview of your properties</p>

      {isLoading ? (
        <div className="text-gray-400">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard label="Complexes" value={stats?.totalComplexes} icon="🏢" color="bg-blue-100" />
          <StatCard label="Total Apartments" value={stats?.totalApartments} icon="🏠" color="bg-purple-100" />
          <StatCard label="Available" value={stats?.availableApartments} icon="✅" color="bg-green-100" />
          <StatCard label="Occupied" value={stats?.occupiedApartments} icon="🔑" color="bg-orange-100" />
          <StatCard label="Tenants" value={stats?.totalTenants} icon="👥" color="bg-cyan-100" />
          <StatCard label="Active Leases" value={stats?.activeLeases} icon="📄" color="bg-indigo-100" />
          <StatCard label="Pending Payments" value={stats?.pendingPayments} icon="💰" color="bg-yellow-100" />
          <StatCard label="Overdue Payments" value={stats?.overduePayments} icon="⚠️" color="bg-red-100" />
        </div>
      )}

      {/* Financial summary */}
      <h3 className="text-lg font-semibold text-gray-900 mt-10 mb-5">Financial Summary</h3>
      {financialLoading ? (
        <div className="text-gray-400 text-sm">Loading financial data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            label="Total Revenue"
            value={financial?.totalRevenue}
            icon="📈"
            color="bg-green-100"
            valueClass="text-green-700"
          />
          <FinancialCard
            label="Total Charges"
            value={financial?.totalCharges}
            icon="📋"
            color="bg-blue-100"
          />
          <FinancialCard
            label="Outstanding"
            value={financial?.totalOutstanding}
            icon="⏳"
            color="bg-red-100"
            valueClass={financial?.totalOutstanding ? 'text-red-600' : 'text-gray-900'}
          />
          <FinancialCard
            label="Total Expenses"
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
