'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Building2, Briefcase, FileText, X } from 'lucide-react'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const handleCustomTrigger = () => setIsOpen(true)
    window.addEventListener('open-command-palette', handleCustomTrigger)
    return () => window.removeEventListener('open-command-palette', handleCustomTrigger)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1))
    }
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      const selected = results[selectedIndex]
      if (selected) {
        setIsOpen(false)
        router.push(selected.href)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 mx-4 flex flex-col">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 h-14 bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium"
            placeholder="Search clients, companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 text-center text-sm font-medium text-slate-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, idx) => {
                let Icon = User
                if (result.type === 'company') Icon = Building2
                if (result.type === 'service') Icon = Briefcase
                
                return (
                  <button
                    key={result.id}
                    className={`w-full flex items-center p-3 rounded-xl transition-colors text-left ${idx === selectedIndex ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'}`}
                    onClick={() => {
                      setIsOpen(false)
                      router.push(result.href)
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${idx === selectedIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{result.title}</p>
                      {result.subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{result.subtitle}</p>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{result.type}</span>
                  </button>
                )
              })}
            </div>
          ) : query ? (
            <div className="p-12 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
              Type to start searching...
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center text-xs font-medium text-slate-500">
          <span className="flex items-center"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-1 font-sans text-[10px]">↑</kbd> <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-2 font-sans text-[10px]">↓</kbd> to navigate</span>
          <span className="flex items-center ml-4"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-2 font-sans text-[10px]">↵</kbd> to select</span>
          <span className="flex items-center ml-4"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 mr-2 font-sans text-[10px]">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
