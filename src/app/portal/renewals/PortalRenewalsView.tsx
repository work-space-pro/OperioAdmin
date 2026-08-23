'use client'

import React, { useState } from 'react'
import {
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Car,
  FileText,
  Users,
  CreditCard,
  Layers,
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import { requestRenewalAction } from './actions'

interface RenewalRecord {
  id: string
  title: string
  category: string
  type: string
  identifier: string
  companyId: string | null
  companyName: string
  expiryDate: string
  daysUntil: number
  isExpired: boolean
  isExpiringSoon: boolean
  status: 'Valid' | 'Due Soon' | 'Expired'
}

export default function PortalRenewalsView({ renewals }: { renewals: RenewalRecord[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Metrics
  const totalCount = renewals.length
  const expiredCount = renewals.filter((r) => r.isExpired).length
  const due30Count = renewals.filter((r) => !r.isExpired && r.daysUntil <= 30).length
  const due60Count = renewals.filter((r) => !r.isExpired && r.daysUntil > 30 && r.daysUntil <= 60).length
  const validCount = renewals.filter((r) => !r.isExpired && r.daysUntil > 60).length

  // Filtered dataset
  const filtered = renewals.filter((r) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      !searchTerm.trim() ||
      r.title.toLowerCase().includes(q) ||
      r.companyName.toLowerCase().includes(q) ||
      r.identifier.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)

    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter

    let matchesStatus = true
    if (statusFilter === 'Expired') matchesStatus = r.isExpired
    else if (statusFilter === 'Due Soon') matchesStatus = r.isExpiringSoon && !r.isExpired
    else if (statusFilter === 'Valid') matchesStatus = !r.isExpired && !r.isExpiringSoon

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleRequestRenewal = async (item: RenewalRecord) => {
    setRequestingId(item.id)
    setSuccessMessage('')

    const res = await requestRenewalAction({
      title: item.title,
      type: item.type,
      companyId: item.companyId || undefined,
      expiryDate: item.expiryDate,
    })

    if (res.success) {
      setSuccessMessage(`Renewal request (${res.requestNumber}) submitted to your Operio team!`)
    }
    setRequestingId(null)
  }

  const categories = [
    'All',
    'Trade Licence',
    'Establishment Card',
    'Visa',
    'Vehicle Registration',
    'Vehicle Insurance',
    'Passport',
    'Emirates ID',
    'Health Insurance',
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#5B21B6]" />
            Renewals &amp; Compliance Hub
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Active radar tracking government licenses, establishment cards, vehicle fleet, and employee visas.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monitored</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">All company records</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Critical / Expired</span>
          <div className="text-2xl font-black text-red-600 mt-1">{expiredCount}</div>
          <p className="text-[10px] text-red-400 font-semibold mt-0.5">Immediate action required</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Due in 30-60 Days</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{due30Count + due60Count}</div>
          <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Prepare renewals now</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Valid &amp; Up to Date</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{validCount}</div>
          <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">In compliance</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'All', label: `All (${totalCount})` },
              { id: 'Expired', label: `Expired (${expiredCount})` },
              { id: 'Due Soon', label: `Due Soon (${due30Count + due60Count})` },
              { id: 'Valid', label: `Valid (${validCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                  statusFilter === tab.id
                    ? 'bg-[#5B21B6] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by license, plate, passport..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5B21B6]/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer',
                categoryFilter === cat
                  ? 'bg-purple-100 text-[#5B21B6]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Renewals Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No renewals match your filter</p>
            <p className="text-slate-400 mt-0.5">Try resetting the search or category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="py-3.5 px-5">Renewal Record</th>
                  <th className="py-3.5 px-5">Category / Entity</th>
                  <th className="py-3.5 px-5">Identifier / No</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Status &amp; Countdown</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.type}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-[#5B21B6] border border-purple-100">
                        {item.category}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[160px]">
                        {item.companyName}
                      </p>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {item.identifier}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      {formatDate(item.expiryDate)}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={cn(
                          'px-2.5 py-1 text-[10px] font-black rounded-full border inline-flex items-center gap-1',
                          item.isExpired
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.isExpiringSoon
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}
                      >
                        {item.isExpired ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>EXPIRED ({Math.abs(item.daysUntil)}d ago)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{item.daysUntil} DAYS REMAINING</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        disabled={requestingId === item.id}
                        onClick={() => handleRequestRenewal(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{requestingId === item.id ? 'Submitting...' : 'Request Renewal'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
