import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from '@/hooks/useTenants'
import { usePayments, useMarkAsPaid, useMarkAsUnpaid } from '@/hooks/usePayments'
import { useAddLeaseItem, useRemoveLeaseItem } from '@/hooks/useLeases'
import { tenantsApi } from '@/api/tenants.api'
import type { Tenant } from '@/types'
import type { CreateTenantPayload } from '@/api/tenants.api'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

function TenantForm({ defaultValues, onSubmit, onCancel, isLoading }: {
  defaultValues?: Partial<CreateTenantPayload>
  onSubmit: (data: CreateTenantPayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateTenantPayload>({ defaultValues })
  const hasGuarantor = watch('hasGuarantor')
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input {...register('firstName', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input {...register('lastName', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" {...register('email', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.email && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input {...register('phone')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DNI / ID</label>
          <input {...register('dni')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
          <input type="date" {...register('birthDate')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={3} placeholder="Any relevant notes about this tenant..." className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Guarantor */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" {...register('hasGuarantor')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">This tenant has a guarantor</span>
        </label>

        {hasGuarantor && (
          <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 border rounded-lg p-4">
            <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guarantor Information</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input {...register('guarantorFirstName')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input {...register('guarantorLastName')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI / ID</label>
              <input {...register('guarantorDni')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('guarantorPhone')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('guarantorEmail')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function TenantDetailPanel({ tenantId, onClose, onEdit }: {
  tenantId: string
  onClose: () => void
  onEdit: (tenant: Tenant) => void
}) {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsApi.getOne(tenantId),
  })
  const { data: payments } = usePayments({ tenantId })
  const markAsPaid = useMarkAsPaid()
  const markAsUnpaid = useMarkAsUnpaid()
  const addItem = useAddLeaseItem(tenantId)
  const removeItem = useRemoveLeaseItem(tenantId)
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')

  const activeLease = (tenant as any)?.leases?.find((l: any) => l.status === 'ACTIVE')
  const leaseHistory = (tenant as any)?.leases?.filter((l: any) => l.status !== 'ACTIVE') ?? []

  const LEASE_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    TERMINATED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {tenant ? `${tenant.firstName} ${tenant.lastName}` : '...'}
            </h3>
            <p className="text-sm text-gray-500">{tenant?.email}</p>
          </div>
          <div className="flex gap-2">
            {tenant && (
              <button
                onClick={() => onEdit(tenant)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-gray-400">Loading...</div>
        ) : tenant ? (
          <div className="p-6 space-y-6">
            {/* Personal Info */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{tenant.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">DNI / ID</p>
                  <p className="text-sm font-medium text-gray-800">{tenant.dni || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Birth Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {tenant.birthDate ? new Date(tenant.birthDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h4>
              {tenant.notes ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {tenant.notes}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes. Click Edit to add one.</p>
              )}
            </section>

            {/* Guarantor */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Guarantor</h4>
              {tenant.hasGuarantor ? (
                <div className="bg-gray-50 border rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">
                      {[tenant.guarantorFirstName, tenant.guarantorLastName].filter(Boolean).join(' ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">DNI / ID</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorDni || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorEmail || '—'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No guarantor registered.</p>
              )}
            </section>

            {/* Current Apartment */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Apartment</h4>
              {activeLease ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        #{activeLease.apartment.number} — Floor {activeLease.apartment.floor}
                      </p>
                      <p className="text-sm text-gray-500">{activeLease.apartment.complex?.name}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-400">Monthly Rent</p>
                      <p className="text-sm font-semibold text-gray-800">${Number(activeLease.monthlyRent).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(activeLease.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">End Date</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(activeLease.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {activeLease.notes && (
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-gray-400">Lease Notes</p>
                      <p className="text-sm text-gray-700">{activeLease.notes}</p>
                    </div>
                  )}

                  {/* Lease Items */}
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Breakdown</p>
                    {activeLease.items && activeLease.items.length > 0 ? (
                      <div className="space-y-1 mb-3">
                        {activeLease.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">${Number(item.amount).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem.mutate({ leaseId: activeLease.id, itemId: item.id })}
                                className="text-xs text-red-400 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-sm font-semibold border-t border-blue-200 pt-1 mt-1">
                          <span className="text-gray-700">Total</span>
                          <span className="text-gray-900">
                            ${activeLease.items.reduce((sum: number, i: any) => sum + Number(i.amount), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-2">No items yet.</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={newItemName}
                        onChange={(e: { target: { value: string } }) => setNewItemName(e.target.value)}
                        className="flex-1 border rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newItemAmount}
                        onChange={(e: { target: { value: string } }) => setNewItemAmount(e.target.value)}
                        className="w-24 border rounded-lg px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => {
                          if (!newItemName.trim() || !newItemAmount) return
                          addItem.mutate(
                            { leaseId: activeLease.id, data: { name: newItemName.trim(), amount: Number(newItemAmount) } },
                            { onSuccess: () => { setNewItemName(''); setNewItemAmount('') } }
                          )
                        }}
                        disabled={addItem.isPending}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No active lease — tenant is not currently assigned to an apartment.</p>
              )}
            </section>

            {/* Lease History */}
            {leaseHistory.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Lease History</h4>
                <div className="space-y-2">
                  {leaseHistory.map((lease: any) => (
                    <div key={lease.id} className="flex items-center justify-between border rounded-lg px-4 py-2 text-sm">
                      <div>
                        <span className="font-medium">#{lease.apartment.number}</span>
                        <span className="text-gray-400 ml-2">{lease.apartment.complex?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-xs">
                          {new Date(lease.startDate).toLocaleDateString()} – {new Date(lease.endDate).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEASE_STATUS_COLORS[lease.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {lease.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Payment History */}
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment History</h4>
              {payments && payments.length > 0 ? (
                <div className="space-y-2">
                  {(payments as any[]).map(p => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between border rounded-lg px-4 py-2 text-sm ${p.status === 'OVERDUE' ? 'bg-red-50 border-red-200' : ''}`}
                    >
                      <div>
                        <span className="font-medium">${Number(p.amount).toLocaleString()}</span>
                        <span className="text-gray-400 ml-2 text-xs">{p.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs">Due {new Date(p.dueDate).toLocaleDateString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {p.status}
                        </span>
                        {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                          <button
                            onClick={() => markAsPaid.mutate(p.id)}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.status === 'PAID' && (
                          <button
                            onClick={() => markAsUnpaid.mutate(p.id)}
                            className="text-xs text-yellow-600 hover:underline"
                          >
                            Mark Unpaid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No payments recorded.</p>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function TenantsPage() {
  const { data: tenants, isLoading } = useTenants()
  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()
  const deleteTenant = useDeleteTenant()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  const [filterComplex, setFilterComplex] = useState('')

  const complexOptions = (tenants as any[] ?? []).reduce((acc: any[], t: any) => {
    const complex = t.leases?.[0]?.apartment?.complex
    if (complex && !acc.find((c: any) => c.id === complex.id)) acc.push(complex)
    return acc
  }, [])

  const filtered = (tenants as any[] ?? []).filter((t: any) => {
    if (!filterComplex) return true
    return t.leases?.[0]?.apartment?.complex?.id === filterComplex
  })

  const handleCreate = (data: CreateTenantPayload) => {
    createTenant.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  const handleUpdate = (data: CreateTenantPayload) => {
    if (!editing) return
    updateTenant.mutate({ id: editing.id, data }, { onSuccess: () => setEditing(null) })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this tenant?')) deleteTenant.mutate(id)
  }

  const handleEditFromDetail = (tenant: Tenant) => {
    setViewing(null)
    setEditing(tenant)
  }

  return (
    <div className="p-8">
      {viewing && (
        <TenantDetailPanel
          tenantId={viewing}
          onClose={() => setViewing(null)}
          onEdit={handleEditFromDetail}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {tenants?.length ?? 0} tenants</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterComplex}
          onChange={(e: { target: { value: string } }) => setFilterComplex(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All Complexes</option>
          {complexOptions.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Tenant' : 'New Tenant'}</h3>
          <TenantForm
            defaultValues={editing ? {
              firstName: editing.firstName,
              lastName: editing.lastName,
              email: editing.email,
              phone: editing.phone,
              dni: editing.dni,
              birthDate: editing.birthDate?.split('T')[0],
              notes: editing.notes,
              hasGuarantor: editing.hasGuarantor,
              guarantorFirstName: editing.guarantorFirstName,
              guarantorLastName: editing.guarantorLastName,
              guarantorDni: editing.guarantorDni,
              guarantorPhone: editing.guarantorPhone,
              guarantorEmail: editing.guarantorEmail,
            } : undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowCreate(false); setEditing(null) }}
            isLoading={createTenant.isPending || updateTenant.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : tenants?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No tenants yet. Add your first one!</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No tenants match the selected filter.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">DNI</th>
                <th className="px-4 py-3 text-left">Apartment</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tenant: any) => {
                const activeLease = tenant.leases?.[0]
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{tenant.firstName} {tenant.lastName}</div>
                      {tenant.notes && <div className="text-xs text-yellow-600 mt-0.5 truncate max-w-[160px]">📝 {tenant.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{tenant.email}</td>
                    <td className="px-4 py-3 text-gray-500">{tenant.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{tenant.dni ?? '—'}</td>
                    <td className="px-4 py-3">
                      {activeLease ? (
                        <span className="text-sm text-gray-700">
                          #{activeLease.apartment.number} — {activeLease.apartment.complex?.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setViewing(tenant.id)} className="text-xs text-indigo-600 hover:underline">View</button>
                        <button onClick={() => setEditing(tenant)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(tenant.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
