import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance'
import { useApartments } from '@/hooks/useApartments'
import { useFiltersStore } from '@/store/filters.store'
import type { MaintenanceRequest } from '@/types'
import type { CreateMaintenancePayload } from '@/api/maintenance.api'

const STATUS_COLORS: Record<MaintenanceRequest['status'], string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

const PRIORITY_COLORS: Record<MaintenanceRequest['priority'], string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-700',
}

function MaintenanceForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: CreateMaintenancePayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: apartments } = useApartments()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateMaintenancePayload>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Apartment *</label>
          <select {...register('apartmentId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Select apartment...</option>
            {(apartments as any[])?.map((apt: any) => (
              <option key={apt.id} value={apt.id}>
                {apt.complex?.name} — Unit {apt.number}
              </option>
            ))}
          </select>
          {errors.apartmentId && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input {...register('title', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Broken pipe in kitchen" />
          {errors.title && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea {...register('description', { required: true })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Describe the issue in detail..." />
          {errors.description && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select {...register('priority')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Additional notes..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

function DetailPanel({ request, onClose }: { request: any; onClose: () => void }) {
  const updateMaintenance = useUpdateMaintenance()

  // Resolve form state
  const [resolvingForm, setResolvingForm] = useState(false)
  const [repairCost, setRepairCost] = useState('')
  const [tenantCharge, setTenantCharge] = useState('')

  // Inline edit for costs after resolved
  const [editingCharge, setEditingCharge] = useState(false)
  const [chargeValue, setChargeValue] = useState('')

  const isResolved = request.status === 'RESOLVED' || request.status === 'CLOSED'

  const handleResolve = () => {
    const cost = Number(repairCost) || undefined
    const charge = Number(tenantCharge) || undefined
    updateMaintenance.mutate(
      { id: request.id, data: { status: 'RESOLVED', repairCost: cost, tenantChargeAmount: charge } },
      { onSuccess: () => setResolvingForm(false) }
    )
  }

  const saveCharge = () => {
    const amount = Number(chargeValue)
    if (isNaN(amount) || amount < 0) return
    updateMaintenance.mutate(
      { id: request.id, data: { tenantChargeAmount: amount } },
      { onSuccess: () => { setEditingCharge(false); setChargeValue('') } }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{request.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[request.status as MaintenanceRequest['status']]}`}>
              {request.status.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[request.priority as MaintenanceRequest['priority']]}`}>
              {request.priority}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Apartment</p>
            <p className="text-sm text-gray-900">{request.apartment?.complex?.name} — Unit {request.apartment?.number}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{request.description}</p>
          </div>

          {request.tenant && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tenant</p>
              <p className="text-sm text-gray-900">{request.tenant.firstName} {request.tenant.lastName}</p>
            </div>
          )}

          {/* Costs — only shown once resolved */}
          {isResolved && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Repair Cost</p>
                <p className="text-lg font-bold text-gray-900">
                  {request.repairCost != null ? `$${Number(request.repairCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant Charge</p>
                  {!editingCharge && (
                    <button onClick={() => { setEditingCharge(true); setChargeValue(String(Number(request.tenantChargeAmount ?? 0))) }} className="text-xs text-indigo-600 hover:underline">Edit</button>
                  )}
                </div>
                {editingCharge ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number" step="0.01" min="0"
                      value={chargeValue}
                      onChange={e => setChargeValue(e.target.value)}
                      className="flex-1 border rounded-lg px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button onClick={saveCharge} disabled={updateMaintenance.isPending} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                      {updateMaintenance.isPending ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingCharge(false)} className="px-2 py-1 text-xs text-gray-500 border rounded-lg hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-indigo-600">
                      {request.tenantChargeAmount != null ? `$${Number(request.tenantChargeAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </p>
                    {Number(request.repairCost) > 0 && Number(request.tenantChargeAmount) > 0 && (
                      <p className="text-xs text-gray-400">
                        {((Number(request.tenantChargeAmount) / Number(request.repairCost)) * 100).toFixed(0)}% of total
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {request.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-600">{request.notes}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Opened</p>
            <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {request.resolvedAt && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Resolved</p>
              <p className="text-sm text-gray-600">{new Date(request.resolvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          )}

          {/* Status actions */}
          {request.status === 'CLOSED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
              <button
                onClick={() => updateMaintenance.mutate({ id: request.id, data: { status: 'OPEN' } })}
                disabled={updateMaintenance.isPending}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Reopen
              </button>
            </div>
          )}
          {request.status !== 'CLOSED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>

              {/* Resolve form — enters costs before resolving */}
              {resolvingForm ? (
                <div className="bg-green-50 rounded-lg p-3 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Enter repair costs to resolve</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Repair Cost ($)</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={repairCost}
                        onChange={e => setRepairCost(e.target.value)}
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tenant Charge ($)</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={tenantCharge}
                        onChange={e => setTenantCharge(e.target.value)}
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {Number(repairCost) > 0 && Number(tenantCharge) > 0 && (
                    <p className="text-xs text-gray-500">
                      Tenant covers {((Number(tenantCharge) / Number(repairCost)) * 100).toFixed(0)}% of repair cost
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolve}
                      disabled={updateMaintenance.isPending}
                      className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateMaintenance.isPending ? 'Saving...' : 'Confirm Resolved'}
                    </button>
                    <button onClick={() => setResolvingForm(false)} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(['OPEN', 'IN_PROGRESS'] as const).filter(s => s !== request.status).map(s => (
                    <button
                      key={s}
                      onClick={() => updateMaintenance.mutate({ id: request.id, data: { status: s } })}
                      disabled={updateMaintenance.isPending}
                      className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                  {request.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setResolvingForm(true)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      RESOLVED
                    </button>
                  )}
                  <button
                    onClick={() => updateMaintenance.mutate({ id: request.id, data: { status: 'CLOSED' } })}
                    disabled={updateMaintenance.isPending}
                    className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    CLOSED
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MaintenancePage() {
  const [showCreate, setShowCreate] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const filterApt = useFiltersStore(s => s.maintenance.apartmentId)
  const filterStatus = useFiltersStore(s => s.maintenance.status)
  const setMaintenanceFilter = useFiltersStore(s => s.setMaintenanceFilter)

  const { data: requests, isLoading } = useMaintenance()
  const { data: apartments } = useApartments()
  const createMaintenance = useCreateMaintenance()
  const deleteMaintenance = useDeleteMaintenance()

  const filtered = (requests as any[] ?? [])
    .filter((r: any) => !filterApt || r.apartmentId === filterApt)
    .filter((r: any) => !filterStatus || r.status === filterStatus)

  // Always derived from live query data — stays in sync after mutations
  const viewing = viewingId ? (requests as any[] ?? []).find((r: any) => r.id === viewingId) ?? null : null

  const handleCreate = (data: CreateMaintenancePayload) => {
    createMaintenance.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} requests</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={filterApt} onChange={e => setMaintenanceFilter({ apartmentId: e.target.value })} className="border rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">All apartments</option>
          {(apartments as any[])?.map((apt: any) => (
            <option key={apt.id} value={apt.id}>{apt.complex?.name} — Unit {apt.number}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setMaintenanceFilter({ status: e.target.value })} className="border rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Maintenance Request</h3>
          <MaintenanceForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isLoading={createMaintenance.isPending}
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No maintenance requests found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: any) => (
            <div
              key={req.id}
              onClick={() => setViewingId(req.id)}
              className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status as MaintenanceRequest['status']]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[req.priority as MaintenanceRequest['priority']]}`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-500 truncate">{req.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {req.apartment?.complex?.name} — Unit {req.apartment?.number}
                    {req.tenant && ` · ${req.tenant.firstName} ${req.tenant.lastName}`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {(req.status === 'RESOLVED' || req.status === 'CLOSED') && req.repairCost != null && (
                    <p className="text-sm font-semibold text-gray-900">${Number(req.repairCost).toLocaleString()}</p>
                  )}
                  {(req.status === 'RESOLVED' || req.status === 'CLOSED') && req.tenantChargeAmount != null && (
                    <p className="text-xs text-indigo-600">Tenant: ${Number(req.tenantChargeAmount).toLocaleString()}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('Delete this request?')) deleteMaintenance.mutate(req.id) }}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <DetailPanel
          request={viewing}
          onClose={() => setViewingId(null)}
        />
      )}
    </div>
  )
}
