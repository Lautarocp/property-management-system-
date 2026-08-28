import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useUpdateTenant, useDeleteTenant, useTenantBalance } from '@/hooks/useTenants'
import { usePayments, useMarkAsPaid, useMarkAsUnpaid } from '@/hooks/usePayments'
import { tenantsApi } from '@/api/tenants.api'
import { TenantForm } from './TenantForm'
import type { CreateTenantPayload } from '@/api/tenants.api'

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const LEASE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  TERMINATED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  PENDING: 'bg-yellow-100 text-yellow-700',
}

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsApi.getOne(id!),
    enabled: !!id,
  })
  const { data: payments } = usePayments({ tenantId: id })
  const { data: balance } = useTenantBalance(id!)
  const updateTenant = useUpdateTenant()
  const deleteTenant = useDeleteTenant()
  const markAsPaid = useMarkAsPaid()
  const markAsUnpaid = useMarkAsUnpaid()

  const activeLease = (tenant as any)?.leases?.find((l: any) => l.status === 'ACTIVE')
  const leaseHistory = (tenant as any)?.leases?.filter((l: any) => l.status !== 'ACTIVE') ?? []

  const handleUpdate = (data: CreateTenantPayload) => {
    if (!id) return
    updateTenant.mutate({ id, data }, { onSuccess: () => setEditing(false) })
  }

  const handleDelete = () => {
    if (!id) return
    if (confirm(t('tenants.deleteConfirm'))) {
      deleteTenant.mutate(id, { onSuccess: () => navigate('/tenants') })
    }
  }

  if (isLoading) {
    return <div className="p-8 text-gray-400">{t('common.loading')}</div>
  }

  if (!tenant) {
    return (
      <div className="p-8">
        <Link to="/tenants" className="text-sm text-indigo-600 hover:underline">← {t('tenants.backToList')}</Link>
        <p className="text-gray-400 mt-4">{t('tenants.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/tenants" className="text-sm text-indigo-600 hover:underline">← {t('tenants.backToList')}</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tenant.firstName} {tenant.lastName}</h2>
          <p className="text-gray-500 text-sm mt-1">{tenant.email}</p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('common.edit')}
            </button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">{t('tenants.editTenant')}</h3>
          <TenantForm
            defaultValues={{
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              email: tenant.email,
              phone: tenant.phone,
              dni: tenant.dni,
              birthDate: tenant.birthDate?.split('T')[0],
              notes: tenant.notes,
              hasGuarantor: tenant.hasGuarantor,
              guarantorFirstName: tenant.guarantorFirstName,
              guarantorLastName: tenant.guarantorLastName,
              guarantorDni: tenant.guarantorDni,
              guarantorPhone: tenant.guarantorPhone,
              guarantorEmail: tenant.guarantorEmail,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            isLoading={updateTenant.isPending}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-6">
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

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('tenants.notesSection')}</h4>
            {tenant.notes ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                {tenant.notes}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">{t('tenants.noNotes')}</p>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
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

          <section className="bg-white rounded-xl shadow-sm p-6">
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
            <section className="bg-white rounded-xl shadow-sm p-6">
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

          <section className="bg-white rounded-xl shadow-sm p-6">
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

          <section className="bg-white rounded-xl shadow-sm p-6">
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
                          onClick={() => markAsPaid.mutate({ id: p.id })}
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
      )}
    </div>
  )
}
