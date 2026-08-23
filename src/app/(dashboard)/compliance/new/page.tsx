'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Activity } from 'lucide-react'
import { logVATFiling } from '../actions'
import { getEntitiesForSelect } from '../../services/actions'

const initialState: any = {
  error: '',
  success: false
}

export default function LogFilingPage() {
  const [state, formAction, isPending] = useActionState(logVATFiling, initialState)
  const [entities, setEntities] = useState<{companies: any[]}>({ companies: [] })
  
  useEffect(() => {
    getEntitiesForSelect().then(res => setEntities({ companies: res.companies }))
  }, [])

  if (state?.success) {
    window.location.href = `/compliance`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/compliance" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Tax Filing</h1>
          <p className="mt-1 text-sm text-gray-500">Record a new VAT or Corporate Tax filing period.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <form action={formAction} className="divide-y divide-gray-200">
          <div className="p-6 space-y-8">
            
            {state?.error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Filing Details
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Company *</label>
                  <div className="mt-1">
                    <select id="companyId" name="companyId" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select a company...</option>
                      {entities.companies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700">Period Start Date *</label>
                  <div className="mt-1">
                    <input type="date" name="periodStart" id="periodStart" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700">Period End Date *</label>
                  <div className="mt-1">
                    <input type="date" name="periodEnd" id="periodEnd" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Filing Due Date *</label>
                  <div className="mt-1">
                    <input type="date" name="dueDate" id="dueDate" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <select id="status" name="status" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Financials (Optional)</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="amountDue" className="block text-sm font-medium text-gray-700">Amount Due (AED)</label>
                  <div className="mt-1">
                    <input type="number" step="0.01" name="amountDue" id="amountDue" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid (AED)</label>
                  <div className="mt-1">
                    <input type="number" step="0.01" name="amountPaid" id="amountPaid" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes / References</label>
                  <div className="mt-1">
                    <textarea id="notes" name="notes" rows={3} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"></textarea>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
            <Link href="/compliance" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Logging...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Log Filing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
