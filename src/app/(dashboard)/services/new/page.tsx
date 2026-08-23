'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Briefcase, Layers, Calendar, DollarSign } from 'lucide-react'
import { createService, getEntitiesForSelect } from '../actions'
import { SERVICE_CATEGORIES, SERVICE_PACKAGES_BY_CATEGORY, ServiceCategoryType } from '@/lib/servicePackages'

const initialState: any = {
  error: '',
  success: false,
  serviceId: ''
}

export default function NewServicePage() {
  const [state, formAction, isPending] = useActionState(createService, initialState)
  const [entities, setEntities] = useState<{clients: any[], companies: any[]}>({ clients: [], companies: [] })
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryType | ''>('Business Setup')
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [isCustomName, setIsCustomName] = useState(false)
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    getEntitiesForSelect().then(setEntities)
  }, [])

  useEffect(() => {
    if (selectedCategory && SERVICE_PACKAGES_BY_CATEGORY[selectedCategory as ServiceCategoryType]) {
      const firstPkg = SERVICE_PACKAGES_BY_CATEGORY[selectedCategory as ServiceCategoryType][0]
      setSelectedPackage(firstPkg)
      setIsCustomName(false)
    }
  }, [selectedCategory])

  if (state?.success) {
    window.location.href = `/services`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/services" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Service / Package</h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">Add a business package or customized service application for a client.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden">
        <form action={formAction} className="divide-y divide-slate-100">
          <div className="p-6 sm:p-8 space-y-7">
            
            {state?.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                <p className="text-xs font-bold text-red-700">{state.error}</p>
              </div>
            )}

            {/* Link to Entity */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center mb-4">
                <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                Client &amp; Company Association
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="entityType" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Link Target *
                  </label>
                  <select 
                    id="entityType" 
                    name="entityType" 
                    required 
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  >
                    <option value="company">Company</option>
                    <option value="client">Individual Client</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="entityId" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Select Client / Company *
                  </label>
                  <select 
                    id="entityId" 
                    name="entityId" 
                    required 
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  >
                    <option value="">Select Entity...</option>
                    <optgroup label="Companies">
                      {entities.companies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                    </optgroup>
                    <optgroup label="Clients">
                      {entities.clients.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.clientType})</option>)}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Service & Package Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center mb-4">
                <Layers className="w-4 h-4 mr-2 text-[#5B21B6]" />
                Package Selection &amp; Operational Details
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                {/* 1. Category */}
                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Category *
                  </label>
                  <select 
                    id="category" 
                    name="category" 
                    required 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ServiceCategoryType)}
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-purple-50/50 border border-purple-200 text-[#4C1D95] rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer"
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Package / Service Name Selector */}
                <div>
                  <label htmlFor="packageSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Package / Service Template *
                  </label>
                  <select 
                    id="packageSelect" 
                    value={isCustomName ? '__CUSTOM__' : selectedPackage}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomName(true)
                      } else {
                        setIsCustomName(false)
                        setSelectedPackage(e.target.value)
                      }
                    }}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer"
                  >
                    {selectedCategory && SERVICE_PACKAGES_BY_CATEGORY[selectedCategory as ServiceCategoryType]?.map(pkg => (
                      <option key={pkg} value={pkg}>{pkg}</option>
                    ))}
                    <option value="__CUSTOM__">✍️ Custom Package Name...</option>
                  </select>
                </div>

                {/* Service Name Input (Hidden or Custom) */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Final Service / Package Name *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    required 
                    value={isCustomName ? customName : selectedPackage}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Mainland LLC Formation Package" 
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>

                {/* Manual Price Input */}
                <div>
                  <label htmlFor="price" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Agreed Package Price (AED)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="text-xs font-bold text-slate-500">AED</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="price" 
                      id="price" 
                      placeholder="0.00 (Enter manual price)" 
                      className="w-full pl-12 pr-3.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label htmlFor="paymentStatus" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Payment Status
                  </label>
                  <select 
                    id="paymentStatus" 
                    name="paymentStatus" 
                    defaultValue="Unpaid"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Operational Status
                  </label>
                  <select 
                    id="status" 
                    name="status" 
                    defaultValue="In Progress"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Target Completion Date */}
                <div>
                  <label htmlFor="targetCompletion" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Target Completion Date
                  </label>
                  <input 
                    type="date" 
                    name="targetCompletion" 
                    id="targetCompletion" 
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer" 
                  />
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Priority
                  </label>
                  <select 
                    id="priority" 
                    name="priority" 
                    defaultValue="Normal"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Description / Scope Notes */}
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Scope / Package Notes
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows={2} 
                    placeholder="Enter any specific requirements, deliverables, or notes for this package..." 
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                  />
                </div>

              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-slate-50 flex items-center justify-end space-x-3">
            <Link 
              href="/services" 
              className="bg-white py-2 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center py-2 px-5 rounded-xl text-xs font-bold text-white bg-[#5B21B6] hover:bg-[#4C1D95] shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? 'Saving Package...' : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Service / Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
