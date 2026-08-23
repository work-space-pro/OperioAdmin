'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Eye, MoreHorizontal, Pencil, Archive, Trash2, Calendar, RefreshCw, X } from 'lucide-react'
import { archiveClient, restoreClient } from './actions'
import DeleteClientModal from '@/components/clients/DeleteClientModal'
import { cn } from '@/lib/utils'

export default function ClientRowActions({ 
  id, 
  name,
  status 
}: { 
  id: string
  name?: string
  status?: string 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isArchived = status === 'Archived'

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this client? They will be hidden from the default list.')) {
      setLoading(true)
      await archiveClient(id)
      setLoading(false)
      setOpen(false)
    }
  }

  const handleRestore = async () => {
    if (window.confirm('Restore this client to active status?')) {
      setLoading(true)
      await restoreClient(id)
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-1.5" ref={menuRef}>
      
      {/* 1. Direct View Button */}
      <Link 
        href={`/clients/${id}`} 
        className="p-1.5 text-slate-500 hover:text-[#5B21B6] hover:bg-[#F3E8FF] rounded-lg transition-colors"
        title="View Client Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </Link>

      {/* 2. Direct Pencil / Edit Button */}
      <Link 
        href={`/clients/${id}/edit`}
        className="p-1.5 text-[#5B21B6] bg-[#EDE9FE]/70 hover:bg-[#DDD6FE] border border-[#DDD6FE] rounded-lg transition-all"
        title="Edit Client & Company Details"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Link>

      {/* 3. Direct Delete Button (Cross / Trash) */}
      <button 
        type="button"
        onClick={() => setIsDeleteModalOpen(true)}
        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer"
        title="Delete Client & All Company Data"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* 4. More Options Menu */}
      <div className="relative">
        <button 
          onClick={() => setOpen(!open)}
          disabled={loading}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            open ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
          )}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
            <Link 
              href={`/clients/${id}`}
              className="flex items-center w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
              View Full Profile
            </Link>
            
            <Link 
              href={`/clients/${id}/edit`}
              className="flex items-center w-full px-4 py-2 text-xs font-semibold text-[#5B21B6] hover:bg-purple-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 mr-2.5 text-[#5B21B6]" />
              Edit Profile &amp; Companies
            </Link>

            <div className="border-t border-slate-100 my-1"></div>

            {isArchived ? (
              <button 
                onClick={handleRestore}
                disabled={loading}
                className="flex items-center w-full px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2.5 text-emerald-500" />
                Restore Client
              </button>
            ) : (
              <button 
                onClick={handleArchive}
                disabled={loading}
                className="flex items-center w-full px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 mr-2.5 text-amber-500" />
                Archive Client
              </button>
            )}

            <button 
              onClick={() => {
                setOpen(false)
                setIsDeleteModalOpen(true)
              }}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2.5 text-red-500" />
              Delete Permanently
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteClientModal
        clientId={id}
        clientName={name || 'Client'}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

    </div>
  )
}
