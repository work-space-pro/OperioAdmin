'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Search,
  Sparkles,
  ChevronRight,
  Calendar,
  FileText,
  MessageSquare,
  Building2,
  Clock,
  Filter,
} from 'lucide-react'
import { usePortal } from '@/components/portal/PortalContext'

export default function PortalApplicationsView({ applications }: { applications: any[] }) {
  const { activeCompany } = usePortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.serviceCategory.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'ALL') return true
    if (statusFilter === 'IN_PROGRESS')
      return (
        app.status === 'In Progress' ||
        app.status === 'Submitted to Authority' ||
        app.status === 'Under Review'
      )
    if (statusFilter === 'ACTION_REQUIRED')
      return app.status === 'Documents Required' || app.status === 'Awaiting Client'
    if (statusFilter === 'COMPLETED') return app.status === 'Completed' || app.status === 'Approved'

    return app.status === statusFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">Completed</span>
      case 'In Progress':
      case 'Submitted to Authority':
        return <span className="bg-purple-50 text-[#5B21B6] border border-purple-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">In Progress</span>
      case 'Under Review':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">Under Review</span>
      case 'Documents Required':
      case 'Awaiting Client':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">Documents Required</span>
      case 'Rejected':
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{status}</span>
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Service Applications</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track status, submit requested documents, and communicate with your processing team.
          </p>
        </div>
        <Link
          href="/portal/applications/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Start New Application</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'ALL', label: `All (${applications.length})` },
            {
              id: 'IN_PROGRESS',
              label: `Active (${applications.filter((a) => a.status === 'In Progress' || a.status === 'Under Review').length})`,
            },
            {
              id: 'ACTION_REQUIRED',
              label: `Action Needed (${applications.filter((a) => a.status === 'Documents Required').length})`,
            },
            {
              id: 'COMPLETED',
              label: `Completed (${applications.filter((a) => a.status === 'Completed' || a.status === 'Approved').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#5B21B6] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
          />
        </div>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No applications match your filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your search criteria or create a new application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/portal/applications/${app.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all group block"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#5B21B6] bg-purple-50 px-2.5 py-0.5 rounded-lg">
                      {app.applicationNumber}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors">
                      {app.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.companyName}</span>
                    </span>
                    <span>•</span>
                    <span>{app.serviceCategory}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Submitted: {new Date(app.submittedAt).toLocaleDateString('en-GB')}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {app.documentsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{app.documentsCount} docs</span>
                      </span>
                    )}
                    {app.messagesCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{app.messagesCount} msgs</span>
                      </span>
                    )}
                  </div>
                  {getStatusBadge(app.status)}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#5B21B6] transition-colors hidden sm:block" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
