'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  FolderKanban,
  Clock,
  Check,
} from 'lucide-react'
import { markNotificationReadAction, markAllNotificationsReadAction } from './actions'
import { usePortal } from '@/components/portal/PortalContext'

export default function PortalNotificationsView({ notifications: initialList }: { notifications: any[] }) {
  const [notifications, setNotifications] = useState(initialList)
  const { setUnreadNotificationsCount } = usePortal()

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id)
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    setNotifications(updated)
    setUnreadNotificationsCount(updated.filter((n) => !n.isRead).length)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction()
    const updated = notifications.map((n) => ({ ...n, isRead: true }))
    setNotifications(updated)
    setUnreadNotificationsCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_STATUS':
        return <FolderKanban className="w-4 h-4 text-[#5B21B6]" />
      case 'DOCUMENT_REQUEST':
      case 'DOCUMENT_APPROVED':
        return <FileText className="w-4 h-4 text-emerald-600" />
      case 'RENEWAL_DUE':
        return <RefreshCw className="w-4 h-4 text-orange-600" />
      default:
        return <Bell className="w-4 h-4 text-blue-600" />
    }
  }

  const getTargetLink = (n: any) => {
    if (n.relatedEntityType === 'Application' && n.relatedEntityId) {
      return `/portal/applications/${n.relatedEntityId}`
    }
    if (n.relatedEntityType === 'Request' && n.relatedEntityId) {
      return `/portal/requests/${n.relatedEntityId}`
    }
    if (n.relatedEntityType === 'Document') return '/portal/documents'
    if (n.relatedEntityType === 'Renewal') return '/portal/renewals'
    return '/portal'
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Notifications & Updates</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time status updates on your applications, document requests, and upcoming expiries.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">You're all caught up! Updates will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-purple-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#5B21B6] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
                    <span>{new Date(n.createdAt).toLocaleDateString('en-GB')} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <Link
                      href={getTargetLink(n)}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className="text-[#5B21B6] hover:underline font-bold"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
