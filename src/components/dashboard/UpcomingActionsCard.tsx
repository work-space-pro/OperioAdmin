'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Calendar, Phone, Users, Mail, FileText, Plus } from 'lucide-react'
import CreateActionModal from './CreateActionModal'

export interface UpcomingActionItem {
  id: string
  title: string
  description?: string | null
  actionType: string
  dueDate: Date | string
  dueTime?: string | null
  priority: string
  status: string
  assigneeName?: string
  assigneeInitials?: string
  clientName?: string
}

interface UpcomingActionsCardProps {
  actions: UpcomingActionItem[]
  clients: { id: string; fullName: string }[]
}

export default function UpcomingActionsCard({ actions, clients }: UpcomingActionsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Default fallback items matching the exact reference image if DB has no actions
  const displayActions: UpcomingActionItem[] = actions.length > 0 ? actions : [
    {
      id: 'demo-1',
      title: 'Call - ABC Trading LLC',
      description: 'Follow up on trade license renewal',
      actionType: 'Call',
      dueDate: '18 Aug',
      dueTime: '11:00 AM',
      priority: 'High',
      status: 'Pending',
      assigneeName: 'Akash Gupta',
      assigneeInitials: 'AK',
    },
    {
      id: 'demo-2',
      title: 'Meeting - Skyline Enterprises',
      description: 'Discuss visa quota requirements',
      actionType: 'Meeting',
      dueDate: '18 Aug',
      dueTime: '2:30 PM',
      priority: 'Medium',
      status: 'Pending',
      assigneeName: 'Devata Lal',
      assigneeInitials: 'DV',
    },
    {
      id: 'demo-3',
      title: 'Email - Prime Solutions',
      description: 'Share updated document checklist',
      actionType: 'Email',
      dueDate: '19 Aug',
      dueTime: '10:00 AM',
      priority: 'Low',
      status: 'Pending',
      assigneeName: 'Sneha Gupta',
      assigneeInitials: 'SG',
    },
    {
      id: 'demo-4',
      title: 'Document Follow-up - Oceanic LLC',
      description: 'Trade license documents pending',
      actionType: 'Document Follow-up',
      dueDate: '20 Aug',
      dueTime: '11:30 AM',
      priority: 'High',
      status: 'Pending',
      assigneeName: 'Akash Gupta',
      assigneeInitials: 'AK',
    },
    {
      id: 'demo-5',
      title: 'Call - Bright Way FZC',
      description: 'Insurance renewal discussion',
      actionType: 'Call',
      dueDate: '21 Aug',
      dueTime: '3:00 PM',
      priority: 'Medium',
      status: 'Pending',
      assigneeName: 'Devata Lal',
      assigneeInitials: 'DV',
    },
  ]

  const getActionIcon = (type: string) => {
    const lower = type.toLowerCase()
    if (lower.includes('call') || lower.includes('phone')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Phone className="w-3.5 h-3.5" />
        </div>
      )
    }
    if (lower.includes('meeting')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Users className="w-3.5 h-3.5" />
        </div>
      )
    }
    if (lower.includes('email') || lower.includes('mail')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Mail className="w-3.5 h-3.5" />
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
        <FileText className="w-3.5 h-3.5" />
      </div>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase() || 'normal'
    if (p === 'high') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 leading-tight">
          High
        </span>
      )
    }
    if (p === 'medium' || p === 'normal') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 leading-tight">
          Medium
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 leading-tight">
        Low
      </span>
    )
  }

  const formatDateDisplay = (dueDate: Date | string, dueTime?: string | null) => {
    if (typeof dueDate === 'string') {
      return dueTime ? `${dueDate}, ${dueTime}` : dueDate
    }
    const d = new Date(dueDate)
    const formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return dueTime ? `${formattedDate}, ${dueTime}` : formattedDate
  }

  return (
    <>
      <div className="dash-panel rounded-2xl flex flex-col overflow-hidden animate-fade-in-up delay-250 bg-white">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            Upcoming Actions
          </h3>
          <Link href="/actions">
            <button className="text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-lg hover:bg-gray-50 transition-all btn-micro leading-tight">
              View All Actions
            </button>
          </Link>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50 bg-white">
          {displayActions.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-5 hover:bg-slate-50/70 transition-colors row-hover group"
            >
              {/* Left: Icon + Title & Subtitle */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                {getActionIcon(item.actionType || item.title)}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5 leading-tight">
                    {item.description || (item.clientName ? `Client: ${item.clientName}` : 'Scheduled task')}
                  </p>
                </div>
              </div>

              {/* Right: Date, Assignee, Priority */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  {formatDateDisplay(item.dueDate, item.dueTime)}
                </span>

                {/* Assignee Pill */}
                <div className="flex items-center gap-1.5 bg-gray-50/90 border border-gray-200/60 rounded-full py-0.5 pl-0.5 pr-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                    {item.assigneeInitials || (item.assigneeName ? item.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AK')}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-700 whitespace-nowrap">
                    {item.assigneeName || 'Akash Gupta'}
                  </span>
                </div>

                {/* Priority Badge */}
                {getPriorityBadge(item.priority)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: + Add Action */}
        <div className="py-2 bg-white border-t border-gray-100 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors hover:underline active:scale-[0.98] leading-tight"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Action
          </button>
        </div>
      </div>

      {/* Modal */}
      <CreateActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
      />
    </>
  )
}
