'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, Menu, Search, User, Settings, Check } from 'lucide-react'

export function Header({ 
  setSidebarOpen, 
  isCollapsed, 
  setIsCollapsed 
}: { 
  setSidebarOpen: (v: boolean) => void,
  isCollapsed: boolean,
  setIsCollapsed: (v: boolean) => void
}) {
  const pathname = usePathname()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [username] = useState('Admin Team')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/login'
  }

  return (
    <header className="relative z-20 flex-shrink-0 flex h-16 bg-white border-b border-[#EAE5F2] px-3 sm:px-4 md:px-8 justify-between items-center">
      
      {/* Left side: Hamburger & Admin Pill */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="p-2 -ml-1 text-slate-600 hover:text-[#5B21B6] md:hidden rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Mobile Brand Title */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs">
            <img 
              src="/logo.jpg" 
              alt="Operio" 
              className="w-full h-full object-contain rounded-md"
              onError={(e) => { e.currentTarget.src = '/logo.png' }}
            />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">Operio</span>
        </div>

        {/* Desktop collapse toggle */}
        <button 
          className="hidden md:flex p-2 text-slate-400 hover:text-[#5B21B6] rounded-xl hover:bg-[#F5F3FF] transition-colors cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* User Role Badge Pill */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#F3E8FF] border border-[#DDD6FE] text-[#5B21B6] px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
          <User className="w-3.5 h-3.5 text-[#5B21B6]" />
          <span>Admin (Management)</span>
        </div>
      </div>

      {/* Right side: Bell, Online Badge, Search Box, User Avatar */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 md:space-x-4">
        
        {/* Mobile search trigger button */}
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-command-palette'))
          }}
          className="p-2 text-slate-500 hover:text-[#5B21B6] md:hidden rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-[#5B21B6] hover:bg-[#F5F3FF] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* Status Pill Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </div>

        {/* Portals Search Input (Desktop) */}
        <div 
          className="relative hidden md:block cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-command-palette'))
          }}
        >
          <input
            type="text"
            readOnly
            placeholder="Portals / Search..."
            className="w-44 lg:w-64 pl-3.5 pr-9 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none cursor-pointer transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none group p-1 rounded-full hover:ring-2 hover:ring-[#DDD6FE] transition-all min-h-[40px] min-w-[40px] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] text-white flex items-center justify-center text-xs font-black shadow-xs">
              AD
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EDE8F3] py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{username}</p>
                <p className="text-[11px] text-slate-500">Administration Management</p>
              </div>
              <Link 
                href="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F5F3FF] hover:text-[#5B21B6] transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  )
}
