'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit2
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import RenewalDetailModal from '@/components/renewals/RenewalDetailModal'
import { cn } from '@/lib/utils'

export default function RenewalsClientView({ initialRenewals }: { initialRenewals: any[] }) {
  const [renewals, setRenewals] = useState<any[]>(initialRenewals)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pageSize = 15

  // Metrics
  const totalCount = renewals.length
  const expiredCount = renewals.filter(r => r.isExpired).length
  const due30Count = renewals.filter(r => !r.isExpired && r.daysUntil <= 30).length
  const due60Count = renewals.filter(r => !r.isExpired && r.daysUntil > 30 && r.daysUntil <= 60).length
  const validCount = renewals.filter(r => !r.isExpired && r.daysUntil > 60).length

  // Filter
  const filtered = renewals.filter(item => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.entityName && item.entityName.toLowerCase().includes(q)) ||
      (item.clientName && item.clientName.toLowerCase().includes(q))

    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter

    let matchesStatus = true
    if (statusFilter === 'Expired') matchesStatus = item.isExpired
    else if (statusFilter === 'Due Soon') matchesStatus = item.isExpiringSoon && !item.isExpired
    else if (statusFilter === 'Valid') matchesStatus = !item.isExpired && !item.isExpiringSoon

    return matchesSearch && matchesCat && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenDetail = (item: any) => {
    setSelectedRenewal(item)
    setIsModalOpen(true)
  }

  const handleItemUpdated = (updatedItem: any) => {
    const now = new Date()
    const days = (new Date(updatedItem.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    const refreshed = {
      ...updatedItem,
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    }

    setRenewals(prev => prev.map(r => r.id === refreshed.id ? refreshed : r))
    setSelectedRenewal(refreshed)
  }

  const categories = [
    'All',
    'Trade Licence',
    'Establishment Card',
    'Visa',
    'E-Visa',
    'Emirates ID',
    'Passport',
    'Insurance',
    'Health Insurance',
    'Vehicle Registration',
    'Vehicle Insurance',
    'Driving Licence',
    'Document'
  ]

  return (
    <div className="space-y-5 animate-fade-in font-sans pb-10">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <RefreshCw className="w-5 h-5 text-[#5B21B6] mr-2" />
            Renewals &amp; Expirations Hub
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Centralized monitoring &amp; quick-update for Trade Licences, Visas, Passports, EIDs, and Vehicle Registrations.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="dash-card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Items Tracked</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="dash-card p-4 border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Total Expired (Action Req)
          </p>
          <p className="text-2xl font-black text-red-600 mt-1">{expiredCount}</p>
        </div>

        <div className="dash-card p-4 border-l-4 border-l-orange-500">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Total Due Soon (30d)
          </p>
          <p className="text-2xl font-black text-orange-600 mt-1">{due30Count}</p>
        </div>

        <div className="dash-card p-4 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Valid &amp; Active
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{validCount}</p>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="dash-panel p-4 bg-white rounded-2xl border border-[#EAE5F2] space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search licence, employee, company, vehicle, or client..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6] transition-all"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'Expired', 'Due Soon', 'Valid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={cn(
                  "filter-pill cursor-pointer",
                  statusFilter === st ? "filter-pill-active" : "filter-pill-inactive"
                )}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                categoryFilter === cat 
                  ? "bg-[#5B21B6] text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Renewals Data Table */}
      <div className="dash-panel bg-white rounded-2xl overflow-hidden border border-[#EAE5F2]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="table-header-tint border-b border-[#EAE5F2]">
              <tr>
                <th className="px-5 py-3">Item / Licence / Record</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Company / Entity</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Expiry Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No renewal records match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayed.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-[#FAF9FC] transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors">
                      {item.title}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-md border",
                        item.category === 'Trade Licence' ? "bg-purple-50 text-purple-700 border-purple-200" :
                        item.category === 'Establishment Card' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                        item.category === 'E-Visa' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        item.category === 'Vehicle Registration' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        item.category === 'Vehicle Insurance' ? "bg-teal-50 text-teal-700 border-teal-200" :
                        item.category === 'Passport' ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {item.entityName}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {item.clientId ? (
                        <Link href={`/clients/${item.clientId}`} className="font-bold text-[#5B21B6] hover:underline">
                          {item.clientName}
                        </Link>
                      ) : (
                        <span className="text-slate-500">{item.clientName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center text-xs font-bold">
                        <span className={item.isExpired ? 'text-red-600' : item.isExpiringSoon ? 'text-orange-600' : 'text-slate-800'}>
                          {formatDate(item.expiryDate)}
                        </span>
                        {item.isExpired && (
                          <span className="ml-2 text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                            EXPIRED
                          </span>
                        )}
                        {!item.isExpired && item.isExpiringSoon && (
                          <span className="ml-2 text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded">
                            IN {item.daysUntil} DAYS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                        item.isExpired ? 'bg-red-50 text-red-700 border-red-200' :
                        item.isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}>
                        {item.isExpired ? 'Action Required' : item.isExpiringSoon ? 'Due Soon' : 'Valid'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE] rounded-lg transition-all"
                      >
                        View &amp; Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#EAE5F2] flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
            <span className="text-[11px] font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} items
            </span>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-bold text-[#5B21B6] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                Page {currentPage} of {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Renewal Detail & Update Modal */}
      <RenewalDetailModal 
        item={selectedRenewal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={handleItemUpdated}
      />

    </div>
  )
}
