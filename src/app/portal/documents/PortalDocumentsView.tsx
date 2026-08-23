'use client'

import React, { useState } from 'react'
import {
  FileText,
  Search,
  Upload,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react'
import { uploadPortalDocumentAction } from './actions'

export default function PortalDocumentsView({
  documents,
  companies,
}: {
  documents: any[]
  companies: any[]
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Upload Form State
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('Passport')
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [uploading, setUploading] = useState(false)

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (typeFilter !== 'ALL' && doc.documentType !== typeFilter) return false
    return true
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle.trim() || uploading) return

    setUploading(true)
    const res = await uploadPortalDocumentAction({
      title: docTitle.trim(),
      documentType: docType,
      companyId: companyId || undefined,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      fileUrl: `/uploads/${encodeURIComponent(docTitle)}.pdf`,
    })

    if (res.success) {
      setShowUploadModal(false)
      window.location.reload()
    }
    setUploading(false)
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
      case 'Pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>
      case 'Replacement Required':
      case 'Rejected':
        return <span className="bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Action Needed</span>
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Documents</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified corporate, trade licence, visa, and passport records.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {['ALL', 'Passport', 'Visa', 'Licence', 'Contract', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                typeFilter === type
                  ? 'bg-[#5B21B6] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-400 mt-1">Upload a document to keep it safely archived.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-purple-200 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  {getVerificationBadge(doc.verificationStatus)}
                </div>

                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {doc.companyName} • {doc.documentType}
                </p>

                {doc.rejectionReason && (
                  <p className="text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-lg mt-2">
                    Correction needed: {doc.rejectionReason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-medium">
                  {doc.expiryDate ? `Exp: ${new Date(doc.expiryDate).toLocaleDateString('en-GB')}` : 'No Expiry'}
                </span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowUploadModal(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-900">Upload New Document</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Tenancy Contract 2026"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                >
                  <option value="Passport">Passport Copy</option>
                  <option value="Visa">Visa Copy</option>
                  <option value="Emirates ID">Emirates ID</option>
                  <option value="Licence">Trade Licence</option>
                  <option value="Contract">Contract / Agreement</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              {companies.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Associated Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                  >
                    <option value="">Personal / No Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.legalName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
