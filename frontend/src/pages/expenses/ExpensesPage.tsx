import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useFiltersStore } from '@/store/filters.store'
import { complexesApi } from '@/api/complexes.api'
import type { Expense } from '@/types'
import type { CreateExpensePayload } from '@/api/expenses.api'

const CATEGORY_COLORS: Record<Expense['category'], string> = {
  REPAIRS: 'bg-orange-100 text-orange-700',
  UTILITIES: 'bg-blue-100 text-blue-700',
  CLEANING: 'bg-teal-100 text-teal-700',
  INSURANCE: 'bg-purple-100 text-purple-700',
  TAXES: 'bg-red-100 text-red-700',
  STAFF: 'bg-indigo-100 text-indigo-700',
  OTHER: 'bg-gray-100 text-gray-600',
}

const CATEGORIES = ['REPAIRS', 'UTILITIES', 'CLEANING', 'INSURANCE', 'TAXES', 'STAFF', 'OTHER'] as Expense['category'][]

function ExpenseForm({
  defaultValues,
  complexes,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<CreateExpensePayload>
  complexes: any[]
  onSubmit: (data: CreateExpensePayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateExpensePayload>({
    defaultValues,
  })

  const categoryLabels: Record<string, string> = {
    REPAIRS: t('expenses.catRepairs'),
    UTILITIES: t('expenses.catUtilities'),
    CLEANING: t('expenses.catCleaning'),
    INSURANCE: t('expenses.catInsurance'),
    TAXES: t('expenses.catTaxes'),
    STAFF: t('expenses.catStaff'),
    OTHER: t('expenses.catOther'),
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses.descriptionLabel')}</label>
          <input
            {...register('description', { required: true })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder={t('expenses.descriptionPlaceholder')}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses.amountLabel')}</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { required: true, valueAsNumber: true })}
              className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses.dateLabel')}</label>
          <input
            type="date"
            {...register('date', { required: true })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses.categoryLabel')}</label>
          <select {...register('category')} className="w-full border rounded-lg px-3 py-2 text-sm">
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses.complexLabel')}</label>
          <select
            {...register('complexId', { required: true })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{t('expenses.selectComplex')}</option>
            {complexes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.complexId && <p className="text-red-500 text-xs mt-1">{t('common.required')}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder={t('expenses.notesPlaceholder')}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function EditExpenseModal({ expense, complexes, onClose }: { expense: any; complexes: any[]; onClose: () => void }) {
  const { t } = useTranslation()
  const updateExpense = useUpdateExpense()

  const onSubmit = (data: CreateExpensePayload) => {
    updateExpense.mutate(
      { id: expense.id, data: { ...data, amount: Number(data.amount) } },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-4">{t('expenses.editExpense')}</h3>
        <ExpenseForm
          defaultValues={{
            description: expense.description,
            amount: Number(expense.amount),
            date: expense.date?.split('T')[0],
            category: expense.category,
            complexId: expense.complexId,
            notes: expense.notes ?? '',
          }}
          complexes={complexes}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={updateExpense.isPending}
        />
      </div>
    </div>
  )
}

export function ExpensesPage() {
  const { t } = useTranslation()
  const filters = useFiltersStore(s => s.expenses)
  const setFilter = useFiltersStore(s => s.setExpensesFilter)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const { data: expenses, isLoading } = useExpenses(filters.complexId, filters.category)
  const { data: complexes = [] } = useQuery({ queryKey: ['complexes'], queryFn: complexesApi.getAll })

  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()

  const categoryLabels: Record<string, string> = {
    REPAIRS: t('expenses.catRepairs'),
    UTILITIES: t('expenses.catUtilities'),
    CLEANING: t('expenses.catCleaning'),
    INSURANCE: t('expenses.catInsurance'),
    TAXES: t('expenses.catTaxes'),
    STAFF: t('expenses.catStaff'),
    OTHER: t('expenses.catOther'),
  }

  const handleCreate = (data: CreateExpensePayload) => {
    createExpense.mutate(
      { ...data, amount: Number(data.amount) },
      { onSuccess: () => setShowCreate(false) }
    )
  }

  const handleDelete = (id: string) => {
    if (confirm(t('expenses.deleteConfirm'))) deleteExpense.mutate(id)
  }

  const total = (expenses as any[] ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="p-8">
      {editing && (
        <EditExpenseModal
          expense={editing}
          complexes={complexes as any[]}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('expenses.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('expenses.subtitle', { count: expenses?.length ?? 0, total: total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {t('expenses.newExpense')}
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filters.complexId}
          onChange={e => setFilter({ complexId: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">{t('common.allComplexes')}</option>
          {(complexes as any[]).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={e => setFilter({ category: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">{t('expenses.allCategories')}</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{categoryLabels[c]}</option>
          ))}
        </select>
        {(filters.complexId || filters.category) && (
          <button
            onClick={() => setFilter({ complexId: '', category: '' })}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('expenses.newExpenseTitle')}</h3>
          <ExpenseForm
            complexes={complexes as any[]}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isLoading={createExpense.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">{t('common.loading')}</div>
      ) : !expenses?.length ? (
        <div className="text-center py-16 text-gray-400">{t('expenses.noExpenses')}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t('expenses.colDate')}</th>
                <th className="px-4 py-3 text-left">{t('expenses.colDescription')}</th>
                <th className="px-4 py-3 text-left">{t('expenses.colCategory')}</th>
                <th className="px-4 py-3 text-left">{t('expenses.colComplex')}</th>
                <th className="px-4 py-3 text-right">{t('expenses.colAmount')}</th>
                <th className="px-4 py-3 text-left">{t('expenses.colNotes')}</th>
                <th className="px-4 py-3 text-left">{t('expenses.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(expenses as any[]).map((expense: any) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{expense.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[expense.category as Expense['category']] ?? 'bg-gray-100 text-gray-600'}`}>
                      {categoryLabels[expense.category] ?? expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{expense.complex?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">
                    {expense.notes ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(expense)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteExpense.isPending}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
