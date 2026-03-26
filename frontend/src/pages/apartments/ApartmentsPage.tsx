import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApartments, useCreateApartment, useUpdateApartment, useDeleteApartment } from '@/hooks/useApartments'
import { useComplexes } from '@/hooks/useComplexes'
import { useTenants } from '@/hooks/useTenants'
import { useCreateLease, useTerminateLease, useTransferLease } from '@/hooks/useLeases'
import type { Apartment } from '@/types'
import type { CreateApartmentPayload } from '@/api/apartments.api'
import type { CreateLeasePayload, TransferLeasePayload } from '@/api/leases.api'

const STATUS_COLORS: Record<Apartment['status'], string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  OCCUPIED: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
}

function ApartmentForm({ defaultValues, onSubmit, onCancel, isLoading }: {
  defaultValues?: Partial<CreateApartmentPayload>
  onSubmit: (data: CreateApartmentPayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: complexes } = useComplexes()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateApartmentPayload>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number *</label>
          <input {...register('number', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.number && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <input type="number" {...register('floor', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area (m²)</label>
          <input type="number" min={0} step="0.01" {...register('area', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
          <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complex *</label>
          <select {...register('complexId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Select complex...</option>
            {complexes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.complexId && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
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

function AssignTenantModal({ apartment, onClose }: { apartment: any; onClose: () => void }) {
  const { data: tenants } = useTenants()
  const createLease = useCreateLease()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateLeasePayload>({
    defaultValues: { apartmentId: apartment.id, monthlyRent: apartment.monthlyRent },
  })

  const onSubmit = (data: CreateLeasePayload) => {
    createLease.mutate(data, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-1">Assign Tenant</h3>
        <p className="text-sm text-gray-500 mb-4">Apartment #{apartment.number} — {apartment.complex?.name}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('apartmentId')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant *</label>
            <select {...register('tenantId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select tenant...</option>
              {tenants?.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} — {t.email}</option>)}
            </select>
            {errors.tenantId && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" {...register('startDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" {...register('endDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
              <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit *</label>
              <input type="number" min={0} step="0.01" {...register('depositAmount', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          {createLease.error && (
            <p className="text-sm text-red-600">{(createLease.error as any)?.response?.data?.message || 'Error assigning tenant'}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createLease.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {createLease.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MoveTenantModal({ apartment, allApartments, onClose }: {
  apartment: any
  allApartments: any[]
  onClose: () => void
}) {
  const transferLease = useTransferLease()
  const activeLease = apartment.leases?.[0]
  const tenant = activeLease?.tenant

  const available = allApartments.filter(
    a => a.status === 'AVAILABLE' && a.id !== apartment.id
  )

  const { register, handleSubmit, formState: { errors } } = useForm<TransferLeasePayload>({
    defaultValues: { monthlyRent: apartment.monthlyRent },
  })

  const onSubmit = (data: TransferLeasePayload) => {
    transferLease.mutate({ id: activeLease.id, data }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-1">Move Tenant</h3>
        <p className="text-sm text-gray-500 mb-4">
          Moving <span className="font-medium text-gray-700">{tenant?.firstName} {tenant?.lastName}</span> from #{apartment.number}
        </p>

        {available.length === 0 ? (
          <div className="text-center py-6 text-gray-400">No available apartments to move to.</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move to *</label>
              <select {...register('newApartmentId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select apartment...</option>
                {available.map(a => (
                  <option key={a.id} value={a.id}>
                    #{a.number} — Floor {a.floor} — {a.complex?.name} (${a.monthlyRent.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
              {errors.newApartmentId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="date" {...register('startDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input type="date" {...register('endDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
                <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit *</label>
                <input type="number" min={0} step="0.01" {...register('depositAmount', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            {transferLease.error && (
              <p className="text-sm text-red-600">{(transferLease.error as any)?.response?.data?.message || 'Error moving tenant'}</p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={transferLease.isPending} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {transferLease.isPending ? 'Moving...' : 'Move Tenant'}
              </button>
            </div>
          </form>
        )}

        {available.length === 0 && (
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ApartmentsPage() {
  const { data: apartments, isLoading } = useApartments()
  const createApartment = useCreateApartment()
  const updateApartment = useUpdateApartment()
  const deleteApartment = useDeleteApartment()
  const terminateLease = useTerminateLease()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Apartment | null>(null)
  const [assigning, setAssigning] = useState<any | null>(null)
  const [moving, setMoving] = useState<any | null>(null)
  const [filterComplex, setFilterComplex] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const complexOptions: { id: string; name: string }[] = (apartments as any[] ?? []).reduce(
    (acc: any[], a: any) => {
      if (a.complex && !acc.find((c: any) => c.id === a.complex.id)) acc.push(a.complex)
      return acc
    }, []
  )

  const filtered = (apartments as any[] ?? [])
    .filter((a: any) => !filterComplex || a.complexId === filterComplex)
    .filter((a: any) => !filterStatus || a.status === filterStatus)

  const handleCreate = (data: CreateApartmentPayload) => {
    createApartment.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  const handleUpdate = (data: CreateApartmentPayload) => {
    if (!editing) return
    updateApartment.mutate({ id: editing.id, data }, { onSuccess: () => setEditing(null) })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this apartment?')) deleteApartment.mutate(id)
  }

  const handleTerminate = (apt: any) => {
    const lease = apt.leases?.[0]
    if (!lease) return
    if (confirm('Remove tenant and terminate lease?')) terminateLease.mutate(lease.id)
  }

  return (
    <div className="p-8">
      {assigning && <AssignTenantModal apartment={assigning} onClose={() => setAssigning(null)} />}
      {moving && <MoveTenantModal apartment={moving} allApartments={apartments ?? []} onClose={() => setMoving(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apartments</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {apartments?.length ?? 0} units</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + Add Apartment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterComplex}
          onChange={(e: { target: { value: string } }) => setFilterComplex(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All Complexes</option>
          {complexOptions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          {(['', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Apartment' : 'New Apartment'}</h3>
          <ApartmentForm
            defaultValues={editing ? {
              number: editing.number,
              floor: editing.floor,
              area: editing.area,
              monthlyRent: Number(editing.monthlyRent),
              status: editing.status,
              complexId: editing.complexId,
            } : undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowCreate(false); setEditing(null) }}
            isLoading={createApartment.isPending || updateApartment.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : apartments?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No apartments yet. Add your first one!</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No apartments match the selected filters.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-left">Complex</th>
                <th className="px-4 py-3 text-left">Area</th>
                <th className="px-4 py-3 text-left">Rent</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tenant</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((apt: any) => {
                const activeLease = apt.leases?.[0]
                const tenant = activeLease?.tenant
                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{apt.number} — Floor {apt.floor}</td>
                    <td className="px-4 py-3 text-gray-500">{apt.complex?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{apt.area ? `${apt.area} m²` : '—'}</td>
                    <td className="px-4 py-3 font-medium">${apt.monthlyRent.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status as Apartment['status']]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tenant
                        ? <span className="font-medium text-gray-800">{tenant.firstName} {tenant.lastName}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {!tenant ? (
                          <button onClick={() => setAssigning(apt)} className="text-xs text-green-600 hover:underline">Assign</button>
                        ) : (
                          <>
                            <button onClick={() => setMoving(apt)} className="text-xs text-purple-600 hover:underline">Move</button>
                            <button onClick={() => handleTerminate(apt)} className="text-xs text-orange-500 hover:underline">Remove</button>
                          </>
                        )}
                        <button onClick={() => setEditing(apt)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(apt.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
