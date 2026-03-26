import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { usePayments, useCreatePayment, useMarkAsPaid, useMarkAsUnpaid, useUpdatePayment, useDeletePayment } from '@/hooks/usePayments'
import { leasesApi } from '@/api/leases.api'
import type { CreatePaymentPayload } from '@/api/payments.api'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const TYPE_LABELS: Record<string, string> = {
  RENT: 'Rent',
  DEPOSIT: 'Deposit',
  LATE_FEE: 'Late Fee',
  OTHER: 'Other',
}

const FILTERS = ['ALL', 'PENDING', 'OVERDUE', 'PAID'] as const

function CreatePaymentForm({ onSubmit, onCancel, isLoading }: {
  onSubmit: (data: CreatePaymentPayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: leases } = useQuery({
    queryKey: ['leases'],
    queryFn: () => leasesApi.getAll(),
  })
  const activeLeases = (leases as any[])?.filter(l => l.status === 'ACTIVE') ?? []

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePaymentPayload>()
  const selectedLeaseId = watch('leaseId')
  const [percentMode, setPercentMode] = useState(false)
  const [percent, setPercent] = useState('')
  const selectedLease = activeLeases.find((l: any) => l.id === selectedLeaseId)
  const monthlyRent = selectedLease ? Number(selectedLease.monthlyRent) : 0

  const calcAmount = (rent: number, pct: number) =>
    Math.round((rent + rent * pct / 100) * 100) / 100

  const handleLeaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value
    setValue('leaseId', leaseId)
    const lease = activeLeases.find((l: any) => l.id === leaseId)
    if (lease) {
      const rent = Number(lease.monthlyRent)
      if (percentMode && percent) {
        setValue('amount', calcAmount(rent, Number(percent)))
      } else {
        setValue('amount', rent)
      }
    }
  }

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPercent(val)
    if (monthlyRent && val) {
      setValue('amount', calcAmount(monthlyRent, Number(val)))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lease (Tenant → Apartment) *</label>
          <select
            {...register('leaseId', { required: true })}
            onChange={handleLeaseChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a lease...</option>
            {activeLeases.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.tenant.firstName} {l.tenant.lastName} → #{l.apartment.number} ({l.apartment.complex?.name}) — ${Number(l.monthlyRent).toLocaleString()}/mo
              </option>
            ))}
          </select>
          {errors.leaseId && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Amount *</label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={percentMode}
                onChange={e => {
                  setPercentMode(e.target.checked)
                  if (!e.target.checked) setPercent('')
                }}
                className="w-3.5 h-3.5"
              />
              <span className="text-xs text-gray-500">% of rent</span>
            </label>
          </div>
          {percentMode ? (
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percent}
                  onChange={handlePercentChange}
                  placeholder="e.g. 50"
                  className="w-full border rounded-lg px-3 py-2 text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              {monthlyRent > 0 && percent && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  = ${calcAmount(monthlyRent, Number(percent)).toLocaleString()}
                </span>
              )}
            </div>
          ) : null}
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: true, valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 text-sm ${percentMode ? 'mt-2 bg-gray-50' : ''}`}
            readOnly={percentMode}
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input
            type="date"
            {...register('dueDate', { required: true })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select {...register('type')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="RENT">Rent</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="LATE_FEE">Late Fee</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input {...register('notes')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Create Payment'}
        </button>
      </div>
    </form>
  )
}

function EditPaymentModal({ payment, onClose }: { payment: any; onClose: () => void }) {
  const updatePayment = useUpdatePayment()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: Number(payment.amount),
      dueDate: payment.dueDate?.split('T')[0],
      type: payment.type,
      notes: payment.notes ?? '',
    },
  })

  const onSubmit = (data: any) => {
    updatePayment.mutate(
      { id: payment.id, data: { ...data, amount: Number(data.amount) } },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-1">Edit Payment</h3>
        <p className="text-sm text-gray-500 mb-4">
          {payment.tenant.firstName} {payment.tenant.lastName} — #{payment.lease.apartment.number}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" {...register('dueDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select {...register('type')} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="RENT">Rent</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="LATE_FEE">Late Fee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input {...register('notes')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={updatePayment.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {updatePayment.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'PAID'>('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const { data: payments, isLoading } = usePayments(
    activeFilter === 'ALL' ? undefined : { status: activeFilter }
  )
  const createPayment = useCreatePayment()
  const markAsPaid = useMarkAsPaid()
  const markAsUnpaid = useMarkAsUnpaid()
  const deletePayment = useDeletePayment()

  const handleCreate = (data: CreatePaymentPayload) => {
    createPayment.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  const handleMarkPaid = (id: string) => {
    markAsPaid.mutate(id)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this payment?')) deletePayment.mutate(id)
  }

  const counts = {
    ALL: payments?.length ?? 0,
    PENDING: (payments as any[])?.filter(p => p.status === 'PENDING').length ?? 0,
    OVERDUE: (payments as any[])?.filter(p => p.status === 'OVERDUE').length ?? 0,
    PAID: (payments as any[])?.filter(p => p.status === 'PAID').length ?? 0,
  }

  return (
    <div className="p-8">
      {editing && <EditPaymentModal payment={editing} onClose={() => setEditing(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-500 text-sm mt-1">{payments?.length ?? 0} payments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + New Payment
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Payment</h3>
          <CreatePaymentForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isLoading={createPayment.isPending}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeFilter === f
                ? f === 'OVERDUE'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {activeFilter === 'ALL' && f !== 'ALL' ? '' : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : !payments?.length ? (
        <div className="text-center py-16 text-gray-400">No payments found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tenant</th>
                <th className="px-4 py-3 text-left">Apartment</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Paid Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(payments as any[]).map(payment => (
                <tr
                  key={payment.id}
                  className={payment.status === 'OVERDUE' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {payment.tenant.firstName} {payment.tenant.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    #{payment.lease.apartment.number}
                    <span className="text-gray-400 ml-1 text-xs">— {payment.lease.apartment.complex?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {TYPE_LABELS[payment.type] ?? payment.type}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[payment.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                        <button
                          onClick={() => handleMarkPaid(payment.id)}
                          disabled={markAsPaid.isPending}
                          className="text-xs text-green-600 hover:underline disabled:opacity-50"
                        >
                          Mark Paid
                        </button>
                      )}
                      {payment.status === 'PAID' && (
                        <button
                          onClick={() => markAsUnpaid.mutate(payment.id)}
                          disabled={markAsUnpaid.isPending}
                          className="text-xs text-yellow-600 hover:underline disabled:opacity-50"
                        >
                          Mark Unpaid
                        </button>
                      )}
                      <button
                        onClick={() => setEditing(payment)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        disabled={deletePayment.isPending}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
