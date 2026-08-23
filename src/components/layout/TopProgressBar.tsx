'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function TopProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // When path or search parameters finish changing, reset the loader
    setIsNavigating(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.href && !target.hasAttribute('download') && target.target !== '_blank') {
        try {
          const currentUrl = new URL(window.location.href)
          const targetUrl = new URL(target.href, window.location.href)

          // Only trigger for internal links to a different page/search
          if (
            targetUrl.origin === currentUrl.origin &&
            (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
          ) {
            setIsNavigating(true)
          }
        } catch {
          // ignore invalid URLs
        }
      }
    }

    document.addEventListener('click', handleGlobalClick, { capture: true })
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true })
  }, [])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full w-full bg-gradient-to-r from-[#7C3AED] via-[#C084FC] to-[#EC4899] animate-top-loader shadow-[0_0_12px_#A855F7]" />
    </div>
  )
}
