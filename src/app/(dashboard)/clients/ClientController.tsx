'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ClientListHeader } from './ClientListHeader'
import { ClientCardGrid } from './ClientCardGrid'
import { ClientTable } from './ClientTable'
import { Users, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import Link from 'next/link'

export function ClientController({ 
  clients, 
  totalCount,
  currentPage = 1,
  pageSize = 25
}: { 
  clients: any[]
  totalCount: number
  currentPage?: number
  pageSize?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  useEffect(() => {
    const saved = localStorage.getItem('client-view-mode') as 'card' | 'table'
    if (saved === 'card' || saved === 'table') {
      setViewMode(saved)
    }
  }, [])

  const handleSetViewMode = (mode: 'card' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('client-view-mode', mode)
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const startIdx = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endIdx = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="space-y-4">
      <ClientListHeader viewMode={viewMode} setViewMode={handleSetViewMode} />
      
      {/* Results Header Count */}
      <div className="flex justify-between items-center px-1">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{startIdx}–{endIdx}</span> of <span className="font-bold text-slate-800">{totalCount}</span> clients
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="dash-panel flex flex-col items-center justify-center min-h-[320px] p-12 text-center bg-white rounded-2xl">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No clients found</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm">
            No client records match your current search query or active filter settings.
          </p>
          <div className="mt-5 flex items-center space-x-3">
            <Link 
              href="/clients/new" 
              className="inline-flex items-center justify-center px-4 py-2 bg-[#4C1D95] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Add New Client
            </Link>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <ClientCardGrid clients={clients} />
          ) : (
            <ClientTable clients={clients} />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="dash-panel bg-white p-3.5 rounded-2xl flex items-center justify-between mt-6 border border-[#EAE5F2]">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <span className="text-xs font-bold text-[#5B21B6] bg-[#EDE9FE] px-3 py-1 rounded-full">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
