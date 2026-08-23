'use client'

import { useState, Suspense } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from './CommandPalette'
import { TopProgressBar } from './TopProgressBar'
import { MobileBottomNav } from './MobileBottomNav'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="h-screen dash-bg flex overflow-hidden">
      
      {/* Sidebar component handles mobile drawer & desktop fixed */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={isCollapsed} 
      />
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header component */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto w-full outline-none focus:outline-none scroll-smooth">
          <div className="w-full px-4 sm:px-6 py-4 pb-20 md:pb-6 min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile App Bottom Navigation Bar (iOS / Android app feel) */}
        <MobileBottomNav setSidebarOpen={setSidebarOpen} />
      </div>

      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <CommandPalette />
    </div>
  )
}
