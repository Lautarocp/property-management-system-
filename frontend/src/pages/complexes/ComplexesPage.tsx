import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useComplexes, useCreateComplex, useUpdateComplex, useDeleteComplex } from '@/hooks/useComplexes'
import type { ApartmentComplex } from '@/types'
import type { CreateComplexPayload } from '@/api/complexes.api'

function ComplexForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<CreateComplexPayload>
  onSubmit: (data: CreateComplexPayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateComplexPayload>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.nameLabel')}</label>
          <input {...register('name', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.addressLabel')}</label>
          <input {...register('address', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.address && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.cityLabel')}</label>
          <input {...register('city', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.city && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.stateLabel')}</label>
          <input {...register('state', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.state && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.zipLabel')}</label>
          <input {...register('zipCode', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('complexes.descriptionLabel')}</label>
          <textarea {...register('description')} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
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

export function ComplexesPage() {
  const { t } = useTranslation()
  const { data: complexes, isLoading } = useComplexes()
  const createComplex = useCreateComplex()
  const updateComplex = useUpdateComplex()
  const deleteComplex = useDeleteComplex()

  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ApartmentComplex | null>(null)

  const handleCreate = (data: CreateComplexPayload) => {
    createComplex.mutate(data, { onSuccess: () => setShowCreate(false) })
  }

  const handleUpdate = (data: CreateComplexPayload) => {
    if (!editing) return
    updateComplex.mutate({ id: editing.id, data }, { onSuccess: () => setEditing(null) })
  }

  const handleDelete = (id: string) => {
    if (confirm(t('complexes.deleteConfirm'))) deleteComplex.mutate(id)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('complexes.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('complexes.properties', { count: complexes?.length ?? 0 })}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {t('complexes.addComplex')}
        </button>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? t('complexes.editComplex') : t('complexes.newComplex')}</h3>
          <ComplexForm
            defaultValues={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowCreate(false); setEditing(null) }}
            isLoading={createComplex.isPending || updateComplex.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">{t('common.loading')}</div>
      ) : complexes?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">{t('complexes.noComplexes')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {complexes?.map(complex => (
            <div
              key={complex.id}
              onClick={() => navigate('/apartments', { state: { complexId: complex.id } })}
              className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{complex.name}</h3>
                  <p className="text-sm text-gray-500">{complex.address}</p>
                  <p className="text-sm text-gray-500">{complex.city}, {complex.state} {complex.zipCode}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {t('complexes.apts', { count: (complex as any)._count?.apartments ?? 0 })}
                </span>
              </div>
              {complex.description && (
                <p className="text-sm text-gray-400 mb-3">{complex.description}</p>
              )}
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); setEditing(complex) }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); handleDelete(complex.id) }}
                  className="text-sm text-red-500 hover:underline"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
