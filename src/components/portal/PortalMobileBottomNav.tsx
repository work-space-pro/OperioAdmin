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
  UserCircle,
  Menu,
} from 'lucide-react'
import { usePortal } from './PortalContext'

export default function PortalMobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname()
  const { unreadNotificationsCount } = usePortal()

  const items = [
    { href: '/portal', label: 'Home', icon: LayoutDashboard, exact: true },
    { href: '/portal/company', label: 'Company', icon: Building2 },
    { href: '/portal/applications', label: 'Apps', icon: FolderKanban },
    { href: '/portal/documents', label: 'Docs', icon: FileText },
    { href: '/portal/renewals', label: 'Renewals', icon: RefreshCw },
    { href: '#menu', label: 'Menu', icon: Menu, isMenu: true },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-6 items-center">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : !item.isMenu && pathname.startsWith(item.href)

          if (item.isMenu) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenMenu}
                className="flex flex-col items-center justify-center py-1.5 px-1 text-slate-500 hover:text-[#5B21B6] transition-colors relative"
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="text-[10px] font-bold mt-1 tracking-tight">Menu</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#5B21B6] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-purple-100' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5B21B6]' : ''}`} />
              </div>
              <span className="text-[10px] font-bold mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
