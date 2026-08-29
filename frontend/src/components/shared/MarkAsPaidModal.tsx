import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMarkAsPaid } from '@/hooks/usePayments'

interface MarkAsPaidModalProps {
  payment: any
  paidItemIds?: string[]
  amount: number
  onClose: () => void
}

export function MarkAsPaidModal({ payment, paidItemIds, amount, onClose }: MarkAsPaidModalProps) {
  const { t } = useTranslation()
  const markAsPaid = useMarkAsPaid()
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'MERCADO_PAGO'>('CASH')
  const [feeAmount, setFeeAmount] = useState('')

  const handleConfirm = () => {
    markAsPaid.mutate(
      {
        id: payment.id,
        paidItemIds,
        paymentMethod,
        feeAmount: paymentMethod === 'MERCADO_PAGO' && feeAmount ? Number(feeAmount) : undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-1">{t('payments.confirmPaymentTitle')}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {payment.tenant.firstName} {payment.tenant.lastName} — ${amount.toLocaleString()}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.paymentMethodLabel')}</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as 'CASH' | 'BANK_TRANSFER' | 'MERCADO_PAGO')}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="CASH">{t('payments.methodCash')}</option>
              <option value="BANK_TRANSFER">{t('payments.methodBankTransfer')}</option>
              <option value="MERCADO_PAGO">{t('payments.methodMercadoPago')}</option>
            </select>
          </div>
          {paymentMethod === 'MERCADO_PAGO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('payments.feeAmountLabel')}</label>
              <input
                type="number"
                step="0.01"
                value={feeAmount}
                onChange={e => setFeeAmount(e.target.value)}
                placeholder="0"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end pt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={markAsPaid.isPending}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {markAsPaid.isPending ? t('common.saving') : t('payments.confirmPayment')}
          </button>
        </div>
      </div>
    </div>
  )
}
