import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  useRevenueByMonth,
  useRevenueByComplex,
  useOutstandingBalances,
  useMaintenanceCosts,
  useExpensesByCategory,
} from '@/hooks/useReports'
import { complexesApi } from '@/api/complexes.api'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280']

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function LoadingCard() {
  return <div className="bg-gray-50 rounded-xl h-48 animate-pulse" />
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 rounded-xl h-48 flex items-center justify-center">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}

function RevenueByMonthSection({ complexes }: { complexes: any[] }) {
  const { t } = useTranslation()
  const [complexId, setComplexId] = useState('')
  const { data, isLoading } = useRevenueByMonth(complexId || undefined)

  const chartData = (data ?? []).map(d => ({
    month: d.month,
    revenue: Number(d.total),
  }))

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-5">
        <SectionHeader
          title={t('reports.revenueByMonth')}
          subtitle={t('reports.revenueTotal', { total: totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
        />
        <select
          value={complexId}
          onChange={e => setComplexId(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="">{t('common.allComplexes')}</option>
          {complexes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : !chartData.length ? (
        <EmptyState message={t('reports.noRevenue')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, t('reports.revenue')]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

function RevenueByComplexSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useRevenueByComplex()

  const chartData = (data ?? []).map(d => ({
    name: d.complexName,
    value: Number(d.total),
  }))

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <SectionHeader title={t('reports.revenueByComplex')} />

      {isLoading ? (
        <LoadingCard />
      ) : !chartData.length ? (
        <EmptyState message={t('reports.noRevenue')} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, t('reports.revenue')]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full lg:w-64 space-y-2">
            {chartData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-700">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">${d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function OutstandingBalancesSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useOutstandingBalances()

  const sorted = [...(data ?? [])].sort((a, b) => Number(b.balance) - Number(a.balance))

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <SectionHeader
        title={t('reports.outstandingBalances')}
        subtitle={t('reports.outstandingSubtitle')}
      />

      {isLoading ? (
        <LoadingCard />
      ) : !sorted.length ? (
        <EmptyState message={t('reports.allClear')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">{t('reports.colTenant')}</th>
                <th className="px-4 py-2 text-right">{t('reports.colBalance')}</th>
                <th className="px-4 py-2 text-left">{t('reports.colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(b => {
                const balance = Number(b.balance)
                return (
                  <tr key={b.tenantId} className={balance > 0 ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {b.firstName} {b.lastName}
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {balance > 0 ? t('reports.owes') : t('reports.paidUp')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function MaintenanceCostsSection({ complexes }: { complexes: any[] }) {
  const { t } = useTranslation()
  const [complexId, setComplexId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { data, isLoading } = useMaintenanceCosts(complexId || undefined, from || undefined, to || undefined)

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <SectionHeader title={t('reports.maintenanceCosts')} subtitle={t('reports.maintenanceCostsSubtitle')} />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={complexId}
          onChange={e => setComplexId(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="">{t('common.allComplexes')}</option>
          {complexes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
          placeholder={t('reports.from')}
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
          placeholder={t('reports.to')}
        />
      </div>

      {isLoading ? (
        <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 inline-flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🔧</div>
          <div>
            <p className="text-sm text-gray-500">{t('reports.totalMaintenanceCharges')}</p>
            <p className="text-3xl font-bold text-gray-900">
              ${Number(data?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

function ExpensesByCategorySection({ complexes }: { complexes: any[] }) {
  const { t } = useTranslation()
  const [complexId, setComplexId] = useState('')
  const { data, isLoading } = useExpensesByCategory(complexId || undefined)

  const categoryLabels: Record<string, string> = {
    REPAIRS: t('expenses.catRepairs'),
    UTILITIES: t('expenses.catUtilities'),
    CLEANING: t('expenses.catCleaning'),
    INSURANCE: t('expenses.catInsurance'),
    TAXES: t('expenses.catTaxes'),
    STAFF: t('expenses.catStaff'),
    OTHER: t('expenses.catOther'),
  }

  const chartData = (data ?? []).map(d => ({
    name: categoryLabels[d.category] ?? d.category,
    value: Number(d.total),
  }))

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-5">
        <SectionHeader title={t('reports.expensesByCategory')} />
        <select
          value={complexId}
          onChange={e => setComplexId(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="">{t('common.allComplexes')}</option>
          {complexes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : !chartData.length ? (
        <EmptyState message={t('reports.noExpenses')} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, t('common.total')]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full lg:w-64 space-y-2">
            {chartData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-700">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">${d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function ReportsPage() {
  const { t } = useTranslation()
  const { data: complexes = [] } = useQuery({ queryKey: ['complexes'], queryFn: complexesApi.getAll })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
        <p className="text-gray-500 text-sm mt-1">{t('reports.subtitle')}</p>
      </div>

      <RevenueByMonthSection complexes={complexes as any[]} />
      <RevenueByComplexSection />
      <OutstandingBalancesSection />
      <MaintenanceCostsSection complexes={complexes as any[]} />
      <ExpensesByCategorySection complexes={complexes as any[]} />
    </div>
  )
}
