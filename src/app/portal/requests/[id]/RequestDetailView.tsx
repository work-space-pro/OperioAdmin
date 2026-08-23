'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { sendRequestMessageAction } from '../actions'

export default function RequestDetailView({ request }: { request: any }) {
  const [messages, setMessages] = useState(request.messages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const res = await sendRequestMessageAction(request.id, newMessage)
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
    setSending(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/portal/requests"
          className="text-xs font-bold text-slate-500 hover:text-[#5B21B6] inline-flex items-center gap-1 mb-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to requests</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-[#5B21B6] bg-purple-50 px-2.5 py-0.5 rounded-lg">
              {request.requestNumber}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">{request.subject}</h1>
          </div>
          <span className="bg-purple-50 text-[#5B21B6] border border-purple-200 px-3 py-1 rounded-full text-xs font-bold w-fit">
            Status: {request.status}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {request.companyName} • Category: {request.category} • Opened on{' '}
          {new Date(request.createdAt).toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Conversation Thread Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col h-[540px]">
        {/* Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m: any) => {
            const isClient = m.senderType === 'CLIENT'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isClient
                      ? 'bg-[#5B21B6] text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="font-bold text-[10px] opacity-75 mb-1">
                    {isClient ? 'You' : m.senderName || 'Operio Support'}
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

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response to the support team..."
            className="flex-1 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
