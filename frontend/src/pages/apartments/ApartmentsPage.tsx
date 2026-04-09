import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useApartments, useCreateApartment, useUpdateApartment, useDeleteApartment } from '@/hooks/useApartments'
import { useComplexes } from '@/hooks/useComplexes'
import { useTenants } from '@/hooks/useTenants'
import { useCreateLease, useTerminateLease, useTransferLease } from '@/hooks/useLeases'
import { useIncreaseRent } from '@/hooks/useApartments'
import { useMaintenance } from '@/hooks/useMaintenance'
import { useCreatePayment } from '@/hooks/usePayments'
import { leasesApi } from '@/api/leases.api'
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
  const { t } = useTranslation()
  const { data: complexes } = useComplexes()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateApartmentPayload>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.unitNumberLabel')}</label>
          <input {...register('number', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.number && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.floorLabel')}</label>
          <input type="number" {...register('floor', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.areaLabel')}</label>
          <input type="number" min={0} step="0.01" {...register('area', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.monthlyRentLabel')}</label>
          <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.statusLabel')}</label>
          <select {...register('status')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="AVAILABLE">{t('apartments.statusAvailable')}</option>
            <option value="OCCUPIED">{t('apartments.statusOccupied')}</option>
            <option value="MAINTENANCE">{t('apartments.statusMaintenance')}</option>
            <option value="INACTIVE">{t('apartments.statusInactive')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.complexLabel')}</label>
          <select {...register('complexId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">{t('apartments.selectComplex')}</option>
            {complexes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.complexId && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function AssignTenantModal({ apartment, onClose }: { apartment: any; onClose: () => void }) {
  const { t } = useTranslation()
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
        <h3 className="text-lg font-semibold mb-1">{t('apartments.assignTenantTitle')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('apartments.assignTenantSubtitle', { number: apartment.number, complex: apartment.complex?.name })}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('apartmentId')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.tenantLabel')}</label>
            <select {...register('tenantId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">{t('apartments.selectTenant')}</option>
              {tenants?.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} — {t.email}</option>)}
            </select>
            {errors.tenantId && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.startDate')}</label>
              <input type="date" {...register('startDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.endDate')}</label>
              <input type="date" {...register('endDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.monthlyRentField')}</label>
              <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.depositLabel')}</label>
              <input type="number" min={0} step="0.01" {...register('depositAmount', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
            <textarea {...register('notes')} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          {createLease.error && (
            <p className="text-sm text-red-600">{(createLease.error as any)?.response?.data?.message || t('apartments.errorAssigning')}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="submit" disabled={createLease.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {createLease.isPending ? t('apartments.assigning') : t('apartments.assignButton')}
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
  const { t } = useTranslation()
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
        <h3 className="text-lg font-semibold mb-1">{t('apartments.moveTenantTitle')}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('apartments.moveTenantSubtitle', { name: `${tenant?.firstName} ${tenant?.lastName}`, number: apartment.number })}
        </p>

        {available.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t('apartments.noAvailableApartments')}</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.moveTo')}</label>
              <select {...register('newApartmentId', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">{t('apartments.selectApartment')}</option>
                {available.map(a => (
                  <option key={a.id} value={a.id}>
                    #{a.number} — {t('common.floor')} {a.floor} — {a.complex?.name} (${a.monthlyRent.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
              {errors.newApartmentId && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.startDate')}</label>
                <input type="date" {...register('startDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.endDate')}</label>
                <input type="date" {...register('endDate', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.monthlyRentField')}</label>
                <input type="number" min={0} step="0.01" {...register('monthlyRent', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.depositLabel')}</label>
                <input type="number" min={0} step="0.01" {...register('depositAmount', { required: true, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            {transferLease.error && (
              <p className="text-sm text-red-600">{(transferLease.error as any)?.response?.data?.message || t('apartments.errorMoving')}</p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
              <button type="submit" disabled={transferLease.isPending} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {transferLease.isPending ? t('apartments.moving') : t('apartments.moveButton')}
              </button>
            </div>
          </form>
        )}

        {available.length === 0 && (
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.close')}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function NewPaymentModal({ apartment, onClose }: { apartment: any; onClose: () => void }) {
  const { t } = useTranslation()
  const activeLease = apartment.leases?.[0]
  const createPayment = useCreatePayment()

  const [items, setItems] = useState<{ key: number; name: string; amount: string }[]>(() => {
    let k = 0
    const base = { key: k++, name: t('common.baseRent'), amount: String(Number(activeLease?.monthlyRent ?? 0)) }
    const extras = (activeLease?.items ?? []).map((li: any) => ({ key: k++, name: li.name, amount: String(Number(li.amount)) }))
    return [base, ...extras]
  })
  const [keyCounter, setKeyCounter] = useState(items.length)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  const addItem = () => {
    if (!newName.trim() || !newAmount) return
    setItems(prev => [...prev, { key: keyCounter, name: newName.trim(), amount: newAmount }])
    setKeyCounter(k => k + 1)
    setNewName('')
    setNewAmount('')
  }

  const removeItem = (key: number) => setItems(prev => prev.filter(i => i.key !== key))

  const updateItem = (key: number, field: 'name' | 'amount', value: string) =>
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i))

  const handleSubmit = () => {
    if (!dueDate || !activeLease) return
    createPayment.mutate(
      {
        leaseId: activeLease.id,
        dueDate,
        notes: notes || undefined,
        items: items.map(i => ({ name: i.name, amount: Number(i.amount) })),
      },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-xl shadow-xl w-full sm:max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('apartments.newPaymentTitle')}</h3>
            <p className="text-sm text-gray-500">#{apartment.number} — {activeLease?.tenant?.firstName} {activeLease?.tenant?.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('common.paymentBreakdown')}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-3 px-4 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(item.key, 'name', e.target.value)}
                    className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={e => updateItem(item.key, 'amount', e.target.value)}
                      className="w-24 border-0 bg-transparent text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                    />
                  </div>
                  <button type="button" onClick={() => removeItem(item.key)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                placeholder={t('common.itemName')}
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
                  placeholder="Amount"
                  className="w-28 border rounded px-2 py-1 text-xs"
                />
              </div>
              <button type="button" onClick={addItem} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">{t('common.addItem')}</button>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t font-semibold">
              <span className="text-sm text-gray-700">{t('common.total')}</span>
              <span className={`text-base ${total < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.dueDate')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('common.notes')}</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('common.optional')}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
          <button
            onClick={handleSubmit}
            disabled={createPayment.isPending || !dueDate}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {createPayment.isPending ? t('apartments.creating') : t('apartments.createPayment')}
          </button>
        </div>
      </div>
    </div>
  )
}

const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

const MAINTENANCE_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

function MaintenanceHistoryModal({ apartment, onClose }: { apartment: any; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: maintenanceHistory } = useMaintenance(apartment.id)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-xl shadow-xl w-full sm:max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('apartments.maintenanceHistoryTitle')}</h3>
            <p className="text-sm text-gray-500">#{apartment.number} — {apartment.complex?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto p-5">
          {!maintenanceHistory || maintenanceHistory.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-6">{t('apartments.noMaintenanceRecords')}</p>
          ) : (
            <div className="space-y-3">
              {maintenanceHistory.map((req: any) => (
                <div key={req.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{req.title}</p>
                    <div className="flex gap-1.5 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAINTENANCE_STATUS_COLORS[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAINTENANCE_PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{req.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{t('apartments.opened', { date: new Date(req.createdAt).toLocaleDateString() })}</span>
                    {req.resolvedAt && <span>{t('apartments.resolvedDate', { date: new Date(req.resolvedAt).toLocaleDateString() })}</span>}
                  </div>
                  {(req.repairCost || req.tenantChargeAmount) && (
                    <div className="flex gap-4 text-xs pt-1 border-t">
                      {req.repairCost && (
                        <span className="text-gray-500">{t('apartments.repairCost', { amount: Number(req.repairCost).toLocaleString() })}</span>
                      )}
                      {req.tenantChargeAmount && (
                        <span className="text-gray-500">{t('apartments.tenantCharge', { amount: Number(req.tenantChargeAmount).toLocaleString() })}</span>
                      )}
                    </div>
                  )}
                  {req.notes && <p className="text-xs text-gray-400 italic">"{req.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ApartmentDetailPanel({ apartment, onClose }: { apartment: any; onClose: () => void }) {
  const { t } = useTranslation()
  const increaseRent = useIncreaseRent()
  const [showRentIncrease, setShowRentIncrease] = useState(false)
  const [rentPct, setRentPct] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showNewPayment, setShowNewPayment] = useState(false)

  const activeLease = apartment.leases?.[0]

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">#{apartment.number} — {t('common.floor')} {apartment.floor}</h3>
            <p className="text-sm text-gray-500">{apartment.complex?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(true)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border rounded-lg hover:bg-gray-50">{t('apartments.historyBtn')}</button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('apartments.detailsSection')}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">{t('apartments.baseRent')}</p>
                <p className="text-sm font-semibold text-gray-800">${Number(apartment.monthlyRent).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('apartments.areaLabel2')}</p>
                <p className="text-sm font-medium text-gray-800">{apartment.area ? `${apartment.area} m²` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('apartments.statusLabel2')}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[apartment.status as Apartment['status']]}`}>
                  {apartment.status}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('apartments.rentAdjustment')}</h4>
              <button
                onClick={() => { setShowRentIncrease(!showRentIncrease); setRentPct('') }}
                className="text-xs text-indigo-600 hover:underline"
              >
                {showRentIncrease ? t('apartments.adjustCancel') : t('apartments.adjustBtn')}
              </button>
            </div>
            {showRentIncrease && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder={t('apartments.rentAdjustPlaceholder')}
                  value={rentPct}
                  onChange={(e: { target: { value: string } }) => setRentPct(e.target.value)}
                  className="flex-1 border rounded-lg px-2 py-1 text-sm"
                />
                <button
                  onClick={() => {
                    const pct = Number(rentPct)
                    if (!pct) return
                    increaseRent.mutate(
                      { id: apartment.id, percentage: pct },
                      { onSuccess: () => { setShowRentIncrease(false); setRentPct('') } }
                    )
                  }}
                  disabled={increaseRent.isPending || !rentPct}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {increaseRent.isPending ? '...' : t('apartments.applyBtn')}
                </button>
              </div>
            )}
            {showRentIncrease && rentPct && (
              <p className="text-xs text-gray-500 mt-1">
                ${Number(apartment.monthlyRent).toLocaleString()} → ${(Number(apartment.monthlyRent) * (1 + Number(rentPct) / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            )}
          </section>

          {activeLease ? (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('apartments.activeLease')}</h4>
                <button onClick={() => setShowNewPayment(true)} className="px-3 py-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50">{t('apartments.newPaymentBtn')}</button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{activeLease.tenant?.firstName} {activeLease.tenant?.lastName}</p>
                    <p className="text-xs text-gray-500">{activeLease.tenant?.email}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">ACTIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-blue-200 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.monthlyRent')}</p>
                    <p className="font-semibold text-gray-800">${Number(activeLease.monthlyRent).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.startDate')}</p>
                    <p className="text-gray-800">{new Date(activeLease.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.endDate')}</p>
                    <p className="text-gray-800">{new Date(activeLease.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('apartments.activeLease')}</h4>
              <p className="text-sm text-gray-400 italic">{t('apartments.noActiveLease')}</p>
            </section>
          )}
        </div>
      </div>
    </div>
    {showHistory && <MaintenanceHistoryModal apartment={apartment} onClose={() => setShowHistory(false)} />}
    {showNewPayment && <NewPaymentModal apartment={apartment} onClose={() => setShowNewPayment(false)} />}
    </>
  )
}

function TerminateModal({ leaseId, depositAmount, onClose }: {
  leaseId: string
  depositAmount: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const terminateLease = useTerminateLease()
  const { data, isLoading } = useQuery({
    queryKey: ['pending-charges', leaseId],
    queryFn: () => leasesApi.getPendingCharges(leaseId),
  })

  const charges = (data as any)?.charges ?? []
  const totalCharges = (data as any)?.totalCharges ?? 0

  const doTerminate = (deductFromDeposit: boolean) => {
    terminateLease.mutate({ id: leaseId, deductFromDeposit }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{t('apartments.terminateLease')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-400">{t('apartments.checkingPendingCharges')}</p>
          ) : charges.length === 0 ? (
            <p className="text-sm text-gray-600">{t('apartments.noPendingCharges')}</p>
          ) : (
            <div>
              <p className="text-sm text-gray-700 mb-3"
                dangerouslySetInnerHTML={{
                  __html: t('apartments.pendingChargesInfo', {
                    count: charges.length,
                    plural: charges.length > 1 ? 's' : '',
                    total: totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                  })
                }}
              />
              <div className="space-y-2 mb-3">
                {charges.map((c: any) => (
                  <div key={c.id} className="flex justify-between text-sm bg-red-50 rounded-lg px-3 py-2">
                    <span className="text-gray-700">{c.notes?.replace('Maintenance charge: ', '') ?? 'Charge'}</span>
                    <span className="font-medium text-red-700">${Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: t('apartments.depositOnFile', { amount: depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) })
                }}
              />
            </div>
          )}
        </div>

        <div className="p-5 border-t flex flex-col gap-2">
          {charges.length > 0 && (
            <button
              onClick={() => doTerminate(true)}
              disabled={terminateLease.isPending}
              className="w-full px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {terminateLease.isPending ? t('common.processing') : t('apartments.terminateDeduct')}
            </button>
          )}
          <button
            onClick={() => doTerminate(false)}
            disabled={terminateLease.isPending}
            className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {terminateLease.isPending ? t('common.processing') : charges.length > 0 ? t('apartments.terminateLeaveCharges') : t('apartments.terminateOnly')}
          </button>
          <button onClick={onClose} className="w-full px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ApartmentsPage() {
  const { t } = useTranslation()
  const { data: apartments, isLoading } = useApartments()
  const createApartment = useCreateApartment()
  const updateApartment = useUpdateApartment()
  const deleteApartment = useDeleteApartment()
  const terminateLease = useTerminateLease()

  const location = useLocation()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Apartment | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  const [assigning, setAssigning] = useState<any | null>(null)
  const [moving, setMoving] = useState<any | null>(null)
  const [filterComplex, setFilterComplex] = useState(() => (location.state as any)?.complexId ?? '')
  const [filterStatus, setFilterStatus] = useState('')
  const [terminatingLease, setTerminatingLease] = useState<{ leaseId: string; depositAmount: number } | null>(null)

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
    if (confirm(t('apartments.deleteConfirm'))) deleteApartment.mutate(id)
  }

  const handleTerminate = (apt: any) => {
    const lease = apt.leases?.[0]
    if (!lease) return
    setTerminatingLease({ leaseId: lease.id, depositAmount: Number(lease.depositAmount) })
  }

  return (
    <div className="p-8">
      {viewing && <ApartmentDetailPanel apartment={(apartments as any[])?.find((a: any) => a.id === viewing)} onClose={() => setViewing(null)} />}
      {assigning && <AssignTenantModal apartment={assigning} onClose={() => setAssigning(null)} />}
      {moving && <MoveTenantModal apartment={moving} allApartments={apartments ?? []} onClose={() => setMoving(null)} />}
      {terminatingLease && <TerminateModal leaseId={terminatingLease.leaseId} depositAmount={terminatingLease.depositAmount} onClose={() => setTerminatingLease(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('apartments.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('apartments.subtitle', { filtered: filtered.length, total: apartments?.length ?? 0 })}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {t('apartments.addApartment')}
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterComplex}
          onChange={(e: { target: { value: string } }) => setFilterComplex(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">{t('common.allComplexes')}</option>
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
              {s === '' ? t('apartments.filterAll') : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? t('apartments.editApartment') : t('apartments.newApartment')}</h3>
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
        <div className="text-gray-400">{t('common.loading')}</div>
      ) : apartments?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('apartments.noApartments')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('apartments.noMatch')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t('apartments.colUnit')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colComplex')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colArea')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colRent')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colStatus')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colTenant')}</th>
                <th className="px-4 py-3 text-left">{t('apartments.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((apt: any) => {
                const activeLease = apt.leases?.[0]
                const tenant = activeLease?.tenant
                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{apt.number} — {t('common.floor')} {apt.floor}</td>
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
                        <button onClick={() => setViewing(apt.id)} className="text-xs text-indigo-600 hover:underline">{t('common.view')}</button>
                        {!tenant ? (
                          <button onClick={() => setAssigning(apt)} className="text-xs text-green-600 hover:underline">{t('common.assign')}</button>
                        ) : (
                          <>
                            <button onClick={() => setMoving(apt)} className="text-xs text-purple-600 hover:underline">{t('common.move')}</button>
                            <button onClick={() => handleTerminate(apt)} className="text-xs text-orange-500 hover:underline">{t('common.remove')}</button>
                          </>
                        )}
                        <button onClick={() => setEditing(apt)} className="text-xs text-blue-600 hover:underline">{t('common.edit')}</button>
                        <button onClick={() => handleDelete(apt.id)} className="text-xs text-red-500 hover:underline">{t('common.delete')}</button>
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
