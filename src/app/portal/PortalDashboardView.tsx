'use client'

import React from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  FileText,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2,
  Upload,
  MessageSquarePlus,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { usePortal } from '@/components/portal/PortalContext'

interface DashboardStats {
  activeApplications: number
  pendingDocuments: number
  upcomingRenewals: number
  completedServices: number
}

interface ApplicationItem {
  id: string
  applicationNumber: string
  title: string
  serviceCategory: string
  serviceType: string
  status: string
  priority: string
  companyName: string
  submittedAt: string
  expectedCompletion: string | null
  documentsCount: number
}

interface DocumentItem {
  id: string
  title: string
  documentType: string
  fileUrl: string
  verificationStatus: string
  uploadedBy: string | null
  companyName: string | null
  expiryDate: string | null
  createdAt: string
}

interface RenewalItem {
  id: string
  title: string
  type: string
  companyName: string
  expiryDate: string | null
  daysRemaining: number
  status: 'Valid' | 'Due Soon' | 'Expired'
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  relatedEntityType: string | null
  relatedEntityId: string | null
  isRead: boolean
  createdAt: string
}

export default function PortalDashboardView({
  stats,
  recentApplications,
  recentDocuments,
  upcomingRenewals,
  recentNotifications,
}: {
  stats: DashboardStats
  recentApplications: ApplicationItem[]
  recentDocuments: DocumentItem[]
  upcomingRenewals: RenewalItem[]
  recentNotifications: NotificationItem[]
}) {
  const { client, activeCompany } = usePortal()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">Completed</span>
      case 'In Progress':
      case 'Submitted to Authority':
        return <span className="bg-purple-50 text-[#5B21B6] border border-purple-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">In Progress</span>
      case 'Under Review':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">Under Review</span>
      case 'Documents Required':
      case 'Awaiting Client':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">Action Required</span>
      case 'Rejected':
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 border border-red-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{status}</span>
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{status}</span>
    }
  }

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Verified</span>
      case 'Pending':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Pending Review</span>
      case 'Replacement Required':
      case 'Rejected':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Resubmit Needed</span>
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#7C3AED] rounded-2xl p-6 text-white shadow-lg shadow-purple-900/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                Client Portal
              </span>
              {activeCompany && (
                <span className="bg-purple-900/40 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {activeCompany.legalName}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome, {client.fullName}
            </h1>
            <p className="text-xs text-purple-100/90 mt-1 max-w-xl font-medium">
              Manage your company registrations, visa processing, tax filings, and document renewals with real-time updates.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/portal/applications/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#5B21B6] text-xs font-bold hover:bg-purple-50 transition-all shadow-md shadow-purple-950/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Start Application</span>
            </Link>
            <Link
              href="/portal/documents"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all backdrop-blur-xs border border-white/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Applications</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.activeApplications}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">In progress & review</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Documents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.pendingDocuments}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Requires your attention</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Renewals</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.upcomingRenewals}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Due within 30 days</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Services</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.completedServices}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Successfully processed</p>
        </div>
      </div>

      {/* Main Grid: Renewals Radar (Main Left) & Recent Applications (Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Renewals & Compliance Radar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#5B21B6]" />
                  Renewals &amp; Compliance Radar
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Active monitoring of licenses, establishment cards, vehicle mulkiyas, and visas
                </p>
              </div>
              <Link
                href="/portal/renewals"
                className="text-xs font-bold text-[#5B21B6] hover:text-[#4C1D95] flex items-center gap-1"
              >
                <span>View all ({upcomingRenewals.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingRenewals.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">All Licenses &amp; Visas Active</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  No immediate expiries requiring renewal.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingRenewals.slice(0, 6).map((r) => (
                  <div
                    key={r.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {r.title}
                        </span>
                        <span
                          className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                            r.status === 'Expired'
                              ? 'bg-red-100 text-red-700'
                              : r.status === 'Due Soon'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {r.daysRemaining < 0 ? 'EXPIRED' : `${r.daysRemaining} DAYS LEFT`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {r.companyName} • Type: {r.type} • Expiry:{' '}
                        {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href="/portal/renewals"
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#5B21B6] text-xs font-bold transition-all border border-purple-200/60 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Request Renewal</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Documents Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Recent Documents</h2>
                <p className="text-[11px] text-slate-400 font-medium">Your verified company &amp; identity documents</p>
              </div>
              <Link
                href="/portal/documents"
                className="text-xs font-bold text-[#5B21B6] hover:text-[#4C1D95] flex items-center gap-1"
              >
                <span>All documents</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDocuments.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {doc.documentType} {doc.expiryDate && `• Exp: ${new Date(doc.expiryDate).toLocaleDateString('en-GB')}`}
                        </p>
                      </div>
                    </div>
                    <div>{getDocStatusBadge(doc.verificationStatus)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Service Applications & Quick Support */}
        <div className="space-y-4">
          {/* Recent Service Applications (Sidebar Widget) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Service Applications</h2>
                <p className="text-[11px] text-slate-400 font-medium">Active &amp; past service requests</p>
              </div>
              <Link
                href="/portal/applications"
                className="text-xs font-bold text-[#5B21B6] hover:text-[#4C1D95] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5B21B6] flex items-center justify-center mx-auto mb-2">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">No Applications Yet</h3>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Start a new visa, license setup, or tax service.
                </p>
                <Link
                  href="/portal/applications/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Start New</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.slice(0, 4).map((app) => (
                  <Link
                    key={app.id}
                    href={`/portal/applications/${app.id}`}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group block"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9.5px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                          {app.applicationNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#5B21B6] transition-colors">
                          {app.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {app.companyName} • {app.serviceCategory}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(app.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Support Ticket Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl p-5 border border-purple-100/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-[#5B21B6]">
              <MessageSquarePlus className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider">Need Priority Support?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              Have questions about your applications, renewals, or need customized legal documents? Contact your Operio advisor anytime.
            </p>
            <Link
              href="/portal/requests"
              className="block w-full text-center py-2 px-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Raise Support Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
