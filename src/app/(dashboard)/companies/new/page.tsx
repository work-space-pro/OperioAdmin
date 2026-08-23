'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Building2, MapPin } from 'lucide-react'
import { createCompany, getClientsForSelect } from '../actions'

const initialState: any = {
  error: '',
  success: false,
  companyId: ''
}

export default function NewCompanyPage() {
  const [state, formAction, isPending] = useActionState(createCompany, initialState)
  const [clients, setClients] = useState<Array<{id: string, fullName: string}>>([])
  
  useEffect(() => {
    getClientsForSelect().then(setClients)
  }, [])

  if (state?.success) {
    window.location.href = `/companies/${state.companyId}`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/companies" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
          <p className="mt-1 text-sm text-gray-500">Register a new company and link it to a client.</p>
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

            {/* Core Info */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                Company Details
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Primary Client / Representative *</label>
                  <div className="mt-1">
                    <select id="clientId" name="clientId" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select a Client...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">Company Legal Name *</label>
                  <div className="mt-1">
                    <input type="text" name="legalName" id="legalName" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="tradeName" className="block text-sm font-medium text-gray-700">Trade Name (Optional)</label>
                  <div className="mt-1">
                    <input type="text" name="tradeName" id="tradeName" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">Company Type</label>
                  <div className="mt-1">
                    <select id="companyType" name="companyType" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select...</option>
                      <option value="LLC">LLC</option>
                      <option value="Sole Establishment">Sole Establishment</option>
                      <option value="Branch">Branch</option>
                      <option value="Civil Company">Civil Company</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Jurisdiction */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                Jurisdiction & Location
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="zoneType" className="block text-sm font-medium text-gray-700">Jurisdiction Zone</label>
                  <div className="mt-1">
                    <select id="zoneType" name="zoneType" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="Mainland">Mainland</option>
                      <option value="Free Zone">Free Zone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="registeredEmirate" className="block text-sm font-medium text-gray-700">Emirate</label>
                  <div className="mt-1">
                    <select id="registeredEmirate" name="registeredEmirate" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select...</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="RAK">RAK</option>
                      <option value="Fujairah">Fujairah</option>
                      <option value="UAQ">UAQ</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="freeZoneName" className="block text-sm font-medium text-gray-700">Free Zone Name (If applicable)</label>
                  <div className="mt-1">
                    <input type="text" name="freeZoneName" id="freeZoneName" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" placeholder="e.g. DMCC, IFZA, Meydan..." />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
            <Link href="/companies" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                  Save Company
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
