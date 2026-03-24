import { useDashboardStats } from '@/hooks/useDashboard'

interface StatCardProps {
  label: string
  value: number | undefined
  icon: string
  color: string
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

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

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
          <StatCard label="Pending Payments" value={stats?.pendingPayments} icon="💰" color="bg-red-100" />
        </div>
      )}
    </div>
  )
}
