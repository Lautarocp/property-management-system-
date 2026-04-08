import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { usePayments, useCreatePayment, useMarkAsPaid, useMarkAsUnpaid, useUpdatePayment, useDeletePayment } from '@/hooks/usePayments'
import { useFiltersStore } from '@/store/filters.store'
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
  MAINTENANCE: 'Maintenance',
  OTHER: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  RENT: 'bg-blue-100 text-blue-700',
  DEPOSIT: 'bg-purple-100 text-purple-700',
  LATE_FEE: 'bg-orange-100 text-orange-700',
  MAINTENANCE: 'bg-red-100 text-red-700',
  OTHER: 'bg-gray-100 text-gray-600',
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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{ leaseId: string; dueDate: string; type: string; notes: string }>()

  const [items, setItems] = useState<{ key: number; name: string; amount: string }[]>([])
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [keyCounter, setKeyCounter] = useState(0)

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  const handleLeaseChange = (e: { target: { value: string } }) => {
    const leaseId = e.target.value
    setValue('leaseId', leaseId)
    const lease = activeLeases.find((l: any) => l.id === leaseId)
    if (lease) {
      let k = keyCounter
      const baseItem = { key: k++, name: 'Base Rent', amount: String(Number(lease.monthlyRent)) }
      const extraItems = (lease.items ?? []).map((li: any) => ({ key: k++, name: li.name, amount: String(Number(li.amount)) }))
      setItems([baseItem, ...extraItems])
      setKeyCounter(k)
    } else {
      setItems([])
    }
  }

  const addItem = () => {
    if (!newName.trim() || !newAmount) return
    setItems(prev => [...prev, { key: keyCounter, name: newName.trim(), amount: newAmount }])
    setKeyCounter(k => k + 1)
    setNewName('')
    setNewAmount('')
  }

  const removeItem = (key: number) => setItems(prev => prev.filter(i => i.key !== key))

  const updateItem = (key: number, field: 'name' | 'amount', value: string) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i))
  }

  const handleSubmitForm = (formData: any) => {
    const payload: CreatePaymentPayload = {
      leaseId: formData.leaseId,
      dueDate: formData.dueDate,
      type: formData.type || 'RENT',
      notes: formData.notes || undefined,
      items: items.map(i => ({ name: i.name, amount: Number(i.amount) })),
    }
    if (!payload.items?.length) {
      payload.amount = 0
      delete payload.items
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
      {/* Lease selector */}
      <div>
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

      {/* Payment items */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Breakdown</p>
        </div>

        <div className="divide-y divide-gray-100">
          {items.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400 italic">No items yet. Add items below.</p>
          )}
          {items.map(item => (
            <div key={item.key} className="flex items-center gap-3 px-4 py-2">
              <input
                type="text"
                value={item.name}
                onChange={e => updateItem(item.key, 'name', e.target.value)}
                placeholder="Item name"
                className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={e => updateItem(item.key, 'amount', e.target.value)}
                  placeholder="0"
                  className="w-24 border-0 bg-transparent text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add item row */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
            placeholder="Item name (e.g. Parking)"
            className="flex-1 border rounded px-2 py-1 text-xs"
          />
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">$</span>
            <input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
              placeholder="Amount (neg. to subtract)"
              className="w-36 border rounded px-2 py-1 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white font-semibold">
          <span className="text-sm text-gray-700">Total</span>
          <span className={`text-base ${total < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Other fields */}
      <div className="grid grid-cols-2 gap-4">
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
        <div className="col-span-2">
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
  const activeFilter = useFiltersStore(s => s.payments.status)
  const setPaymentsFilter = useFiltersStore(s => s.setPaymentsFilter)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

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

  const handleDelete = (id: string) => {
    if (confirm('Delete this payment?')) deletePayment.mutate(id)
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
            onClick={() => setPaymentsFilter({ status: f })}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeFilter === f
                ? f === 'OVERDUE' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
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
                <>
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
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[payment.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_LABELS[payment.type] ?? payment.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-gray-900">${Number(payment.amount).toLocaleString()}</span>
                        {payment.items?.length > 0 && (
                          <button
                            onClick={() => setExpanded(expanded === payment.id ? null : payment.id)}
                            className="text-xs text-blue-500 hover:underline mt-0.5"
                          >
                            {expanded === payment.id ? 'hide' : `${payment.items.length} items`}
                          </button>
                        )}
                      </div>
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
                            onClick={() => markAsPaid.mutate(payment.id)}
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
                        <button onClick={() => setEditing(payment)} className="text-xs text-blue-600 hover:underline">
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
                  {expanded === payment.id && payment.items?.length > 0 && (
                    <tr key={`${payment.id}-items`} className={payment.status === 'OVERDUE' ? 'bg-red-50' : 'bg-gray-50'}>
                      <td colSpan={8} className="px-8 py-3">
                        <div className="space-y-1 max-w-xs">
                          {payment.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-xs text-gray-600">
                              <span>{item.name}</span>
                              <span className={Number(item.amount) < 0 ? 'text-red-500' : 'text-gray-800'}>
                                {Number(item.amount) < 0 ? '-' : '+'}${Math.abs(Number(item.amount)).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-semibold border-t pt-1 mt-1 text-gray-800">
                            <span>Total</span>
                            <span>${Number(payment.amount).toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
