'use client'


import { formatDate } from '@/lib/formatDate'
import React, { useState } from 'react'
import { 
  FileText, UploadCloud, Filter, MoreVertical, X, Download, Edit2 
} from 'lucide-react'

// Define the type we expect
type DocumentWithRelations = {
  id: string;
  title: string;
  documentType: string;
  fileUrl: string;
  issueDate: Date | null;
  expiryDate: Date | null;
  status: string;
  client?: { fullName: string } | null;
  company?: { legalName: string, tradeLicenceNumber?: string | null, businessActivity?: string | null } | null;
}

export default function DocumentsClient({ documents }: { documents: DocumentWithRelations[] }) {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithRelations | null>(null)

  const getDaysRemaining = (expiryDate: Date | null) => {
    if (!expiryDate) return null
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getDocColor = (type: string) => {
    const map: Record<string, string> = {
      'Passport': 'text-blue-500',
      'Visa': 'text-emerald-500',
      'Licence': 'text-purple-500',
      'Contract': 'text-orange-500',
      'Other': 'text-gray-500'
    }
    return map[type] || 'text-blue-500'
  }

  const getStatusStyle = (status: string, daysRemaining: number | null) => {
    if (daysRemaining !== null && daysRemaining < 0) {
      return { label: 'Expired', style: 'bg-red-100 text-red-700 border border-red-200' }
    }
    if (daysRemaining !== null && daysRemaining < 30) {
      return { label: 'Expiring Soon', style: 'bg-orange-100 text-orange-700 border border-orange-200' }
    }
    if (status === 'Expired') return { label: 'Expired', style: 'bg-red-100 text-red-700 border border-red-200' }
    if (status === 'Expiring Soon') return { label: 'Expiring Soon', style: 'bg-orange-100 text-orange-700 border border-orange-200' }
    return { label: 'Valid', style: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
  }

  const filteredDocs = documents.filter(doc => {
    const days = getDaysRemaining(doc.expiryDate)
    if (activeTab === 'Expiring Soon') return days !== null && days >= 0 && days < 30
    if (activeTab === 'Expired') return days !== null && days < 0
    return true
  })

  return (
    <div className="flex w-full h-full">
      {/* Main Table */}
      <div className={`flex-1 transition-all duration-300 ${selectedDoc ? 'mr-[420px]' : ''}`}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-2 bg-white">
            <div className="flex space-x-8">
              {['All', 'Expiring Soon', 'Expired'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 py-4 text-sm font-semibold flex items-center ${
                    activeTab === tab 
                      ? 'border-blue-600 text-blue-600 font-bold' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div>
              <button className="flex items-center text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Days Remaining</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredDocs.length === 0 ? (
                   <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-sm">No documents found.</td></tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const days = getDaysRemaining(doc.expiryDate)
                    const statusObj = getStatusStyle(doc.status, days)
                    
                    return (
                      <tr 
                        key={doc.id} 
                        onClick={() => setSelectedDoc(doc)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedDoc?.id === doc.id ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-bold text-gray-900">
                            <FileText className={`w-4 h-4 mr-3 ${getDocColor(doc.documentType)}`} />
                            {doc.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">{doc.client?.fullName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">{doc.company?.legalName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">{doc.issueDate ? formatDate(doc.issueDate) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">{doc.expiryDate ? formatDate(doc.expiryDate) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          {days !== null ? (
                             <span className={days < 0 ? 'text-red-600' : days < 30 ? 'text-orange-500' : 'text-emerald-600'}>
                               {days}
                             </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full ${statusObj.style}`}>
                            {statusObj.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Drawer */}
      {selectedDoc && (
        <div className="fixed top-0 right-0 w-[420px] bg-white border-l border-gray-100 shadow-[-4px_0_24px_rgba(0,0,0,0.05)] flex flex-col h-screen overflow-y-auto z-50 transform transition-transform duration-300">
          
          <div className="p-6 border-b border-gray-100 relative mt-[64px]">
            <button onClick={() => setSelectedDoc(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedDoc.title}</h2>
            </div>
            <p className="text-sm font-bold text-gray-700">{selectedDoc.company?.legalName || selectedDoc.client?.fullName}</p>
          </div>

          <div className="p-6 space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 mb-1">Document Type</p>
                <p className="text-sm font-semibold text-gray-900">{selectedDoc.documentType}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-400 mb-1">Issue Date</p>
                <p className="text-sm font-semibold text-gray-900">{selectedDoc.issueDate ? formatDate(selectedDoc.issueDate) : '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 mb-1">Expiry Date</p>
                <p className="text-sm font-semibold text-gray-900">{selectedDoc.expiryDate ? formatDate(selectedDoc.expiryDate) : '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-400 mb-1">Days Remaining</p>
                <p className="text-sm font-bold text-gray-900">{getDaysRemaining(selectedDoc.expiryDate) ?? '-'}</p>
              </div>
            </div>

            <button className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Download Document
            </button>
            
            <button className="w-full py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors mt-2">
              <UploadCloud className="w-5 h-5 mr-2" />
              Upload New Version
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
