'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, LayoutGrid, List, X, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ClientListHeader({ 
  viewMode, 
  setViewMode 
}: { 
  viewMode: 'card' | 'table', 
  setViewMode: (mode: 'card' | 'table') => void 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') || ''
  const currentType = searchParams.get('type') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentSort = searchParams.get('sort') || 'createdAt'
  const currentOrder = searchParams.get('order') || 'desc'

  const [searchTerm, setSearchTerm] = useState(currentQ)

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      params.set('page', '1') // reset to page 1 on new search
      router.push(`${pathname}?${params.toString()}`)
    }, 350)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'name_asc') {
      params.set('sort', 'fullName')
      params.set('order', 'asc')
    } else if (value === 'name_desc') {
      params.set('sort', 'fullName')
      params.set('order', 'desc')
    } else if (value === 'oldest') {
      params.set('sort', 'createdAt')
      params.set('order', 'asc')
    } else {
      params.set('sort', 'createdAt')
      params.set('order', 'desc')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchTerm('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const getSortValue = () => {
    if (currentSort === 'fullName' && currentOrder === 'asc') return 'name_asc'
    if (currentSort === 'fullName' && currentOrder === 'desc') return 'name_desc'
    if (currentSort === 'createdAt' && currentOrder === 'asc') return 'oldest'
    return 'newest'
  }

  return (
    <div className="dash-panel bg-white p-4 rounded-2xl mb-6 space-y-3.5 sm:space-y-0 border border-[#EAE5F2]">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6] focus:bg-white text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
            placeholder="Search by name, email, phone, or company..."
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters & View Modes */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Type Filter */}
          <div className="relative min-w-[130px]">
            <select 
              value={currentType || 'All'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6] text-xs font-bold text-slate-700 rounded-xl transition-all appearance-none cursor-pointer hover:bg-slate-100/70"
            >
              <option value="All">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Company Representative">Company Rep</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[130px]">
            <select 
              value={currentStatus || 'All'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={cn(
                "w-full pl-3 pr-8 py-2 border focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6] text-xs font-bold rounded-xl transition-all appearance-none cursor-pointer",
                currentStatus === 'Archived' 
                  ? "bg-amber-50 border-amber-200 text-amber-800" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
              )}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived 🗄️</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[130px]">
            <select 
              value={getSortValue()}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#5B21B6] text-xs font-bold text-slate-700 rounded-xl transition-all appearance-none cursor-pointer hover:bg-slate-100/70"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <ArrowUpDown className="w-3 h-3" />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'card' ? "bg-white shadow-xs text-[#5B21B6] font-bold" : "text-slate-500 hover:text-slate-700"
              )}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'table' ? "bg-white shadow-xs text-[#5B21B6] font-bold" : "text-slate-500 hover:text-slate-700"
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
