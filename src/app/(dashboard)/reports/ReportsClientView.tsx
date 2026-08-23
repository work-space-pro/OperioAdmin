'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  FileBarChart, 
  PieChart, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  BadgeAlert, 
  Clock, 
  DollarSign, 
  Layers, 
  Building2, 
  User, 
  FileText, 
  ShieldCheck, 
  Printer, 
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportsClientViewProps {
  stats: {
    totalRevenue: number
    collectedRevenue: number
    pendingRevenue: number
    totalClients: number
    totalCompanies: number
    totalServices: number
    completedServices: number
    inProgressServices: number
    pendingServices: number
    complianceScore: number
    criticalExpiriesCount: number
    warningExpiriesCount: number
  }
  categoryBreakdown: {
    category: string
    count: number
    revenue: number
    percentage: number
  }[]
  statusBreakdown: {
    status: string
    count: number
    percentage: number
  }[]
  expiringItems: {
    id: string
    type: string
    title: string
    holder: string
    expiryDate: string
    daysLeft: number
    status: 'expired' | 'critical' | 'warning'
    clientLink: string
  }[]
  servicesList: {
    id: string
    name: string
    category: string
    clientName: string
    companyName: string
    price: number
    status: string
    paymentStatus: string
    targetCompletion: string
    createdAt: string
  }[]
}

export default function ReportsClientView({
  stats,
  categoryBreakdown,
  statusBreakdown,
  expiringItems,
  servicesList
}: ReportsClientViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'compliance' | 'services'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return servicesList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchCat = selectedCategoryFilter === 'ALL' || s.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
      const matchStat = selectedStatusFilter === 'ALL' || s.status.toLowerCase() === selectedStatusFilter.toLowerCase()

      return matchSearch && matchCat && matchStat
    })
  }, [servicesList, searchQuery, selectedCategoryFilter, selectedStatusFilter])

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Package / Service Name', 'Category', 'Client Name', 'Company Name', 'Agreed Price (AED)', 'Service Status', 'Payment Status', 'Target Date', 'Created Date']
    const rows = filteredServices.map(s => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      `"${s.clientName.replace(/"/g, '""')}"`,
      `"${s.companyName.replace(/"/g, '""')}"`,
      s.price || 0,
      `"${s.status}"`,
      `"${s.paymentStatus}"`,
      `"${s.targetCompletion || 'N/A'}"`,
      `"${s.createdAt}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Operio_Reports_Analytics_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Handler
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col font-sans space-y-6 pb-12">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-7 h-7 text-[#5B21B6]" />
            Reports &amp; Operational Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Real-time intelligence on compliance health, operational service packages, and fee collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handlePrint}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200/90 text-slate-700 rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print / PDF
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV ({filteredServices.length})
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'overview'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <PieChart className="w-4 h-4" />
          Executive Overview
        </button>

        <button 
          onClick={() => setActiveTab('revenue')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'revenue'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <DollarSign className="w-4 h-4" />
          Revenue &amp; Category Fees
        </button>

        <button 
          onClick={() => setActiveTab('compliance')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'compliance'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Compliance Radar &amp; Expiries ({expiringItems.length})
        </button>

        <button 
          onClick={() => setActiveTab('services')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'services'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Layers className="w-4 h-4" />
          All Operational Services ({servicesList.length})
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Compliance Health Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compliance Health</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              {stats.complianceScore}%
              <span className="text-[11px] font-bold text-emerald-600">On Track</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Valid licenses &amp; identity docs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Agreed Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Agreed Pipeline</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              AED {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Collected: <span className="font-bold text-emerald-600">AED {stats.collectedRevenue.toLocaleString()}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Active Packages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operational Packages</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalServices}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {stats.completedServices} Completed • {stats.inProgressServices} Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Expiries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expiries in &lt; 30 Days</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {stats.criticalExpiriesCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Requires immediate renewal action
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ================= VIEW: OVERVIEW ================= */}
      {(activeTab === 'overview' || activeTab === 'revenue') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 5 Categories Revenue Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#5B21B6]" />
                  5 Core Service Categories Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Package volume and agreed fee distributions</p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Total: AED {stats.totalRevenue.toLocaleString()}
              </span>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map(cat => (
                <div key={cat.category} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{cat.category}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                        {cat.count} {cat.count === 1 ? 'Package' : 'Packages'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">AED {cat.revenue.toLocaleString()}</span>
                      <span className="text-slate-400 ml-1.5 font-medium">({cat.percentage}%)</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5B21B6] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cat.percentage, cat.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Status Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Service Workflow Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Status breakdown across all live workflows</p>
            </div>

            <div className="space-y-3">
              {statusBreakdown.map(st => (
                <div key={st.status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      st.status === 'Completed' ? "bg-emerald-500" :
                      st.status === 'In progress' ? "bg-blue-500" :
                      st.status === 'Submitted' ? "bg-amber-500" : "bg-slate-400"
                    )} />
                    <span className="font-bold text-slate-800">{st.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{st.count}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">({st.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Payment Realization</div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900">Collection Rate</span>
                <span className="font-black text-emerald-700">
                  {stats.totalRevenue > 0 ? Math.round((stats.collectedRevenue / stats.totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW: COMPLIANCE RADAR ================= */}
      {(activeTab === 'overview' || activeTab === 'compliance') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-rose-600" />
                Critical &amp; Upcoming Expiries ({expiringItems.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Licenses, Visas, Emirates IDs, and Mulkiyas requiring renewal action</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Auto-synced from Identity &amp; Fleet modules
            </span>
          </div>

          {expiringItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">All compliance documents are in good standing!</p>
              <p className="text-slate-400 mt-0.5">No critical expiries detected within the upcoming window.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Document / Entity</th>
                    <th className="py-3 px-5">Category / Type</th>
                    <th className="py-3 px-5">Holder / Company</th>
                    <th className="py-3 px-5">Expiry Date</th>
                    <th className="py-3 px-5">Status / Urgency</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expiringItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-500">
                        {item.type}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {item.holder}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {item.expiryDate}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                          item.status === 'expired' ? "bg-red-50 text-red-700 border-red-200" :
                          item.status === 'critical' ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {item.daysLeft < 0 ? `Expired (${Math.abs(item.daysLeft)}d ago)` : `${item.daysLeft} days remaining`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link 
                          href={item.clientLink} 
                          className="inline-flex items-center text-xs font-bold text-[#5B21B6] hover:underline"
                        >
                          View Client <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW: ALL SERVICES TABLE ================= */}
      {(activeTab === 'overview' || activeTab === 'services') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5B21B6]" />
                All Operational Service Packages
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Detailed table of all assigned client packages and agreed fees</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service, client..." 
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#5B21B6] w-48"
                />
              </div>

              <select 
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Business Setup">Business Setup</option>
                <option value="Visa & Immigration">Visa &amp; Immigration</option>
                <option value="Tax & Accounting">Tax &amp; Accounting</option>
                <option value="PRO Services">PRO Services</option>
                <option value="Legal & Advisory">Legal &amp; Advisory</option>
              </select>

              <select 
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="In progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Submitted">Submitted</option>
                <option value="Not started">Not Started</option>
              </select>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching service packages found</p>
              <p className="text-slate-400 mt-0.5">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Package / Service</th>
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Client / Company</th>
                    <th className="py-3 px-5">Agreed Price</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Payment</th>
                    <th className="py-3 px-5">Target Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredServices.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5B21B6] border border-purple-100 font-bold text-[11px]">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800">{s.clientName}</div>
                        {s.companyName && <div className="text-[11px] text-slate-400">{s.companyName}</div>}
                      </td>
                      <td className="py-3.5 px-5 font-black text-slate-900">
                        {s.price ? `AED ${s.price.toLocaleString()}` : <span className="text-slate-300 font-normal">--</span>}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[11px] font-bold border",
                          s.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          s.status === 'In progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                          s.status === 'Submitted' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[11px] font-bold",
                          s.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-800" :
                          s.paymentStatus === 'Partial' ? "bg-amber-100 text-amber-800" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        )}>
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-500">
                        {s.targetCompletion || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
