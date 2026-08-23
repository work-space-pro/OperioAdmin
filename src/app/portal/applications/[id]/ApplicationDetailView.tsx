'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  Send,
  MessageSquare,
  AlertCircle,
  Download,
  ShieldCheck,
  User,
} from 'lucide-react'
import { sendApplicationMessageAction, uploadApplicationDocumentAction } from './actions'

const TIMELINE_STEPS = [
  { id: 'Submitted', label: 'Submitted', desc: 'Request received' },
  { id: 'Under Review', label: 'Under Review', desc: 'Initial verification' },
  { id: 'In Progress', label: 'Processing', desc: 'Govt / Authority filing' },
  { id: 'Approved', label: 'Approved', desc: 'Authority approval' },
  { id: 'Completed', label: 'Completed', desc: 'Final deliverables ready' },
]

export default function ApplicationDetailView({ application }: { application: any }) {
  const [messages, setMessages] = useState(application.messages)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Document upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('Passport')
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const getStepStatus = (stepId: string, currentStatus: string) => {
    const statusOrder = ['Submitted', 'Under Review', 'In Progress', 'Approved', 'Completed']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const stepIndex = statusOrder.indexOf(stepId)

    if (currentStatus === 'Rejected' || currentStatus === 'Cancelled') {
      return stepId === 'Submitted' ? 'completed' : 'pending'
    }

    if (stepIndex <= currentIndex) return 'completed'
    if (stepIndex === currentIndex + 1) return 'current'
    return 'pending'
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    const res = await sendApplicationMessageAction(application.id, newMessage)
    if (res.success) {
      setMessages([
        ...messages,
        {
          id: String(Date.now()),
          senderType: 'CLIENT',
          senderName: 'You',
          message: newMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ])
      setNewMessage('')
    }
    setSendingMessage(false)
  }

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle.trim() || uploadingDoc) return

    setUploadingDoc(true)
    const res = await uploadApplicationDocumentAction(
      application.id,
      docTitle.trim(),
      docType,
      `/uploads/${encodeURIComponent(docTitle)}.pdf`
    )

    if (res.success) {
      setShowUploadModal(false)
      setDocTitle('')
      window.location.reload()
    }
    setUploadingDoc(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/portal/applications"
            className="text-xs font-bold text-slate-500 hover:text-[#5B21B6] inline-flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all applications</span>
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-black text-[#5B21B6] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
              {application.applicationNumber}
            </span>
            <h1 className="text-xl font-black text-slate-900">{application.title}</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {application.companyName} • {application.serviceCategory} • Submitted on{' '}
            {new Date(application.submittedAt).toLocaleDateString('en-GB')}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Visual Status Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-5">
          Application Progress Timeline
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TIMELINE_STEPS.map((s, idx) => {
            const stepState = getStepStatus(s.id, application.status)
            return (
              <div
                key={s.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  stepState === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                    : stepState === 'current'
                    ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6] ring-1 ring-[#5B21B6]'
                    : 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-70'
                }`}
              >
                <div className="w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-black">
                  {stepState === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        stepState === 'current'
                          ? 'bg-[#5B21B6] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[10px] mt-0.5 font-medium opacity-80">{s.desc}</p>
              </div>
            )
          })}
        </div>

        {application.clientNotes && (
          <div className="mt-4 p-3 bg-purple-50/80 rounded-xl border border-purple-100 text-xs text-purple-900 font-medium">
            <span className="font-bold">Team Note: </span>
            {application.clientNotes}
          </div>
        )}
      </div>

      {/* Main Grid: Details & Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Application Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Service Package</span>
                <span className="font-bold text-slate-900">{application.serviceType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Entity</span>
                <span className="font-bold text-slate-900">{application.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Contact Person</span>
                <span className="font-bold text-slate-900">
                  {application.contactPerson} ({application.contactNumber || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Expected Completion</span>
                <span className="font-bold text-slate-900">
                  {application.expectedCompletion
                    ? new Date(application.expectedCompletion).toLocaleDateString('en-GB')
                    : 'Processing by authority'}
                </span>
              </div>

              {application.description && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                  <span className="text-slate-400 font-semibold block text-[11px]">Requirement Notes</span>
                  <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                    {application.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Application Documents ({application.documents.length})
              </h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-bold text-[#5B21B6] hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>+ Upload document</span>
              </button>
            </div>

            {application.documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center font-medium">
                No documents uploaded yet for this application.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {application.documents.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {doc.documentType} • Uploaded on {new Date(doc.createdAt).toLocaleDateString('en-GB')}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-[10px] font-bold text-red-600 mt-0.5">
                            Reason: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          doc.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : doc.verificationStatus === 'Replacement Required'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {doc.verificationStatus}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Download / View"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Conversation / Messages Thread */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#5B21B6]" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Application Messages & Updates
            </h2>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">
                No messages yet. You can ask questions or post updates regarding this application below.
              </div>
            ) : (
              messages.map((m: any) => {
                const isClient = m.senderType === 'CLIENT'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isClient
                          ? 'bg-[#5B21B6] text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="font-bold text-[10px] opacity-75 mb-0.5">
                        {isClient ? 'You' : m.senderName || 'Operio Team'}
                      </p>
                      <p>{m.message}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message to your advisor..."
              className="flex-1 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
            />
            <button
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="p-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowUploadModal(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-slate-900">Upload Application Document</h3>
            <form onSubmit={handleUploadDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Passport Copy - Partner"
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
                  <option value="Trade Licence">Trade Licence</option>
                  <option value="Contract">Contract / Agreement</option>
                  <option value="Other">Other Supporting Document</option>
                </select>
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
                  disabled={uploadingDoc}
                  className="px-4 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload & Attach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
