import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance'
import { useApartments } from '@/hooks/useApartments'
import type { MaintenanceRequest } from '@/types'
import type { CreateMaintenancePayload, UpdateMaintenancePayload } from '@/api/maintenance.api'

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
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<CreateMaintenancePayload>
  onSubmit: (data: CreateMaintenancePayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { data: apartments } = useApartments()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateMaintenancePayload>({ defaultValues })
  const repairCost = watch('repairCost')
  const tenantCharge = watch('tenantChargeAmount')

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select {...register('priority')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repair Cost ($)</label>
          <input type="number" step="0.01" min="0" {...register('repairCost', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Charge ($)</label>
          <input type="number" step="0.01" min="0" {...register('tenantChargeAmount', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
          {repairCost > 0 && tenantCharge > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Tenant covers {((tenantCharge / repairCost) * 100).toFixed(0)}% of the repair cost
            </p>
          )}
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

function DetailPanel({ request, onClose, onStatusChange }: {
  request: any
  onClose: () => void
  onStatusChange: (status: string) => void
}) {
  const updateMaintenance = useUpdateMaintenance()

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

          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Repair Cost</p>
              <p className="text-lg font-bold text-gray-900">
                {request.repairCost != null ? `$${Number(request.repairCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tenant Charge</p>
              <p className="text-lg font-bold text-indigo-600">
                {request.tenantChargeAmount != null ? `$${Number(request.tenantChargeAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </p>
              {request.repairCost > 0 && request.tenantChargeAmount > 0 && (
                <p className="text-xs text-gray-400">
                  {((Number(request.tenantChargeAmount) / Number(request.repairCost)) * 100).toFixed(0)}% of total
                </p>
              )}
            </div>
          </div>

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

          {request.status !== 'CLOSED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).filter(s => s !== request.status).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      updateMaintenance.mutate({ id: request.id, data: { status: s } }, { onSuccess: onClose })
                    }}
                    disabled={updateMaintenance.isPending}
                    className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MaintenancePage() {
  const [showCreate, setShowCreate] = useState(false)
  const [viewing, setViewing] = useState<any | null>(null)
  const [filterApt, setFilterApt] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: requests, isLoading } = useMaintenance()
  const { data: apartments } = useApartments()
  const createMaintenance = useCreateMaintenance()
  const deleteMaintenance = useDeleteMaintenance()

  const filtered = (requests as any[] ?? [])
    .filter((r: any) => !filterApt || r.apartmentId === filterApt)
    .filter((r: any) => !filterStatus || r.status === filterStatus)

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
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterApt}
          onChange={e => setFilterApt(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All apartments</option>
          {(apartments as any[])?.map((apt: any) => (
            <option key={apt.id} value={apt.id}>
              {apt.complex?.name} — Unit {apt.number}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
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
              onClick={() => setViewing(req)}
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
                  {req.repairCost != null && (
                    <p className="text-sm font-semibold text-gray-900">${Number(req.repairCost).toLocaleString()}</p>
                  )}
                  {req.tenantChargeAmount != null && (
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
          onClose={() => setViewing(null)}
          onStatusChange={() => setViewing(null)}
        />
      )}
    </div>
  )
}
