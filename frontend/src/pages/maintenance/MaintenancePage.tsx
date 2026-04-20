import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance'
import { useMarkAsPaid } from '@/hooks/usePayments'
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
  const { t } = useTranslation()
  const { data: apartments } = useApartments()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateMaintenancePayload>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('maintenance.apartmentLabel')}</label>
          <select {...register('apartmentId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">{t('maintenance.selectApartment')}</option>
            {(apartments as any[])?.map((apt: any) => (
              <option key={apt.id} value={apt.id}>
                {apt.complex?.name} — {t('common.unit')} {apt.number}
              </option>
            ))}
          </select>
          {errors.apartmentId && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('maintenance.titleLabel')}</label>
          <input {...register('title', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={t('maintenance.titlePlaceholder')} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('maintenance.descriptionLabel')}</label>
          <textarea {...register('description', { required: true })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={t('maintenance.descriptionPlaceholder')} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('maintenance.priorityLabel')}</label>
          <select {...register('priority')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="LOW">{t('maintenance.priorityLow')}</option>
            <option value="MEDIUM">{t('maintenance.priorityMedium')}</option>
            <option value="HIGH">{t('maintenance.priorityHigh')}</option>
            <option value="URGENT">{t('maintenance.priorityUrgent')}</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
          <textarea {...register('notes')} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={t('maintenance.notesPlaceholder')} />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function DetailPanel({ request, onClose }: { request: any; onClose: () => void }) {
  const { t } = useTranslation()
  const updateMaintenance = useUpdateMaintenance()
  const markAsPaid = useMarkAsPaid()

  const [resolvingForm, setResolvingForm] = useState(false)
  const [repairCost, setRepairCost] = useState('')
  const [tenantCharge, setTenantCharge] = useState('')

  const [editingCharge, setEditingCharge] = useState(false)
  const [chargeValue, setChargeValue] = useState('')

  const isResolved = request.status === 'RESOLVED' || request.status === 'CLOSED'
  const linkedPayment = request.payments?.find((p: any) => p.status !== 'CANCELLED')

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

  const statusLabels: Record<string, string> = {
    OPEN: t('maintenance.statusOpen'),
    IN_PROGRESS: t('maintenance.statusInProgress'),
    RESOLVED: t('maintenance.statusResolved'),
    CLOSED: t('maintenance.statusClosed'),
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
              {statusLabels[request.status] ?? request.status.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[request.priority as MaintenanceRequest['priority']]}`}>
              {({ LOW: t('maintenance.priorityLow'), MEDIUM: t('maintenance.priorityMedium'), HIGH: t('maintenance.priorityHigh'), URGENT: t('maintenance.priorityUrgent') } as Record<string, string>)[request.priority] ?? request.priority}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.apartmentSection')}</p>
            <p className="text-sm text-gray-900">{request.apartment?.complex?.name} — {t('common.unit')} {request.apartment?.number}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.descriptionSection')}</p>
            <p className="text-sm text-gray-700">{request.description}</p>
          </div>

          {request.tenant && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.tenantSection')}</p>
              <p className="text-sm text-gray-900">{request.tenant.firstName} {request.tenant.lastName}</p>
            </div>
          )}

          {isResolved && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.repairCost')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {request.repairCost != null ? `$${Number(request.repairCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('maintenance.tenantCharge')}</p>
                    {!editingCharge && (
                      <button onClick={() => { setEditingCharge(true); setChargeValue(String(Number(request.tenantChargeAmount ?? 0))) }} className="text-xs text-indigo-600 hover:underline">{t('common.edit')}</button>
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
                        {updateMaintenance.isPending ? '...' : t('common.save')}
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
                          {t('maintenance.percentOfTotal', { percent: ((Number(request.tenantChargeAmount) / Number(request.repairCost)) * 100).toFixed(0) })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {linkedPayment && (
                <div className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      linkedPayment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      linkedPayment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {({ PENDING: t('payments.statusPending'), PAID: t('payments.statusPaid'), OVERDUE: t('payments.statusOverdue') } as Record<string, string>)[linkedPayment.status] ?? linkedPayment.status}
                    </span>
                    <span className="text-sm text-gray-600">${Number(linkedPayment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex gap-2">
                    {linkedPayment.status !== 'PAID' && (
                      <button
                        onClick={() => markAsPaid.mutate({ id: linkedPayment.id })}
                        disabled={markAsPaid.isPending}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {markAsPaid.isPending ? '...' : t('payments.markPaid')}
                      </button>
                    )}
                    {linkedPayment.status !== 'PAID' && (
                      <button
                        onClick={() => updateMaintenance.mutate({ id: request.id, data: { tenantChargeAmount: 0 } })}
                        disabled={updateMaintenance.isPending}
                        className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {t('maintenance.cancelCharge')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {request.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.notesSection')}</p>
              <p className="text-sm text-gray-600">{request.notes}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.opened')}</p>
            <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {request.resolvedAt && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('maintenance.resolved')}</p>
              <p className="text-sm text-gray-600">{new Date(request.resolvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          )}

          {request.status === 'CLOSED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('maintenance.updateStatus')}</p>
              <button
                onClick={() => updateMaintenance.mutate({ id: request.id, data: { status: 'OPEN' } })}
                disabled={updateMaintenance.isPending}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {t('maintenance.reopen')}
              </button>
            </div>
          )}
          {request.status !== 'CLOSED' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('maintenance.updateStatus')}</p>

              {resolvingForm ? (
                <div className="bg-green-50 rounded-lg p-3 space-y-3">
                  <p className="text-sm font-medium text-gray-700">{t('maintenance.enterRepairCosts')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('maintenance.repairCostLabel')}</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={repairCost}
                        onChange={e => setRepairCost(e.target.value)}
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('maintenance.tenantChargeLabel')}</label>
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
                      {t('maintenance.tenantCovers', { percent: ((Number(tenantCharge) / Number(repairCost)) * 100).toFixed(0) })}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolve}
                      disabled={updateMaintenance.isPending}
                      className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateMaintenance.isPending ? t('common.saving') : t('maintenance.confirmResolved')}
                    </button>
                    <button onClick={() => setResolvingForm(false)} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
                      {t('common.cancel')}
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
                      {statusLabels[s]}
                    </button>
                  ))}
                  {request.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setResolvingForm(true)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {t('maintenance.statusResolved').toUpperCase()}
                    </button>
                  )}
                  <button
                    onClick={() => updateMaintenance.mutate({ id: request.id, data: { status: 'CLOSED' } })}
                    disabled={updateMaintenance.isPending}
                    className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('maintenance.statusClosed').toUpperCase()}
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
  const { t } = useTranslation()
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

  const viewing = viewingId ? (requests as any[] ?? []).find((r: any) => r.id === viewingId) ?? null : null

  const statusLabels: Record<string, string> = {
    OPEN: t('maintenance.statusOpen'),
    IN_PROGRESS: t('maintenance.statusInProgress'),
    RESOLVED: t('maintenance.statusResolved'),
    CLOSED: t('maintenance.statusClosed'),
  }

  const handleCreate = (data: CreateMaintenancePayload) => {
    createMaintenance.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('maintenance.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('maintenance.subtitle', { count: filtered.length })}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {t('maintenance.newRequest')}
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={filterApt} onChange={e => setMaintenanceFilter({ apartmentId: e.target.value })} className="border rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">{t('maintenance.allApartments')}</option>
          {(apartments as any[])?.map((apt: any) => (
            <option key={apt.id} value={apt.id}>{apt.complex?.name} — {t('common.unit')} {apt.number}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setMaintenanceFilter({ status: e.target.value })} className="border rounded-lg px-3 py-2 text-sm text-gray-700">
          <option value="">{t('maintenance.allStatuses')}</option>
          <option value="OPEN">{t('maintenance.statusOpen')}</option>
          <option value="IN_PROGRESS">{t('maintenance.statusInProgress')}</option>
          <option value="RESOLVED">{t('maintenance.statusResolved')}</option>
          <option value="CLOSED">{t('maintenance.statusClosed')}</option>
        </select>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('maintenance.newRequestTitle')}</h3>
          <MaintenanceForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isLoading={createMaintenance.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('maintenance.noRequests')}</div>
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
                      {statusLabels[req.status] ?? req.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[req.priority as MaintenanceRequest['priority']]}`}>
                      {({ LOW: t('maintenance.priorityLow'), MEDIUM: t('maintenance.priorityMedium'), HIGH: t('maintenance.priorityHigh'), URGENT: t('maintenance.priorityUrgent') } as Record<string, string>)[req.priority] ?? req.priority}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-500 truncate">{req.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {req.apartment?.complex?.name} — {t('common.unit')} {req.apartment?.number}
                    {req.tenant && ` · ${req.tenant.firstName} ${req.tenant.lastName}`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {(req.status === 'RESOLVED' || req.status === 'CLOSED') && req.repairCost != null && (
                    <p className="text-sm font-semibold text-gray-900">${Number(req.repairCost).toLocaleString()}</p>
                  )}
                  {(req.status === 'RESOLVED' || req.status === 'CLOSED') && req.tenantChargeAmount != null && (
                    <p className="text-xs text-indigo-600">{t('maintenance.tenantChargeAmount', { amount: Number(req.tenantChargeAmount).toLocaleString() })}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm(t('maintenance.deleteConfirm'))) deleteMaintenance.mutate(req.id) }}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    {t('common.delete')}
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
