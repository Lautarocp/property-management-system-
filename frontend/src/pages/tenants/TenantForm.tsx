import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateTenantPayload } from '@/api/tenants.api'

export function TenantForm({ defaultValues, onSubmit, onCancel, isLoading }: {
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
