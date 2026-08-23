'use client'

import React, { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { deleteClient } from '@/app/(dashboard)/clients/actions'

interface DeleteClientModalProps {
  clientId: string
  clientName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function DeleteClientModal({
  clientId,
  clientName,
  isOpen,
  onClose,
  onSuccess
}: DeleteClientModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    const res = await deleteClient(clientId)
    setIsDeleting(false)

    if (res.success) {
      onClose()
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.href = '/clients'
      }
    } else {
      setError(res.error || 'Failed to delete client.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-red-100 w-full max-w-md overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
            Permanently Delete Client?
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{clientName}</span>? 
            This will permanently remove this client along with all linked <span className="font-bold text-red-600">Companies, Trade Licences, Members, Vehicles, Services, and Documents</span>.
          </p>

          <div className="p-3 bg-red-50/80 rounded-xl border border-red-200/80 text-[11px] font-bold text-red-800">
            ⚠️ This action is irreversible and completely wipes all records.
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
          </button>
        </div>

      </div>
    </div>
  )
}
