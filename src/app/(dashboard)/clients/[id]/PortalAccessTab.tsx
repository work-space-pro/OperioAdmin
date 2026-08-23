'use client'

import React, { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  KeyRound,
  UserCheck,
  Copy,
  Check,
  RefreshCw,
  Power,
  Lock,
  ExternalLink,
  Send,
  AlertTriangle,
  MessageSquare,
  MessageCircle,
  Clock,
  ChevronRight,
  User,
} from 'lucide-react'
import {
  getClientPortalAccessInfo,
  enableClientPortalAccessAction,
  togglePortalStatusAction,
  resetPortalPasswordByAdminAction,
  disablePortalAccessAction,
  getClientRequestsForAdminAction,
  sendAdminRequestReplyAction,
  updateClientRequestStatusAction,
} from './portalAdminActions'

export default function PortalAccessTab({ client }: { client: any }) {
  const [loading, setLoading] = useState(true)
  const [portalInfo, setPortalInfo] = useState<any>(null)
  const [emailInput, setEmailInput] = useState(client.email || '')
  const [passwordInput, setPasswordInput] = useState('Operio@2026')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null)

  // Requests / Chat State
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [adminReplyText, setAdminReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const loadInfo = async () => {
    setLoading(true)
    const res = await getClientPortalAccessInfo(client.id)
    setPortalInfo(res)
    if (res.portalUser?.email) {
      setEmailInput(res.portalUser.email)
    }

    // Load client tickets/requests
    const reqRes = await getClientRequestsForAdminAction(client.id)
    if (reqRes.success && reqRes.requests) {
      setRequests(reqRes.requests)
      if (reqRes.requests.length > 0) {
        setSelectedRequest(reqRes.requests[0])
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInfo()
  }, [client.id])

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await enableClientPortalAccessAction(client.id, emailInput, passwordInput)
    if (res.success) {
      setSuccessMsg('Portal access enabled successfully!')
      setGeneratedCreds({ email: emailInput, pass: res.temporaryPassword })
      await loadInfo()
    } else {
      setErrorMsg(res.error || 'Failed to enable portal access.')
    }
    setActionLoading(false)
  }

  const handleToggleStatus = async (newStatus: 'Active' | 'Suspended') => {
    if (!portalInfo?.portalUser?.id) return
    setActionLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await togglePortalStatusAction(portalInfo.portalUser.id, newStatus)
    if (res.success) {
      setSuccessMsg(`Portal access has been set to ${newStatus}.`)
      await loadInfo()
    } else {
      setErrorMsg(res.error || 'Failed to update status.')
    }
    setActionLoading(false)
  }

  const handleResetPassword = async () => {
    if (!portalInfo?.portalUser?.id) return
    setActionLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await resetPortalPasswordByAdminAction(portalInfo.portalUser.id)
    if (res.success) {
      setSuccessMsg(`Password reset successfully! New temporary password: ${res.newPassword}`)
      setGeneratedCreds({ email: portalInfo.portalUser.email, pass: res.newPassword })
      await loadInfo()
    } else {
      setErrorMsg(res.error || 'Failed to reset password.')
    }
    setActionLoading(false)
  }

  const handleDisable = async () => {
    if (!portalInfo?.portalUser?.id) return
    if (!confirm('Are you sure you want to disable and revoke portal access for this client?')) return

    setActionLoading(true)
    const res = await disablePortalAccessAction(portalInfo.portalUser.id)
    if (res.success) {
      setSuccessMsg('Portal access disabled and user credentials revoked.')
      setGeneratedCreds(null)
      await loadInfo()
    } else {
      setErrorMsg(res.error || 'Failed to disable portal access.')
    }
    setActionLoading(false)
  }

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !adminReplyText.trim() || sendingReply) return

    setSendingReply(true)
    const res = await sendAdminRequestReplyAction(selectedRequest.id, adminReplyText.trim(), 'Operio Team')
    if (res.success) {
      const newMsg = {
        id: String(Date.now()),
        senderType: 'ADMIN',
        senderName: 'Operio Team',
        message: adminReplyText.trim(),
        createdAt: new Date().toISOString(),
      }
      setSelectedRequest({
        ...selectedRequest,
        messages: [...selectedRequest.messages, newMsg],
      })
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, messages: [...r.messages, newMsg], status: 'Waiting for Client' }
            : r
        )
      )
      setAdminReplyText('')
    }
    setSendingReply(false)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRequest) return
    const res = await updateClientRequestStatusAction(selectedRequest.id, newStatus)
    if (res.success) {
      setSelectedRequest({ ...selectedRequest, status: newStatus })
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: newStatus } : r))
      )
    }
  }

  const copyCredsToClipboard = () => {
    if (!generatedCreds) return
    const text = `Operio Client Portal Access\nPortal URL: ${window.location.origin}/portal/login\nEmail: ${generatedCreds.email}\nPassword: ${generatedCreds.pass}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="dash-panel bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <div className="w-8 h-8 border-2 border-[#5B21B6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-bold">Loading Portal Configuration & Chat Threads...</p>
      </div>
    )
  }

  const isEnabled = portalInfo?.status === 'Active' || portalInfo?.status === 'Suspended'
  const status = portalInfo?.status || 'Not Invited'

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="dash-panel bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5B21B6] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Client Portal Access & Live Chat</h2>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : status === 'Suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Grant {client.fullName} secure portal access and manage real-time client tickets & chat threads.
              </p>
            </div>
          </div>

          <a
            href="/portal/login"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 transition-colors w-fit"
          >
            <span>Open Client Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Generated Credentials Callout */}
      {generatedCreds && (
        <div className="bg-purple-50/80 rounded-2xl border border-purple-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#5B21B6] uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Portal Login Credentials</span>
            </h3>
            <button
              onClick={copyCredsToClipboard}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white text-[#5B21B6] border border-purple-300 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Login Details'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-purple-100">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Portal Login URL</span>
              <span className="font-bold text-slate-800 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/portal/login` : '/portal/login'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Email Address</span>
              <span className="font-bold text-slate-800">{generatedCreds.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Temporary Password</span>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                {generatedCreds.pass}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Access Scope</span>
              <span className="font-bold text-slate-800">Client ID: {client.id.substring(0, 8)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Client Support Requests & Live Chat Threads */}
      <div className="dash-panel bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#5B21B6]" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Client Support Tickets & Live Chat Threads ({requests.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Real-time messages from Client Portal
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No support requests or chat threads from this client yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When the client submits a question or renewal request in the portal, it will appear here for instant reply.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 min-h-[460px]">
            {/* Left Col: Request List */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
              {requests.map((r) => {
                const isSelected = selectedRequest?.id === r.id
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className={`w-full text-left p-3.5 transition-colors block cursor-pointer ${
                      isSelected ? 'bg-purple-50/80 border-l-4 border-[#5B21B6]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-[#5B21B6] bg-white px-2 py-0.5 rounded border border-purple-100">
                        {r.requestNumber}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{r.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {r.messages[r.messages.length - 1]?.message || r.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                      {new Date(r.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right 2 Cols: Live Conversation Thread & Reply Box */}
            {selectedRequest ? (
              <div className="lg:col-span-2 flex flex-col justify-between h-[500px]">
                {/* Chat Header */}
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#5B21B6]">{selectedRequest.requestNumber}</span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{selectedRequest.subject}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Category: {selectedRequest.category} • Priority: {selectedRequest.priority}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Client">Waiting for Client</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {selectedRequest.messages.map((m: any) => {
                    const isAdmin = m.senderType === 'ADMIN'
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-[#4C1D95] text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p className="font-bold text-[10px] opacity-75 mb-0.5">
                            {isAdmin ? 'You (Operio Admin)' : m.senderName || client.fullName}
                          </p>
                          <p>{m.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(m.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Admin Reply Form */}
                <form
                  onSubmit={handleSendAdminReply}
                  className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type your reply to the client..."
                    className="flex-1 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !adminReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <span>{sendingReply ? 'Sending...' : 'Reply'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="lg:col-span-2 p-12 text-center text-slate-400 text-xs font-medium">
                Select a ticket from the left to view the conversation.
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Account Configuration & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Access Details / Enable Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dash-panel bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              {isEnabled ? 'Portal Account Configuration' : 'Enable Portal Access for Client'}
            </h3>

            <form onSubmit={handleEnable} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Portal Login Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEnabled ? 'Set New Password (Optional)' : 'Initial Password'}
                  </label>
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Operio@2026"
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">
                  {isEnabled ? 'Update email or force reset password for this client.' : 'Enabling will create a secure client authentication record.'}
                </p>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {actionLoading ? 'Saving...' : isEnabled ? 'Update Portal Access' : 'Enable Portal Access'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Metrics & Audit */}
          {isEnabled && (
            <div className="dash-panel bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Portal Security & Audit Stats
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Portal Status</span>
                  <span className="font-bold text-slate-900">{portalInfo?.portalUser?.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Last Login</span>
                  <span className="font-bold text-slate-900">
                    {portalInfo?.portalUser?.lastLogin
                      ? new Date(portalInfo.portalUser.lastLogin).toLocaleString('en-GB')
                      : 'Never Logged In'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Created On</span>
                  <span className="font-bold text-slate-900">
                    {portalInfo?.portalUser?.createdAt
                      ? new Date(portalInfo.portalUser.createdAt).toLocaleDateString('en-GB')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Quick Admin Action Buttons */}
        <div className="space-y-4">
          <div className="dash-panel bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Management Actions
            </h3>

            {isEnabled ? (
              <div className="space-y-2">
                {portalInfo?.portalUser?.status === 'Active' ? (
                  <button
                    onClick={() => handleToggleStatus('Suspended')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-orange-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Suspend Portal Access</span>
                    <Power className="w-4 h-4 text-orange-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus('Active')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Reactivate Portal Access</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </button>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Generate New Random Password</span>
                  <KeyRound className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={handleDisable}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Revoke / Disable Account</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Fill the form on the left to invite this client to the portal.
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs text-purple-900 space-y-1.5 font-medium leading-relaxed">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B21B6]" />
              <span>Multi-Tenant Security Enforcement</span>
            </p>
            <p className="text-[11px] text-purple-800">
              When logged in, this user can ONLY access applications, documents, and companies linked to Client ID{' '}
              <span className="font-mono font-bold">{client.id.substring(0, 8)}...</span>. Admin CRM data and other clients remain 100% invisible.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
