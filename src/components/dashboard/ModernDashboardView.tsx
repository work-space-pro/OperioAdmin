'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter as FilterIcon, 
  Calendar as CalendarIcon,
  Plus, 
  CheckCircle2, 
  Square,
  Building2,
  Users,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  FileText,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import CreateActionModal from './CreateActionModal'
import RenewalDetailModal from '@/components/renewals/RenewalDetailModal'
import { toggleClientActionStatus } from '@/app/(dashboard)/clients/actions'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'

interface DashboardProps {
  kpis: any
  renewals: any[]
  renewalsStats: {
    total: number
    expired: number
    dueSoon: number
    valid: number
  }
  companies: any[]
  actions: any[]
  clients: any[]
  recentActivity: any[]
}

function getEndOfMonth(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  if (isNaN(year) || isNaN(month)) return dateStr
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

export default function ModernDashboardView({
  kpis,
  renewals,
  renewalsStats,
  companies,
  actions,
  clients,
  recentActivity
}: DashboardProps) {
  // Collapsible section states
  const [isOverviewOpen, setIsOverviewOpen] = useState(true)
  const [isRenewalsOpen, setIsRenewalsOpen] = useState(true)

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'All' | 'Clients' | 'Companies' | 'Renewals' | 'High Priority'>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All Services')
  const [fromDate, setFromDate] = useState(() => getCurrentMonthRange().from)
  const [toDate, setToDate] = useState(() => getCurrentMonthRange().to)
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false)
  
  // Table pagination state
  const [companyPage, setCompanyPage] = useState(1)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionList, setActionList] = useState(actions || [])

  // Renewal Modal state
  const [renewalList, setRenewalList] = useState(renewals || [])
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false)

  const handleToggleAction = async (actionId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    setActionList(prev => prev.map(a => a.id === actionId ? { ...a, status: nextStatus } : a))
    await toggleClientActionStatus(actionId, currentStatus)
  }

  const handleRenewalUpdated = (updatedItem: any) => {
    const now = new Date()
    const days = (new Date(updatedItem.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    const refreshed = {
      ...updatedItem,
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    }
    setRenewalList(prev => prev.map(r => r.id === refreshed.id ? refreshed : r))
    setSelectedRenewal(refreshed)
  }

  const handleApplyFilter = () => {
    setIsDateFilterApplied(true)
  }

  const handleResetFilter = () => {
    setIsDateFilterApplied(false)
    const current = getCurrentMonthRange()
    setFromDate(current.from)
    setToDate(current.to)
    setCategoryFilter('All Services')
    setActiveFilter('All')
  }

  // Filtered renewals
  const filteredRenewals = renewalList.filter(item => {
    // 1. Category Filter
    if (categoryFilter !== 'All Services') {
      if (categoryFilter === 'Company Setup' && item.category !== 'Trade Licence' && item.category !== 'Establishment Card') return false
      if (categoryFilter === 'Tax & VAT' && !item.category.includes('VAT') && !item.category.includes('Tax')) return false
      if (categoryFilter === 'Visa & PRO' && !item.category.includes('Visa') && !item.category.includes('Emirates ID') && !item.category.includes('Passport')) return false
      if (categoryFilter === 'Insurance' && !item.category.includes('Insurance')) return false
      if (categoryFilter === 'Fleet & Transport' && !item.category.includes('Vehicle') && !item.category.includes('Driving')) return false
    }

    // 2. Filter Pills
    if (activeFilter === 'High Priority' && !item.isExpired && (!item.isExpiringSoon || item.daysUntil > 30)) return false

    // 3. Date Range Filter
    if (isDateFilterApplied && item.expiryDate) {
      const exp = new Date(item.expiryDate).getTime()
      if (fromDate) {
        const fromTime = new Date(`${fromDate}T00:00:00`).getTime()
        if (exp < fromTime) return false
      }
      if (toDate) {
        const toTime = new Date(`${toDate}T23:59:59`).getTime()
        if (exp > toTime) return false
      }
    }

    return true
  })

  // Dynamic Computed Stats
  const liveStats = {
    total: filteredRenewals.length,
    expired: filteredRenewals.filter(r => r.isExpired).length,
    dueSoon: filteredRenewals.filter(r => r.isExpiringSoon && !r.isExpired).length,
    valid: filteredRenewals.filter(r => !r.isExpired && !r.isExpiringSoon).length,
  }

  // Filtered actions
  const filteredActions = actionList.filter(act => {
    if (activeFilter === 'High Priority' && act.priority !== 'High') return false
    if (activeFilter === 'Renewals' && act.actionType !== 'Document Renewal' && act.actionType !== 'Tax Filing') return false
    
    if (isDateFilterApplied && act.dueDate) {
      const due = new Date(act.dueDate).getTime()
      if (fromDate) {
        const fromTime = new Date(`${fromDate}T00:00:00`).getTime()
        if (due < fromTime) return false
      }
      if (toDate) {
        const toTime = new Date(`${toDate}T23:59:59`).getTime()
        if (due > toTime) return false
      }
    }
    return true
  })

  // Filtered companies based on filter pills or category
  const filteredCompanies = companies.filter(c => {
    if (categoryFilter !== 'All Services') {
      // Keep all companies or filter
    }
    return true
  })

  // Pagination for companies table
  const companiesPerPage = 5
  const totalCompanyPages = Math.ceil(filteredCompanies.length / companiesPerPage) || 1
  const displayedCompanies = filteredCompanies.slice((companyPage - 1) * companiesPerPage, companyPage * companiesPerPage)

  return (
    <div className="w-full space-y-4 animate-fade-in font-sans">
      
      {/* 1. TOP HEADER & FILTER ROW */}
      <div className="space-y-3.5">
        
        {/* Title & Product Type Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Dashboard</h1>
            <span className="text-xs font-semibold text-slate-400">
              {isDateFilterApplied ? `(${fromDate} to ${toDate})` : '( Today )'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mode selection */}
            <div className="flex items-center space-x-2 text-xs font-bold text-[#5B21B6]">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#5B21B6] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B21B6]"></span>
              </span>
              <span>Operations &amp; Consultancy</span>
            </div>

            {/* Product/Service Dropdown */}
            <div className="flex items-center space-x-1.5 text-xs bg-white border border-[#E6DFEE] rounded-xl px-3 py-1.5 text-slate-700 font-bold shadow-xs">
              <span className="text-slate-400 font-medium">Category:</span>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Services">All Services</option>
                <option value="Company Setup">Company Setup</option>
                <option value="Tax & VAT">Tax &amp; VAT</option>
                <option value="Visa & PRO">Visa &amp; PRO</option>
                <option value="Insurance">Insurance</option>
                <option value="Fleet & Transport">Fleet &amp; Transport</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAE5F2] shadow-xs">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Clients', 'Companies', 'Renewals', 'High Priority'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "filter-pill cursor-pointer",
                  activeFilter === filter ? "filter-pill-active" : "filter-pill-inactive"
                )}
              >
                {filter}
              </button>
            ))}

            {(isDateFilterApplied || categoryFilter !== 'All Services' || activeFilter !== 'All') && (
              <button
                onClick={handleResetFilter}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                ✕ Reset Filters
              </button>
            )}
          </div>

          {/* Date Pickers & Filter Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400 font-bold">From</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => {
                  const newFrom = e.target.value
                  setFromDate(newFrom)
                  if (newFrom) {
                    const autoTo = getEndOfMonth(newFrom)
                    setToDate(autoTo)
                  }
                  setIsDateFilterApplied(true)
                }}
                className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400 font-bold">To</span>
              <input 
                type="date" 
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setIsDateFilterApplied(true)
                }}
                className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <button 
              onClick={handleApplyFilter}
              className={cn(
                "px-4 py-1.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer",
                isDateFilterApplied ? "bg-[#3B1578] ring-2 ring-[#DDD6FE]" : "bg-[#4C1D95] hover:bg-[#5B21B6]"
              )}
            >
              Filter
            </button>

            <button 
              onClick={() => setIsActionModalOpen(true)}
              className="p-1.5 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#5B21B6] rounded-xl transition-all cursor-pointer"
              title="Add New Action / Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. SECTION 1: PERFORMANCE & OVERVIEW KPI DASHBOARD */}
      <div className="section-tint p-4 sm:p-5 transition-all">
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-3.5"
          onClick={() => setIsOverviewOpen(!isOverviewOpen)}
        >
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Executive Performance &amp; Operations Hub</h2>
          </div>
          <button className="text-slate-500 hover:text-slate-800 p-1 rounded-lg">
            {isOverviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isOverviewOpen && (
          <div className="space-y-3.5 animate-fade-in">
            
            {/* 1ST ROW: COMPLIANCE & RENEWALS EXECUTIVE METRICS (REQUESTED BY USER) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Card 1: Total Renewals Tracked */}
              <Link href="/renewals" className="dash-card p-4 flex justify-between items-center group hover:border-[#DDD6FE]">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total Renewals Tracked</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{liveStats.total}</p>
                  <span className="text-[10px] font-bold text-[#5B21B6] group-hover:underline mt-0.5 inline-block">
                    Licences, Visas &amp; Fleet &rarr;
                  </span>
                </div>
                <div className="kpi-purple-badge">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </Link>

              {/* Card 2: Total Expired */}
              <Link href="/renewals" className="dash-card p-4 flex justify-between items-center border-l-4 border-l-red-500 group hover:border-[#DDD6FE]">
                <div>
                  <p className="text-xs font-semibold text-red-600 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Total Expired
                  </p>
                  <p className="text-2xl font-black text-red-600 mt-1">{liveStats.expired}</p>
                  <span className="text-[10px] font-bold text-red-700 group-hover:underline mt-0.5 inline-block">
                    Action Required &rarr;
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </Link>

              {/* Card 3: Total Due Soon */}
              <Link href="/renewals" className="dash-card p-4 flex justify-between items-center border-l-4 border-l-orange-500 group hover:border-[#DDD6FE]">
                <div>
                  <p className="text-xs font-semibold text-orange-600 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Total Due Soon (30-60d)
                  </p>
                  <p className="text-2xl font-black text-orange-600 mt-1">{liveStats.dueSoon}</p>
                  <span className="text-[10px] font-bold text-orange-700 group-hover:underline mt-0.5 inline-block">
                    Due for Renewal &rarr;
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </Link>

              {/* Card 4: Total Valid & Active */}
              <Link href="/renewals" className="dash-card p-4 flex justify-between items-center border-l-4 border-l-emerald-500 group hover:border-[#DDD6FE]">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Valid &amp; Compliant
                  </p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{liveStats.valid}</p>
                  <span className="text-[10px] font-bold text-emerald-800 group-hover:underline mt-0.5 inline-block">
                    Compliant Records &rarr;
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </Link>

            </div>

            {/* 2ND ROW: CLIENTS & OPERATIONS METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Total Clients */}
              <Link href="/clients" className="dash-card p-4 flex justify-between items-center group">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total Clients</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{kpis.totalClients || 0}</p>
                </div>
                <div className="kpi-purple-badge">
                  <Users className="w-4 h-4" />
                </div>
              </Link>

              {/* Active Companies */}
              <Link href="/companies" className="dash-card p-4 flex justify-between items-center group">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Active Companies</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{kpis.activeCompanies || 0}</p>
                </div>
                <div className="kpi-purple-badge">
                  <Building2 className="w-4 h-4" />
                </div>
              </Link>

              {/* Finance - P&L */}
              <Link href="/finance" className="dash-card p-4 flex justify-between items-center group">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Finance &amp; P&amp;L</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{kpis.activeServices || 0} <span className="text-xs font-normal text-slate-400">Packages</span></p>
                </div>
                <div className="kpi-purple-badge">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </Link>

              {/* Pending Actions */}
              <Link href="/actions" className="dash-card p-4 flex justify-between items-center group">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Pending Actions &amp; Tasks</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{kpis.pendingActions || 0}</p>
                </div>
                <div className="kpi-purple-badge">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </Link>

            </div>

          </div>
        )}
      </div>

      {/* 3. SECTION 2: RENEWAL & COMPLIANCE BREAKDOWN */}
      <div className="section-tint p-4 sm:p-5 transition-all">
        <div 
          className="flex justify-between items-center cursor-pointer select-none mb-3.5"
          onClick={() => setIsRenewalsOpen(!isRenewalsOpen)}
        >
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Category Breakdown</h2>
          <button className="text-slate-500 hover:text-slate-800 p-1 rounded-lg">
            {isRenewalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isRenewalsOpen && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              
              {/* VAT Due */}
              <div 
                onClick={() => setCategoryFilter(categoryFilter === 'Tax & VAT' ? 'All Services' : 'Tax & VAT')}
                className={cn(
                  "dash-card p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:border-[#DDD6FE]",
                  categoryFilter === 'Tax & VAT' ? "ring-2 ring-[#5B21B6] bg-purple-50/40" : ""
                )}
              >
                <span className="text-[11px] font-bold text-slate-500">VAT Due</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {filteredRenewals.filter(r => r.category.includes('VAT')).length}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-md",
                    filteredRenewals.filter(r => r.category.includes('VAT') && r.isExpiringSoon).length > 0 
                      ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {filteredRenewals.filter(r => r.category.includes('VAT') && r.isExpiringSoon).length > 0 ? 'Action Req' : 'Clear'}
                  </span>
                </div>
              </div>

              {/* Corporate Tax Due */}
              <div 
                onClick={() => setCategoryFilter(categoryFilter === 'Tax & VAT' ? 'All Services' : 'Tax & VAT')}
                className={cn(
                  "dash-card p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:border-[#DDD6FE]",
                  categoryFilter === 'Tax & VAT' ? "ring-2 ring-[#5B21B6] bg-purple-50/40" : ""
                )}
              >
                <span className="text-[11px] font-bold text-slate-500">Corporate Tax</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {filteredRenewals.filter(r => r.category.includes('Tax')).length}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700">
                    Tracked
                  </span>
                </div>
              </div>

              {/* Visa Renewals */}
              <div 
                onClick={() => setCategoryFilter(categoryFilter === 'Visa & PRO' ? 'All Services' : 'Visa & PRO')}
                className={cn(
                  "dash-card p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:border-[#DDD6FE]",
                  categoryFilter === 'Visa & PRO' ? "ring-2 ring-[#5B21B6] bg-purple-50/40" : ""
                )}
              >
                <span className="text-[11px] font-bold text-slate-500">Visa / EID / Passport</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {filteredRenewals.filter(r => r.category.includes('Visa') || r.category.includes('Emirates ID') || r.category.includes('Passport')).length}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700">
                    {filteredRenewals.filter(r => (r.category.includes('Visa') || r.category.includes('Emirates ID')) && r.isExpiringSoon).length} Due
                  </span>
                </div>
              </div>

              {/* Insurance Renewals */}
              <div 
                onClick={() => setCategoryFilter(categoryFilter === 'Insurance' ? 'All Services' : 'Insurance')}
                className={cn(
                  "dash-card p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:border-[#DDD6FE]",
                  categoryFilter === 'Insurance' ? "ring-2 ring-[#5B21B6] bg-purple-50/40" : ""
                )}
              >
                <span className="text-[11px] font-bold text-slate-500">Insurance &amp; Fleet</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {filteredRenewals.filter(r => r.category.includes('Insurance') || r.category.includes('Vehicle')).length}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700">
                    Fleet/Health
                  </span>
                </div>
              </div>

              {/* Trade Licenses */}
              <div 
                onClick={() => setCategoryFilter(categoryFilter === 'Company Setup' ? 'All Services' : 'Company Setup')}
                className={cn(
                  "dash-card p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1 cursor-pointer transition-all hover:border-[#DDD6FE]",
                  categoryFilter === 'Company Setup' ? "ring-2 ring-[#5B21B6] bg-purple-50/40" : ""
                )}
              >
                <span className="text-[11px] font-bold text-slate-500">Trade Licences &amp; Est</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-slate-900">
                    {filteredRenewals.filter(r => r.category.includes('Trade Licence') || r.category.includes('Establishment Card')).length}
                  </span>
                  <Link href="/renewals" className="text-[10px] font-bold text-[#5B21B6] hover:underline">
                    View All &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Quick Renewal Items in Filter Range */}
            {isDateFilterApplied && (
              <div className="bg-white border border-[#EAE5F2] rounded-xl overflow-hidden shadow-xs mt-3">
                <div className="px-4 py-2.5 bg-[#FAF9FC] border-b border-[#EAE5F2] flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-[#5B21B6]" />
                    Renewals in Selected Period ({fromDate} to {toDate}): <strong className="ml-1 text-[#5B21B6]">{filteredRenewals.length} Items</strong>
                  </span>
                  <Link href="/renewals" className="text-[11px] font-bold text-[#5B21B6] hover:underline">
                    Open Renewals Hub &rarr;
                  </Link>
                </div>

                {filteredRenewals.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No compliance documents or renewals expiring between {fromDate} and {toDate}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {filteredRenewals.map((item) => (
                      <div key={item.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EDE9FE] text-[#5B21B6]">
                            {item.category}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{item.entityName} · {item.clientName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 ml-3">
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{formatDate(item.expiryDate)}</p>
                            <p className={cn(
                              "text-[10px] font-bold",
                              item.isExpired ? "text-red-600" :
                              item.isExpiringSoon ? "text-orange-600" : "text-emerald-600"
                            )}>
                              {item.isExpired ? `${Math.abs(item.daysUntil)}d overdue` : `${item.daysUntil}d remaining`}
                            </p>
                          </div>

                          <button 
                            onClick={() => {
                              setSelectedRenewal(item)
                              setIsRenewalModalOpen(true)
                            }}
                            className="px-2.5 py-1 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. SECTION 3: OPERATIONS & BREAKDOWN TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Table: Company Wise Status */}
        <div className="lg:col-span-7 dash-panel overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-[#EAE5F2] flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center">
                <Building2 className="w-3.5 h-3.5 text-[#5B21B6] mr-2" />
                Company Overview &amp; Status
              </h3>
              <Link href="/companies" className="text-[11px] font-bold text-[#5B21B6] hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="table-header-tint border-b border-[#EAE5F2]">
                  <tr>
                    <th className="px-5 py-3">Company Name</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Trade License</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400 font-medium">
                        No company records found.
                      </td>
                    </tr>
                  ) : (
                    displayedCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF9FC] transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-900">
                          <Link href={`/companies/${c.id}`} className="hover:text-[#5B21B6]">
                            {c.legalName}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-medium">
                          {c.client?.fullName || '—'}
                        </td>
                        <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                          {c.tradeLicenceNumber || 'Pending'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                            c.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-slate-50 text-slate-700 border-slate-200"
                          )}>
                            {c.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination */}
          <div className="px-5 py-3 border-t border-[#EAE5F2] flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
            <span className="text-[11px] font-medium">
              Rows per page: <span className="font-bold text-slate-800">5</span>
            </span>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => setCompanyPage(p => Math.max(p - 1, 1))}
                disabled={companyPage <= 1}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="w-6 h-6 rounded-full bg-[#4C1D95] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {companyPage}
              </span>

              <button 
                onClick={() => setCompanyPage(p => Math.min(p + 1, totalCompanyPages))}
                disabled={companyPage >= totalCompanyPages}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Table: Upcoming Actions & Tasks */}
        <div className="lg:col-span-5 dash-panel overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-[#EAE5F2] flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center">
                <CheckSquare className="w-3.5 h-3.5 text-[#5B21B6] mr-2" />
                Upcoming Actions
              </h3>
              <button 
                onClick={() => setIsActionModalOpen(true)}
                className="text-[11px] font-bold text-[#5B21B6] hover:underline flex items-center"
              >
                <Plus className="w-3 h-3 mr-0.5" />
                Add Action
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredActions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No upcoming actions for this filter.
                </div>
              ) : (
                filteredActions.slice(0, 5).map((act) => {
                  const isCompleted = act.status === 'Completed'
                  return (
                    <div key={act.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#FAF9FC] transition-colors">
                      <div className="flex items-center space-x-3 min-w-0">
                        <button 
                          onClick={() => handleToggleAction(act.id, act.status)}
                          className="text-slate-400 hover:text-[#5B21B6] transition-colors shrink-0 cursor-pointer"
                          title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        
                        <div className="min-w-0">
                          <p className={cn(
                            "text-xs font-bold leading-tight truncate",
                            isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                          )}>
                            {act.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                            {act.clientName || 'General Task'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-3">
                        <span className={cn(
                          "px-1.5 py-0.2 text-[9px] font-bold rounded-md border",
                          act.priority === 'High' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          act.priority === 'Low' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-purple-50 text-purple-700 border-purple-200"
                        )}>
                          {act.priority || 'Normal'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-[#EAE5F2] bg-slate-50/50 text-center">
            <Link href="/actions" className="text-xs font-bold text-[#5B21B6] hover:underline">
              View All Tasks &amp; Follow-ups &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* Action Modal */}
      <CreateActionModal 
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        clients={clients}
      />

      {/* Renewal Detail Modal */}
      <RenewalDetailModal 
        item={selectedRenewal}
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        onUpdated={handleRenewalUpdated}
      />

    </div>
  )
}
