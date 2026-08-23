'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  RefreshCw,
  HelpCircle,
  Bell,
  UserCircle,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { usePortal } from './PortalContext'

const NAV_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/portal/company', label: 'My Company', icon: Building2 },
  { href: '/portal/applications', label: 'My Applications', icon: FolderKanban },
  { href: '/portal/documents', label: 'My Documents', icon: FileText },
  { href: '/portal/renewals', label: 'Renewals', icon: RefreshCw },
  { href: '/portal/requests', label: 'Requests & Support', icon: HelpCircle, badge: true },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell, badge: true },
  { href: '/portal/profile', label: 'Profile', icon: UserCircle },
]

export default function PortalSidebar() {
  const pathname = usePathname()
  const { user, client, unreadNotificationsCount } = usePortal()

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen p-4 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#5B21B6] flex items-center justify-center shadow-md shadow-purple-900/10 text-white font-black text-base">
          OP
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">OPERIO</h2>
            <span className="bg-purple-100 text-[#5B21B6] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
              PORTAL
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]">
            {client.fullName}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#5B21B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#5B21B6] hover:bg-purple-50/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#5B21B6]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && unreadNotificationsCount > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom User Info & Logout */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5B21B6] font-bold text-xs flex items-center justify-center flex-shrink-0">
            {client.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{client.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <a
          href="/api/portal/auth/logout"
          title="Sign Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </a>
      </div>
    </aside>
  )
}
