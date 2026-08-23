'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  RefreshCw,
  HelpCircle,
  Bell,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { PortalProvider, PortalCompany, PortalUser, PortalClient } from './PortalContext'
import PortalSidebar from './PortalSidebar'
import PortalHeader from './PortalHeader'
import PortalMobileBottomNav from './PortalMobileBottomNav'
import PortalNotificationModal from './PortalNotificationModal'

const MOBILE_MENU_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/company', label: 'My Company', icon: Building2 },
  { href: '/portal/applications', label: 'My Applications', icon: FolderKanban },
  { href: '/portal/documents', label: 'My Documents', icon: FileText },
  { href: '/portal/renewals', label: 'Renewals', icon: RefreshCw },
  { href: '/portal/requests', label: 'Requests & Support', icon: HelpCircle },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell },
  { href: '/portal/profile', label: 'My Profile', icon: UserCircle },
]

export default function PortalLayoutClient({
  children,
  initialUser,
  initialClient,
  initialCompanies,
  initialUnreadCount,
  unreadNotifications = [],
}: {
  children: React.ReactNode
  initialUser: PortalUser
  initialClient: PortalClient
  initialCompanies: PortalCompany[]
  initialUnreadCount: number
  unreadNotifications?: any[]
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <PortalProvider
      initialUser={initialUser}
      initialClient={initialClient}
      initialCompanies={initialCompanies}
      initialUnreadCount={initialUnreadCount}
    >
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased">
        {/* Desktop Sidebar */}
        <PortalSidebar />

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white p-4 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5B21B6] text-white font-black text-xs flex items-center justify-center">
                      OP
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900">OPERIO</h2>
                      <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">
                        {initialClient.fullName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {MOBILE_MENU_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#5B21B6] text-white'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-[#5B21B6]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href="/api/portal/auth/logout"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
          <PortalHeader onToggleMobileNav={() => setMobileMenuOpen(true)} />
          <main className="flex-1 px-3 sm:px-6 py-4 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <PortalMobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

        {/* Notification / Admin Reply Popup Modal */}
        <PortalNotificationModal notifications={unreadNotifications} />
      </div>
    </PortalProvider>
  )
}
