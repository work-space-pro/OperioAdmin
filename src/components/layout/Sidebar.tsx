'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Briefcase,
  CheckSquare,
  FileText,
  RefreshCw, 
  CalendarDays,
  ShieldCheck,
  BarChart3, 
  Settings, 
  X,
  Layers,
  DollarSign,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavGroup {
  title: string
  items: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'DASHBOARD',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ]
  },
  {
    title: 'CUSTOMER',
    items: [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Companies', href: '/companies', icon: Building2 },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Finance - P&L', href: '/finance', icon: DollarSign },
      { name: 'Support & Tasks', href: '/actions', icon: MessageSquare },
      { name: 'Documents', href: '/documents', icon: FileText },
    ]
  },
  {
    title: 'COMPLIANCE',
    items: [
      { name: 'Renewals', href: '/renewals', icon: RefreshCw },
      { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
      { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
]

export function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen,
  isCollapsed
}: { 
  sidebarOpen: boolean, 
  setSidebarOpen: (v: boolean) => void,
  isCollapsed?: boolean
}) {
  const pathname = usePathname()

  const renderNavLinks = (isMobile = false) => (
    <div className="space-y-5 px-3">
      {navGroups.map((group) => (
        <div key={group.title}>
          {(!isCollapsed || isMobile) && (
            <p className="px-3 text-[10px] font-extrabold text-[#701A75] tracking-wider uppercase mb-1.5 opacity-80">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false)
                  }}
                  className={cn(
                    "group flex items-center px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer active:scale-[0.98]",
                    isActive 
                      ? "bg-[#EDE9FE] text-[#5B21B6] shadow-xs" 
                      : "text-slate-600 hover:bg-[#F5F3FF] hover:text-[#5B21B6]",
                    isCollapsed && !isMobile ? "justify-center px-2" : ""
                  )}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  <item.icon 
                    className={cn(
                      "flex-shrink-0 h-4 w-4",
                      isActive ? "text-[#5B21B6]" : "text-slate-400 group-hover:text-[#5B21B6]",
                      (!isCollapsed || isMobile) ? "mr-3" : ""
                    )} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden animate-fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200" 
            onClick={() => setSidebarOpen(false)} 
          />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-200 shadow-2xl z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-3">
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-full text-white focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 pt-5 pb-4 overflow-y-auto custom-scrollbar">
              {/* Logo */}
              <div className="flex items-center px-6 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-sm shrink-0">
                  <img src="/logo.jpg" alt="Operio" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div className="ml-3">
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-none">Operio</div>
                  <div className="text-[10px] text-[#5B21B6] font-bold mt-0.5 uppercase tracking-wider">CRM & Compliance Suite</div>
                </div>
              </div>
              {renderNavLinks(true)}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex md:flex-shrink-0 z-20 transition-all duration-200 border-r border-[#EAE5F2] bg-white",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col w-full h-screen sticky top-0">
          
          {/* Logo Header */}
          <div className={cn("h-16 flex items-center border-b border-[#EAE5F2]", isCollapsed ? "justify-center px-0" : "px-6")}>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-sm shrink-0">
              <img src="/logo.jpg" alt="Operio" className="w-full h-full object-contain rounded-lg" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <div className="text-lg font-black text-slate-900 tracking-tight leading-none">Operio</div>
                <div className="text-[10px] text-[#5B21B6] font-bold mt-0.5 uppercase tracking-wider">CRM & Compliance Suite</div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
            {renderNavLinks(false)}
          </div>

        </div>
      </aside>
    </>
  )
}
