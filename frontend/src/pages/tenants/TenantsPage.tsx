import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant, useTenantBalance } from '@/hooks/useTenants'
import { usePayments, useMarkAsPaid, useMarkAsUnpaid } from '@/hooks/usePayments'
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
  const { t } = useTranslation()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateTenantPayload>({ defaultValues })
  const hasGuarantor = watch('hasGuarantor')
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.firstNameLabel')}</label>
          <input {...register('firstName', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.lastNameLabel')}</label>
          <input {...register('lastName', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.emailLabel')}</label>
          <input type="email" {...register('email', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.phoneLabel2')}</label>
          <input {...register('phone')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.dniLabel2')}</label>
          <input {...register('dni')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.birthDateLabel2')}</label>
          <input type="date" {...register('birthDate')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.notesLabel')}</label>
          <textarea {...register('notes')} rows={3} placeholder={t('tenants.notesPlaceholder')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" {...register('hasGuarantor')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{t('tenants.hasGuarantor')}</span>
        </label>

        {hasGuarantor && (
          <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 border rounded-lg p-4">
            <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('tenants.guarantorInfo')}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.guarantorFirstName')}</label>
              <input {...register('guarantorFirstName')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.guarantorLastName')}</label>
              <input {...register('guarantorLastName')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.guarantorDni')}</label>
              <input {...register('guarantorDni')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.guarantorPhone')}</label>
              <input {...register('guarantorPhone')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenants.guarantorEmail')}</label>
              <input type="email" {...register('guarantorEmail')} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        )}
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

function TenantDetailPanel({ tenantId, onClose, onEdit }: {
  tenantId: string
  onClose: () => void
  onEdit: (tenant: Tenant) => void
}) {
  const { t } = useTranslation()
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsApi.getOne(tenantId),
  })
  const { data: payments } = usePayments({ tenantId })
  const { data: balance } = useTenantBalance(tenantId)
  const markAsPaid = useMarkAsPaid()
  const markAsUnpaid = useMarkAsUnpaid()

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
                {t('common.edit')}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-gray-400">{t('common.loading')}</div>
        ) : tenant ? (
          <div className="p-6 space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.personalInfo')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">{t('tenants.phoneLabel')}</p>
                  <p className="text-sm font-medium text-gray-800">{tenant.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('tenants.dniLabel')}</p>
                  <p className="text-sm font-medium text-gray-800">{tenant.dni || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('tenants.birthDateLabel')}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {tenant.birthDate ? new Date(tenant.birthDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('tenants.memberSince')}</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.notesSection')}</h4>
              {tenant.notes ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {tenant.notes}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('tenants.noNotes')}</p>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.guarantorSection')}</h4>
              {tenant.hasGuarantor ? (
                <div className="bg-gray-50 border rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.guarantorNameLabel')}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {[tenant.guarantorFirstName, tenant.guarantorLastName].filter(Boolean).join(' ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.guarantorDni')}</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorDni || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.guarantorPhone')}</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('tenants.guarantorEmail')}</p>
                    <p className="text-sm font-medium text-gray-800">{tenant.guarantorEmail || '—'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('tenants.noGuarantor')}</p>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.currentApartment')}</h4>
              {activeLease ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        #{activeLease.apartment.number} — {t('common.floor')} {activeLease.apartment.floor}
                      </p>
                      <p className="text-sm text-gray-500">{activeLease.apartment.complex?.name}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-blue-200">
                    <div>
                      <p className="text-xs text-gray-400">{t('tenants.monthlyRent')}</p>
                      <p className="text-sm font-semibold text-gray-800">${Number(activeLease.monthlyRent).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('tenants.startDate')}</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(activeLease.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('tenants.endDate')}</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(activeLease.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {activeLease.notes && (
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-gray-400">{t('tenants.leaseNotes')}</p>
                      <p className="text-sm text-gray-700">{activeLease.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('tenants.noActiveLease')}</p>
              )}
            </section>

            {leaseHistory.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.leaseHistory')}</h4>
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

            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.financialBalance')}</h4>
              {balance ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{t('tenants.totalCharged')}</p>
                    <p className="text-base font-bold text-gray-900">${Number(balance.totalCharged).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{t('tenants.totalPaid')}</p>
                    <p className="text-base font-bold text-green-600">${Number(balance.totalPaid).toLocaleString()}</p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${Number(balance.balance) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-xs text-gray-400 mb-1">{t('tenants.balance')}</p>
                    <p className={`text-base font-bold ${Number(balance.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${Number(balance.balance).toLocaleString()}
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${Number(balance.balance) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {Number(balance.balance) > 0 ? t('tenants.owes') : t('tenants.paidUp')}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('tenants.noLedger')}</p>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.paymentHistory')}</h4>
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
                        <span className="text-gray-500 text-xs">{t('tenants.due', { date: new Date(p.dueDate).toLocaleDateString() })}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {p.status}
                        </span>
                        {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                          <button
                            onClick={() => markAsPaid.mutate(p.id)}
                            className="text-xs text-green-600 hover:underline"
                          >
                            {t('tenants.markPaid')}
                          </button>
                        )}
                        {p.status === 'PAID' && (
                          <button
                            onClick={() => markAsUnpaid.mutate(p.id)}
                            className="text-xs text-yellow-600 hover:underline"
                          >
                            {t('tenants.markUnpaid')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('tenants.noPayments')}</p>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function TenantsPage() {
  const { t } = useTranslation()
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
    if (confirm(t('tenants.deleteConfirm'))) deleteTenant.mutate(id)
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
          <h2 className="text-2xl font-bold text-gray-900">{t('tenants.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('tenants.subtitle', { filtered: filtered.length, total: tenants?.length ?? 0 })}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {t('tenants.addTenant')}
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterComplex}
          onChange={(e: { target: { value: string } }) => setFilterComplex(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">{t('tenants.allComplexes')}</option>
          {complexOptions.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? t('tenants.editTenant') : t('tenants.newTenant')}</h3>
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
        <div className="text-gray-400">{t('common.loading')}</div>
      ) : tenants?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('tenants.noTenants')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('tenants.noMatch')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t('tenants.colName')}</th>
                <th className="px-4 py-3 text-left">{t('tenants.colEmail')}</th>
                <th className="px-4 py-3 text-left">{t('tenants.colPhone')}</th>
                <th className="px-4 py-3 text-left">{t('tenants.colDni')}</th>
                <th className="px-4 py-3 text-left">{t('tenants.colApartment')}</th>
                <th className="px-4 py-3 text-left">{t('tenants.colActions')}</th>
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
                        <span className="text-gray-400 text-xs">{t('tenants.unassigned')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setViewing(tenant.id)} className="text-xs text-indigo-600 hover:underline">{t('common.view')}</button>
                        <button onClick={() => setEditing(tenant)} className="text-xs text-blue-600 hover:underline">{t('common.edit')}</button>
                        <button onClick={() => handleDelete(tenant.id)} className="text-xs text-red-500 hover:underline">{t('common.delete')}</button>
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
