'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { createSupportRequestAction } from './actions'

export default function PortalRequestsView({
  requests,
  companies,
}: {
  requests: any[]
  companies: any[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState('Application Support')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || loading) return

    setLoading(true)
    const res = await createSupportRequestAction({
      category,
      subject: subject.trim(),
      message: message.trim(),
      priority,
      companyId: companyId || undefined,
    })

    if (res.success) {
      setShowModal(false)
      window.location.reload()
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Resolved</span>
      case 'In Progress':
        return <span className="bg-purple-50 text-[#5B21B6] border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">In Progress</span>
      case 'Waiting for Client':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Action Needed</span>
      default:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Open</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Requests & Support</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Direct communication channel with your dedicated Operio account managers and PRO specialists.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Raise New Request</span>
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Support Tickets</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Need assistance with a visa, license, or accounting issue? Raise a ticket anytime.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B21B6] text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open First Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/portal/requests/${req.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all block"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#5B21B6] bg-purple-50 px-2.5 py-0.5 rounded-lg">
                      {req.requestNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {req.category}
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 truncate">{req.subject}</h2>
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-1">
                    <span className="font-bold text-slate-700">{req.lastSender}: </span>
                    {req.lastMessage}
                  </p>

                  <p className="text-[10px] text-slate-400 font-semibold">
                    {req.companyName} • Created {new Date(req.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
                  {getStatusBadge(req.status)}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-900">Raise Support Request</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  >
                    <option value="Application Support">Application Support</option>
                    <option value="Document Update">Document Update</option>
                    <option value="Renewal">Renewal Inquiry</option>
                    <option value="Account Support">Account & Billing</option>
                    <option value="General Query">General Query</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {companies.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Associated Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  >
                    <option value="">Personal / Individual</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.legalName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Message / Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your question or issue in detail..."
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
