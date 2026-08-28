import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTenants, useCreateTenant, useDeleteTenant } from '@/hooks/useTenants'
import { TenantForm } from './TenantForm'
import type { CreateTenantPayload } from '@/api/tenants.api'

export function TenantsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tenants, isLoading } = useTenants()
  const createTenant = useCreateTenant()
  const deleteTenant = useDeleteTenant()

  const [showCreate, setShowCreate] = useState(false)
  const [filterComplex, setFilterComplex] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

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
    setEmailError(null)
    createTenant.mutate(data, {
      onSuccess: () => setShowCreate(false),
      onError: (error: any) => {
        if (error?.response?.status === 409) {
          setEmailError(t('tenants.emailAlreadyExists'))
        }
      },
    })
  }

  const handleDelete = (e: { stopPropagation: () => void }, id: string) => {
    e.stopPropagation()
    if (confirm(t('tenants.deleteConfirm'))) deleteTenant.mutate(id)
  }

  return (
    <div className="p-8">
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

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('tenants.newTenant')}</h3>
          <TenantForm
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setEmailError(null) }}
            isLoading={createTenant.isPending}
            emailError={emailError}
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
                  <tr
                    key={tenant.id}
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
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
                      <button onClick={(e) => handleDelete(e, tenant.id)} className="text-xs text-red-500 hover:underline">{t('common.delete')}</button>
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
