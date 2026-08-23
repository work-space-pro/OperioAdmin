'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, UploadCloud, FileText } from 'lucide-react'
import { uploadDocument } from '../actions'
import { getEntitiesForSelect } from '../../services/actions'

const initialState: any = {
  error: '',
  success: false
}

export default function UploadDocumentPage() {
  const [state, formAction, isPending] = useActionState(uploadDocument, initialState)
  const [entities, setEntities] = useState<{clients: any[], companies: any[]}>({ clients: [], companies: [] })
  
  useEffect(() => {
    getEntitiesForSelect().then(setEntities)
  }, [])

  if (state?.success) {
    window.location.href = `/documents`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/documents" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
          <p className="mt-1 text-sm text-gray-500">Securely store a client or company document to the vault.</p>
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

            {/* Link to Entity */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Document Association
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">Link to *</label>
                  <div className="mt-1">
                    <select id="entityType" name="entityType" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="company">Company</option>
                      <option value="client">Individual Client</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="entityId" className="block text-sm font-medium text-gray-700">Select Entity *</label>
                  <div className="mt-1">
                    <select id="entityId" name="entityId" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select...</option>
                      <optgroup label="Companies">
                        {entities.companies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </optgroup>
                      <optgroup label="Individuals">
                        {entities.clients.filter(c => c.clientType === 'Individual').map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <UploadCloud className="w-5 h-5 mr-2 text-indigo-500" />
                Document Details
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Title *</label>
                  <div className="mt-1">
                    <input type="text" name="title" id="title" required placeholder="e.g. Trade Licence 2026" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Document Type *</label>
                  <div className="mt-1">
                    <select id="documentType" name="documentType" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white">
                      <option value="">Select...</option>
                      <option value="Passport">Passport</option>
                      <option value="Visa">Visa</option>
                      <option value="Trade Licence">Trade Licence</option>
                      <option value="Emirates ID">Emirates ID</option>
                      <option value="Contract">Contract</option>
                      <option value="NOC">NOC</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date (For Reminders)</label>
                  <div className="mt-1">
                    <input type="date" name="expiryDate" id="expiryDate" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">File Upload</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
            <Link href="/documents" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Uploading...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
