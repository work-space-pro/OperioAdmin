'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  X, 
  Calendar, 
  Building2, 
  User, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  Phone,
  Mail,
  Edit2,
  Save,
  CheckSquare
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import { updateRenewalItem } from '@/app/(dashboard)/renewals/actions'
import { cn } from '@/lib/utils'

interface RenewalDetailModalProps {
  item: any | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: (updatedItem: any) => void
}

function toDateInputString(dateVal: any): string {
  if (!dateVal) return ''
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0]
  }
  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return ''
    const year = dateVal.getFullYear()
    const month = String(dateVal.getMonth() + 1).padStart(2, '0')
    const day = String(dateVal.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export default function RenewalDetailModal({
  item,
  isOpen,
  onClose,
  onUpdated
}: RenewalDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [newIdentifier, setNewIdentifier] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setIsEditing(false)
      setSaveSuccess(false)
      setErrorMessage('')
      setNewExpiryDate(toDateInputString(item.expiryDate))
      setNewIdentifier(item.identifier && item.identifier !== '—' ? item.identifier : '')
    }
  }, [item])

  if (!isOpen || !item) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpiryDate) {
      setErrorMessage('Please select a new expiry date.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    const res = await updateRenewalItem({
      entityType: item.entityType,
      entityId: item.entityId,
      field: item.field,
      newExpiryDate,
      newIdentifier,
      numberField: item.numberField
    })

    setIsSaving(false)

    if (res.success) {
      setSaveSuccess(true)
      setIsEditing(false)
      if (onUpdated) {
        onUpdated({
          ...item,
          expiryDate: new Date(newExpiryDate).toISOString(),
          identifier: newIdentifier || item.identifier
        })
      }
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setErrorMessage(res.error || 'Failed to update renewal.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE5F2] w-full max-w-xl overflow-hidden animate-fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-[#FAF9FC]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Renewal &amp; Expiry Details</h3>
              <p className="text-[11px] text-slate-400 font-medium">Compliance verification &amp; renewal updater</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Status Alert Banner */}
          <div className={cn(
            "p-3.5 rounded-2xl flex items-center justify-between border",
            item.isExpired ? "bg-red-50/80 border-red-200 text-red-800" :
            item.isExpiringSoon ? "bg-orange-50/80 border-orange-200 text-orange-800" :
            "bg-emerald-50/80 border-emerald-200 text-emerald-800"
          )}>
            <div className="flex items-center space-x-2.5">
              {item.isExpired ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              ) : item.isExpiringSoon ? (
                <Clock className="w-5 h-5 text-orange-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold leading-tight">
                  {item.isExpired ? 'EXPIRED - ACTION REQUIRED' : item.isExpiringSoon ? `DUE IN ${item.daysUntil} DAYS` : 'CURRENTLY VALID & ACTIVE'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Expiry Date: <span className="font-bold">{formatDate(item.expiryDate)}</span>
                </p>
              </div>
            </div>

            <span className={cn(
              "px-2.5 py-1 text-[10px] font-extrabold rounded-full",
              item.isExpired ? "bg-red-200 text-red-900" :
              item.isExpiringSoon ? "bg-orange-200 text-orange-900" :
              "bg-emerald-200 text-emerald-900"
            )}>
              {item.category}
            </span>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center animate-fade-in">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Renewal updated and saved to database successfully!
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold animate-fade-in">
              {errorMessage}
            </div>
          )}

          {/* Info Details Grid */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Item Title</p>
                <p className="font-bold text-slate-900 mt-0.5">{item.title}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Identifier / Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{item.identifier || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Company / Entity</p>
                {item.companyId ? (
                  <Link 
                    href={`/companies/${item.companyId}`}
                    className="font-bold text-[#5B21B6] hover:underline flex items-center mt-0.5"
                  >
                    {item.companyName || item.entityName}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                  </Link>
                ) : (
                  <p className="font-bold text-slate-800 mt-0.5">{item.entityName}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Client</p>
                {item.clientId ? (
                  <Link 
                    href={`/clients/${item.clientId}`}
                    className="font-bold text-[#5B21B6] hover:underline flex items-center mt-0.5"
                  >
                    {item.clientName}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                  </Link>
                ) : (
                  <p className="font-bold text-slate-800 mt-0.5">{item.clientName || '—'}</p>
                )}
              </div>
            </div>

            {item.extraInfo && (
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Additional Metadata</p>
                <p className="font-medium text-slate-700 mt-0.5">{item.extraInfo}</p>
              </div>
            )}

            {(item.contactEmail || item.contactPhone) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                {item.contactEmail && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</p>
                    <p className="font-medium text-slate-700 mt-0.5">{item.contactEmail}</p>
                  </div>
                )}
                {item.contactPhone && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</p>
                    <p className="font-medium text-slate-700 mt-0.5">{item.contactPhone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit / Quick Renewal Form */}
          {isEditing ? (
            <form onSubmit={handleSave} className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3.5 animate-fade-in">
              <h4 className="text-xs font-bold text-[#5B21B6] uppercase tracking-wide flex items-center">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Update Renewal / Expiry Date
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">New Expiry Date *</label>
                  <input 
                    type="date" 
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6]"
                  />
                </div>

                {item.numberField && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Updated Identifier / Number</label>
                    <input 
                      type="text" 
                      value={newIdentifier}
                      onChange={(e) => setNewIdentifier(e.target.value)}
                      placeholder="e.g. New Licence / Policy No"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#4C1D95] hover:bg-[#5B21B6] rounded-xl flex items-center disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save Renewal Update'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#5B21B6] text-xs font-bold rounded-xl transition-all flex items-center"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Update Expiry / Quick Renew
              </button>

              {item.clientId && (
                <Link
                  href={`/clients/${item.clientId}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center"
                >
                  View Client Profile &rarr;
                </Link>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
