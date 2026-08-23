'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, MessageSquare, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  relatedEntityType: string | null
  relatedEntityId: string | null
  createdAt: string
  isRead: boolean
}

export default function PortalNotificationModal({
  notifications,
}: {
  notifications: NotificationItem[]
}) {
  const [activePopup, setActivePopup] = useState<NotificationItem | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Find first unread notification
    const unread = notifications.find((n) => !n.isRead)
    if (unread) {
      const dismissedKey = `dismissed_notif_${unread.id}`
      const isDismissed = sessionStorage.getItem(dismissedKey)
      if (!isDismissed) {
        setActivePopup(unread)
        setIsOpen(true)
      }
    }
  }, [notifications])

  if (!isOpen || !activePopup) return null

  const handleDismiss = () => {
    sessionStorage.setItem(`dismissed_notif_${activePopup.id}`, 'true')
    setIsOpen(false)
  }

  const getTargetLink = () => {
    if (activePopup.relatedEntityType === 'Request' && activePopup.relatedEntityId) {
      return `/portal/requests/${activePopup.relatedEntityId}`
    }
    if (activePopup.relatedEntityType === 'Application' && activePopup.relatedEntityId) {
      return `/portal/applications/${activePopup.relatedEntityId}`
    }
    if (activePopup.relatedEntityType === 'Renewal') return '/portal/renewals'
    if (activePopup.relatedEntityType === 'Document') return '/portal/documents'
    return '/portal/notifications'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-md w-full p-6 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED]" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-bold shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">
                Admin Response
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">{activePopup.title}</h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed my-3">
          <p className="line-clamp-3">{activePopup.message}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">
            Received {new Date(activePopup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
            {new Date(activePopup.createdAt).toLocaleDateString('en-GB')}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Skip / Dismiss
          </button>
          <Link
            href={getTargetLink()}
            onClick={handleDismiss}
            className="px-5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>View Response</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
