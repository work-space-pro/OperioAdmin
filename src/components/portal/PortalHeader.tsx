'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  ChevronDown,
  Bell,
  Check,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { usePortal } from './PortalContext'

export default function PortalHeader({ onToggleMobileNav }: { onToggleMobileNav?: () => void }) {
  const { client, user, companies, activeCompany, setActiveCompanyId, unreadNotificationsCount } = usePortal()
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Brand & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#5B21B6] text-white font-black text-xs flex items-center justify-center">
              OP
            </div>
            <span className="text-xs font-black text-slate-900">PORTAL</span>
          </div>

          {/* Company Switcher (Visible on both desktop and tablet/mobile) */}
          {companies.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-all text-xs font-bold text-slate-800 cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-md bg-purple-100 text-[#5B21B6] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <span className="max-w-[150px] sm:max-w-[220px] truncate text-left">
                  {activeCompany ? activeCompany.legalName : 'Select Company'}
                </span>
                {companies.length > 1 && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {showCompanyMenu && companies.length > 1 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCompanyMenu(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Authorized Companies ({companies.length})
                    </p>
                    <div className="space-y-0.5 max-h-60 overflow-y-auto">
                      {companies.map((company) => {
                        const isSelected = activeCompany?.id === company.id
                        return (
                          <button
                            key={company.id}
                            onClick={() => {
                              setActiveCompanyId(company.id)
                              setShowCompanyMenu(false)
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                              isSelected
                                ? 'bg-purple-50 text-[#5B21B6]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="truncate">{company.legalName}</p>
                              {company.tradeLicenceNumber && (
                                <p className="text-[10px] font-semibold text-slate-400">
                                  TL: {company.tradeLicenceNumber}
                                </p>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#5B21B6] flex-shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick New Application Button */}
          <Link
            href="/portal/applications/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#5B21B6] hover:bg-[#4C1D95] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Start Application</span>
          </Link>

          {/* Notifications Bell */}
          <Link
            href="/portal/notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#5B21B6] hover:bg-purple-50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-purple-100 text-[#5B21B6] font-bold text-xs flex items-center justify-center">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {client.fullName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{client.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/portal/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#5B21B6] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <a
                    href="/api/portal/auth/logout"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
