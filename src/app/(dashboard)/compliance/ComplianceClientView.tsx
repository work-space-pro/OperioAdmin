'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileCheck2,
  Receipt
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'

interface Filing {
  id: string
  company: {
    id: string
    legalName: string
    vatTrn: string | null
  }
  periodStart: Date | string
  periodEnd: Date | string
  dueDate: Date | string
  status: string
  taxableAmount?: number | null
  taxDue?: number | null
}

export default function ComplianceClientView({ filings }: { filings: Filing[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Paid'>('All')

  const totalCount = filings.length
  const pendingCount = filings.filter(f => f.status === 'Pending' || f.status === 'Due').length
  const submittedCount = filings.filter(f => f.status === 'Submitted' || f.status === 'Filed').length
  const paidCount = filings.filter(f => f.status === 'Paid' || f.status === 'Completed').length

  const filtered = filings.filter(f => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = 
      f.company.legalName.toLowerCase().includes(q) ||
      (f.company.vatTrn && f.company.vatTrn.toLowerCase().includes(q))
    
    let matchesStatus = true
    if (statusFilter !== 'All') {
      matchesStatus = f.status.toLowerCase() === statusFilter.toLowerCase()
    }
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5 font-sans animate-fade-in pb-12">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#5B21B6]" />
            Compliance &amp; Corporate Tax Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor UAE VAT quarterly returns, Federal Tax Authority (FTA) deadlines, and AML filings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/renewals"
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Renewals Radar
          </Link>
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Filings */}
        <div className="dash-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tax Filings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Tracked tax cycles</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Due / Pending */}
        <div className="dash-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Required</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
            <p className="text-[11px] text-amber-600 mt-0.5 font-bold">Due for filing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Submitted */}
        <div className="dash-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted to FTA</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{submittedCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Under processing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Paid / Compliant */}
        <div className="dash-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compliant &amp; Paid</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{paidCount}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-bold">Fully reconciled</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="dash-panel bg-white p-3.5 rounded-2xl border border-[#EAE5F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Pending', 'Submitted', 'Paid'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "filter-pill cursor-pointer",
                statusFilter === tab ? "filter-pill-active" : "filter-pill-inactive"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, TRN..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#5B21B6]"
          />
        </div>

      </div>

      {/* 4. DATA TABLE */}
      <div className="dash-panel bg-white rounded-2xl border border-[#EAE5F2] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No compliance records found</p>
            <p className="text-slate-400 mt-0.5">All tax filings and compliance records are currently up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header-tint border-b border-[#EAE5F2]">
                <tr>
                  <th className="py-3 px-5">Company / Entity</th>
                  <th className="py-3 px-5">Tax Registration Number (TRN)</th>
                  <th className="py-3 px-5">Filing Cycle / Period</th>
                  <th className="py-3 px-5">Due Date</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {filtered.map(filing => (
                  <tr key={filing.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <Link href={`/companies/${filing.company.id}`} className="hover:text-[#5B21B6] hover:underline flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {filing.company.legalName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600">
                      {filing.company.vatTrn || '—'}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">
                      {formatDate(filing.periodStart)} – {formatDate(filing.periodEnd)}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {formatDate(filing.dueDate)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        filing.status === 'Paid' || filing.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        filing.status === 'Submitted' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {filing.status}
                      </span>
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
