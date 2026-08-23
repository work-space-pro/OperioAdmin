'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  Send,
  User,
  Building2,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import CreateActionModal from '@/components/dashboard/CreateActionModal'
import {
  toggleGlobalActionStatus,
  sendAdminGlobalReplyAction,
  updateRequestStatusByAdminAction,
} from './supportAndTasksActions'

interface SupportAndTasksViewProps {
  requests: any[]
  actions: any[]
  clients: Array<{ id: string; fullName: string }>
}

export default function SupportAndTasksView({
  requests: initialRequests,
  actions: initialActions,
  clients,
}: SupportAndTasksViewProps) {
  const [activeMainTab, setActiveMainTab] = useState<'support' | 'tasks'>('support')
  const [supportFilter, setSupportFilter] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [searchQuery, setSearchQuery] = useState('')

  // State for actions & requests
  const [actionsList, setActionsList] = useState(initialActions)
  const [requestsList, setRequestsList] = useState(initialRequests)

  // Collapsible state for closed actions
  const [closedActionsOpen, setClosedActionsOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  // Active Chat Modal / Drawer state
  const [activeChatRequest, setActiveChatRequest] = useState<any | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [isPending, startTransition] = useTransition()

  // 1. Filtered Requests
  const openRequests = requestsList.filter(
    (r) => r.status !== 'Closed' && r.status !== 'Resolved'
  )
  const closedRequests = requestsList.filter(
    (r) => r.status === 'Closed' || r.status === 'Resolved'
  )

  const currentRequestsList = supportFilter === 'OPEN' ? openRequests : closedRequests

  const filteredRequests = currentRequestsList.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.requestNumber?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q) ||
      r.client?.fullName?.toLowerCase().includes(q) ||
      r.company?.legalName?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    )
  })

  // 2. Filtered Actions
  const openActions = actionsList.filter((a) => a.status !== 'Completed')
  const closedActions = actionsList.filter((a) => a.status === 'Completed')

  // Unread badge count: Requests where last message is from Client or status is Open
  const unreadTicketsCount = openRequests.filter((r) => {
    const lastMsg = r.messages?.[r.messages.length - 1]
    return !lastMsg || lastMsg.senderType === 'CLIENT'
  }).length

  // Toggle Action Status Handler (Optimistic UI)
  const handleToggleAction = async (actionId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    setActionsList((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: nextStatus } : a))
    )

    await toggleGlobalActionStatus(actionId, currentStatus)
  }

  // Send Reply Handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !activeChatRequest || isSendingReply) return

    setIsSendingReply(true)
    const res = await sendAdminGlobalReplyAction(activeChatRequest.id, replyMessage.trim())

    if (res.success && res.message) {
      const updatedMessages = [...(activeChatRequest.messages || []), res.message]
      const updatedReq = {
        ...activeChatRequest,
        status: activeChatRequest.status === 'Open' ? 'In Progress' : activeChatRequest.status,
        messages: updatedMessages,
      }

      setActiveChatRequest(updatedReq)
      setRequestsList((prev) =>
        prev.map((r) => (r.id === activeChatRequest.id ? updatedReq : r))
      )
      setReplyMessage('')
    }
    setIsSendingReply(false)
  }

  // Change Request Status Handler
  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeChatRequest) return
    const res = await updateRequestStatusByAdminAction(activeChatRequest.id, newStatus)
    if (res.success) {
      const updatedReq = { ...activeChatRequest, status: newStatus }
      setActiveChatRequest(updatedReq)
      setRequestsList((prev) =>
        prev.map((r) => (r.id === activeChatRequest.id ? updatedReq : r))
      )
    }
  }

  return (
    <div className="w-full font-sans space-y-5 animate-fade-in pb-12">
      {/* Header & Main Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#5B21B6]" />
            Support &amp; Tasks Center
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Centralized client support requests, real-time message inbox, and CRM operational tasks.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1">
          <button
            onClick={() => setActiveMainTab('support')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeMainTab === 'support'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support &amp; Chat Inbox</span>
            {unreadTicketsCount > 0 && (
              <span
                className={cn(
                  'text-[10px] font-black px-2 py-0.5 rounded-full',
                  activeMainTab === 'support'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-500 text-white'
                )}
              >
                {unreadTicketsCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('tasks')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeMainTab === 'tasks'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <CheckSquare className="w-4 h-4" />
            <span>CRM Tasks ({openActions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CLIENT SUPPORT & LIVE CHAT INBOX */}
      {activeMainTab === 'support' && (
        <div className="space-y-4">
          {/* Support KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="dash-card bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Requests</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{openRequests.length}</div>
            </div>

            <div className="dash-card bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Needs Response</span>
              <div className="text-2xl font-black text-red-600 mt-1">{unreadTicketsCount}</div>
            </div>

            <div className="dash-card bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved / Closed</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{closedRequests.length}</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Open vs Closed Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSupportFilter('OPEN')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  supportFilter === 'OPEN'
                    ? 'bg-[#5B21B6] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Open Requests ({openRequests.length})
              </button>
              <button
                onClick={() => setSupportFilter('CLOSED')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  supportFilter === 'CLOSED'
                    ? 'bg-[#5B21B6] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Closed Chats ({closedRequests.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, client, company..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5B21B6]/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Requests Feed List */}
          <div className="dash-panel bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">
                  {supportFilter === 'OPEN' ? 'No open support requests' : 'No closed chats'}
                </p>
                <p className="text-slate-400 mt-0.5">
                  {supportFilter === 'OPEN'
                    ? 'All client inquiries across companies have been addressed!'
                    : 'Closed tickets will appear here for historical reference.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const lastMessage = req.messages?.[req.messages.length - 1]
                  const isClientLast = lastMessage?.senderType === 'CLIENT'
                  const isClosed = req.status === 'Closed' || req.status === 'Resolved'

                  return (
                    <div
                      key={req.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-[#5B21B6] bg-purple-50 px-2 py-0.5 rounded-md font-mono">
                            {req.requestNumber}
                          </span>
                          <span className="text-xs font-black text-slate-900 truncate">
                            {req.subject}
                          </span>
                          {isClientLast && !isClosed && (
                            <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                              NEW REPLY
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {lastMessage ? lastMessage.message : req.message}
                        </p>

                        <div className="flex items-center gap-3 text-[10.5px] text-slate-400 font-semibold pt-1">
                          <span className="flex items-center gap-1 text-slate-700">
                            <User className="w-3 h-3 text-[#5B21B6]" />
                            {req.client?.fullName || 'Client'}
                          </span>
                          {req.company?.legalName && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {req.company.legalName}
                            </span>
                          )}
                          <span>•</span>
                          <span>Category: {req.category}</span>
                          <span>•</span>
                          <span>
                            {req.updatedAt
                              ? new Date(req.updatedAt).toLocaleDateString('en-GB')
                              : new Date(req.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={cn(
                            'text-[10px] font-extrabold px-2.5 py-1 rounded-full border',
                            req.status === 'Open'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : req.status === 'In Progress'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : req.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {req.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Open Chat</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CRM TASKS & ACTIONS */}
      {activeMainTab === 'tasks' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Operational Tasks &amp; Reminders
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {openActions.length} open task(s) requiring attention.
              </p>
            </div>

            <button
              onClick={() => setIsActionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Task</span>
            </button>
          </div>

          {/* Section A: Open / Pending Tasks */}
          <div className="dash-panel bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Active Open Tasks ({openActions.length})
              </span>
            </div>

            {openActions.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">All tasks completed!</p>
                <p className="text-slate-400 mt-0.5">No pending operational follow-ups.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {openActions.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => handleToggleAction(act.id, act.status)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                        title="Mark Complete"
                      >
                        <Square className="w-5 h-5 text-slate-300" />
                      </button>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                        {act.description && (
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                      {act.client?.fullName && (
                        <Link
                          href={`/clients/${act.client.id}`}
                          className="text-xs font-bold text-[#5B21B6] hover:underline"
                        >
                          {act.client.fullName}
                        </Link>
                      )}

                      <span className="text-[11px] font-semibold text-slate-500">
                        {formatDate(act.dueDate)}
                      </span>

                      <span
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-md border',
                          act.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : act.priority === 'Low'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        {act.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Closed / Completed Tasks (Collapsible Accordion) */}
          {closedActions.length > 0 && (
            <div className="dash-panel bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setClosedActionsOpen(!closedActionsOpen)}
                className="w-full px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Closed / Completed Tasks ({closedActions.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span>{closedActionsOpen ? 'Collapse' : 'Expand'}</span>
                  {closedActionsOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {closedActionsOpen && (
                <div className="divide-y divide-slate-100">
                  {closedActions.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => handleToggleAction(act.id, act.status)}
                          className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0 cursor-pointer"
                          title="Reopen Task"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-400 line-through truncate">
                            {act.title}
                          </p>
                          {act.description && (
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 ml-4">
                        {act.client?.fullName && (
                          <span className="text-xs font-semibold text-slate-400">
                            {act.client.fullName}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {formatDate(act.dueDate)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-500">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIVE CHAT & SUPPORT MODAL / DRAWER */}
      {activeChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveChatRequest(null)}
          />

          <div className="relative bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md font-mono">
                    {activeChatRequest.requestNumber}
                  </span>
                  <select
                    value={activeChatRequest.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                </div>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  {activeChatRequest.subject}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Client: {activeChatRequest.client?.fullName} • Company:{' '}
                  {activeChatRequest.company?.legalName || 'Individual'}
                </p>
              </div>

              <button
                onClick={() => setActiveChatRequest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs max-h-[50vh]">
              {/* Initial Request Description */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-slate-800">
                <span className="text-[10px] font-bold text-[#5B21B6] uppercase block mb-1">
                  Initial Client Ticket Request
                </span>
                <p className="whitespace-pre-wrap leading-relaxed">{activeChatRequest.message}</p>
              </div>

              {/* Message History */}
              {activeChatRequest.messages?.map((msg: any) => {
                const isAdmin = msg.senderType === 'ADMIN'
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col',
                      isAdmin ? 'items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3 text-xs space-y-1',
                        isAdmin
                          ? 'bg-[#5B21B6] text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-900 rounded-tl-xs'
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px] font-bold block',
                          isAdmin ? 'text-purple-200' : 'text-slate-500'
                        )}
                      >
                        {msg.senderName}
                      </span>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Reply Input Form */}
            <form
              onSubmit={handleSendReply}
              className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type response to client..."
                className="flex-1 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#5B21B6]/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSendingReply || !replyMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        clients={clients}
      />
    </div>
  )
}
