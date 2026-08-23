'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wallet, 
  Menu,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  setSidebarOpen: (v: boolean) => void
}

export function MobileBottomNav({ setSidebarOpen }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: LayoutDashboard,
      isActive: pathname === '/'
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      isActive: pathname.startsWith('/clients')
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building2,
      isActive: pathname.startsWith('/companies')
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: Wallet,
      isActive: pathname.startsWith('/finance')
    },
    {
      name: 'Compliance',
      href: '/compliance',
      icon: ShieldCheck,
      isActive: pathname.startsWith('/compliance') || pathname.startsWith('/renewals')
    }
  ]

  return (
    <nav 
      aria-label="Mobile Application Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EAE5F2] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-90",
                active 
                  ? "text-[#5B21B6]" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div className={cn(
                "w-10 h-7 rounded-xl flex items-center justify-center transition-all duration-200",
                active 
                  ? "bg-[#EDE9FE] text-[#5B21B6] shadow-2xs" 
                  : "bg-transparent text-slate-500"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    active ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 tracking-tight font-bold transition-colors leading-tight",
                active ? "text-[#5B21B6] font-extrabold" : "text-slate-500 font-medium"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* Menu / All Portals Sheet Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-2xl text-slate-500 hover:text-[#5B21B6] transition-all cursor-pointer active:scale-90 select-none"
          aria-label="Open Full Menu"
        >
          <div className="w-10 h-7 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600">
            <Menu className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-slate-500 leading-tight">
            Menu
          </span>
        </button>

      </div>
    </nav>
  )
}
