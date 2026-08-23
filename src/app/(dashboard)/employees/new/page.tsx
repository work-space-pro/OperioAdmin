'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Users, UserSquare2 } from 'lucide-react'
import { createEmployee } from '../actions'
import { getEntitiesForSelect } from '../../services/actions'

const initialState: any = {
  error: '',
  success: false
}

export default function AddEmployeePage() {
  const [state, formAction, isPending] = useActionState(createEmployee, initialState)
  const [entities, setEntities] = useState<{companies: any[]}>({ companies: [] })
  
  useEffect(() => {
    getEntitiesForSelect().then(res => setEntities({ companies: res.companies }))
  }, [])

  if (state?.success) {
    window.location.href = `/employees`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/employees" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
          <p className="mt-1 text-sm text-gray-500">Register a new employee for a client company.</p>
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
                <UserSquare2 className="w-5 h-5 mr-2 text-blue-500" />
                Employee Information
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

                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <div className="mt-1">
                    <input type="text" name="fullName" id="fullName" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                  <div className="mt-1">
                    <input type="text" name="designation" id="designation" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
                  <div className="mt-1">
                    <input type="text" name="nationality" id="nationality" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                Visa & IDs
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="visaType" className="block text-sm font-medium text-gray-700">Visa Type</label>
                  <div className="mt-1">
                    <select id="visaType" name="visaType" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select...</option>
                      <option value="Employment">Employment</option>
                      <option value="Partner">Partner</option>
                      <option value="Dependent">Dependent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="visaExpiryDate" className="block text-sm font-medium text-gray-700">Visa Expiry Date</label>
                  <div className="mt-1">
                    <input type="date" name="visaExpiryDate" id="visaExpiryDate" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">Passport Number</label>
                  <div className="mt-1">
                    <input type="text" name="passportNumber" id="passportNumber" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="emiratesId" className="block text-sm font-medium text-gray-700">Emirates ID</label>
                  <div className="mt-1">
                    <input type="text" name="emiratesId" id="emiratesId" placeholder="784-XXXX-XXXXXXX-X" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
            <Link href="/employees" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
