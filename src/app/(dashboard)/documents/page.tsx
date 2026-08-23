import React from 'react'
import { FileText, Clock, BadgeAlert, CheckCircle2, FileBarChart } from 'lucide-react'
import prisma from '@/lib/db'
import DocumentsClient from './DocumentsClient'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    include: { client: true, company: true },
    orderBy: { createdAt: 'desc' }
  })

  const now = new Date()
  const in30Days = new Date()
  in30Days.setDate(now.getDate() + 30)

  // Calculate stats
  const total = documents.length
  const expiringSoon = documents.filter(d => d.expiryDate && d.expiryDate > now && d.expiryDate <= in30Days).length
  const expired = documents.filter(d => d.expiryDate && d.expiryDate <= now).length
  const valid = documents.filter(d => d.expiryDate && d.expiryDate > in30Days).length

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] font-sans px-8 py-8 space-y-6 overflow-hidden">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Documents / Renewals</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Track, manage and renew all client documents in one place.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <FileBarChart className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-600 uppercase">Total Documents</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400 mt-1 font-medium">All active documents</p>
        </div>

        <div className="bg-white rounded-2xl border border-orange-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex items-center space-x-3 mb-4 relative z-10">
             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Clock className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-600 uppercase">Expiring in 30 Days</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 relative z-10">{expiringSoon}</p>
          <p className="text-xs text-orange-600 mt-1 font-semibold relative z-10">Require attention</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <BadgeAlert className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-600 uppercase">Expired</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{expired}</p>
          <p className="text-xs text-red-600 mt-1 font-semibold">Action required</p>
        </div>

        <div className="bg-white rounded-2xl border border-blue-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-600 uppercase">Valid Documents</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{valid}</p>
          <p className="text-xs text-blue-600 mt-1 font-semibold">No action needed</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-600 uppercase">System Status</p>
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-2">100% Sync</p>
          <p className="text-xs text-gray-400 mt-1 font-medium">Live Database connected</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <DocumentsClient documents={documents} />
      </div>

    </div>
  )
}
