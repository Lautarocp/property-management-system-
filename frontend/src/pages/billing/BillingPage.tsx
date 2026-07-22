import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGenerateMonthlyRent } from '@/hooks/useBilling'

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function BillingPage() {
  const { t } = useTranslation()
  const [month, setMonth] = useState(getCurrentMonth())
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)

  const generate = useGenerateMonthlyRent()

  const handleGenerate = () => {
    setResult(null)
    generate.mutate(month, {
      onSuccess: (data) => setResult(data),
    })
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('billing.title')}</h2>
      <p className="text-gray-500 mb-8">{t('billing.subtitle')}</p>

      <div className="max-w-lg space-y-6">
        {/* Generate card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('billing.generateTitle')}</h3>
          <p className="text-sm text-gray-500 mb-5">
            {t('billing.generateDescription')}
          </p>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('billing.billingMonth')}</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generate.isPending || !month}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {generate.isPending ? t('billing.generating') : t('billing.generate')}
            </button>
          </div>
        </div>

        {/* Result card */}
        {result && (
          <div className={`rounded-xl p-5 border-2 ${result.created > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-semibold mb-3 ${result.created > 0 ? 'text-green-800' : 'text-gray-700'}`}>
              {result.created > 0 ? t('billing.successTitle') : t('billing.noNewCharges')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-green-600">{result.created}</p>
                <p className="text-sm text-gray-500 mt-1">{t('billing.newChargesCreated')}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-gray-400">{result.skipped}</p>
                <p className="text-sm text-gray-500 mt-1">{t('billing.alreadyExisted')}</p>
              </div>
            </div>
          </div>
        )}

        {generate.isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {t('billing.errorMessage')}
          </div>
        )}

        {/* Info section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-2">
          <p className="font-semibold">{t('billing.howItWorks')}</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>{t('billing.bullet1')}</li>
            <li>{t('billing.bullet2')}</li>
            <li>{t('billing.bullet3')}</li>
            <li>{t('billing.bullet4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
