'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface PortalCompany {
  id: string
  legalName: string
  tradeName: string | null
  tradeLicenceNumber: string | null
  licenceExpiryDate: string | null
  businessActivity: string | null
  estCardNumber: string | null
  vatTrn: string | null
  corporateTaxRegNumber: string | null
  companyEmail: string | null
  companyMobile: string | null
  registeredAddress: string | null
  status: string
}

export interface PortalUser {
  id: string
  clientId: string
  email: string
  fullName: string | null
  status: string
  lastLogin: string | null
}

export interface PortalClient {
  id: string
  fullName: string
  email: string | null
  mobileNumber: string | null
  whatsappNumber: string | null
  nationality: string | null
  clientType: string
  address: string | null
}

interface PortalContextType {
  user: PortalUser
  client: PortalClient
  companies: PortalCompany[]
  activeCompany: PortalCompany | null
  setActiveCompanyId: (id: string) => void
  unreadNotificationsCount: number
  setUnreadNotificationsCount: (count: number) => void
}

const PortalContext = createContext<PortalContextType | undefined>(undefined)

export function PortalProvider({
  children,
  initialUser,
  initialClient,
  initialCompanies,
  initialUnreadCount = 0,
}: {
  children: React.ReactNode
  initialUser: PortalUser
  initialClient: PortalClient
  initialCompanies: PortalCompany[]
  initialUnreadCount?: number
}) {
  const [companies] = useState<PortalCompany[]>(initialCompanies)
  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`operio_portal_active_co_${initialClient.id}`)
      if (saved && initialCompanies.some(c => c.id === saved)) return saved
    }
    return initialCompanies[0]?.id || ''
  })

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount)

  const setActiveCompanyId = (id: string) => {
    setActiveCompanyIdState(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`operio_portal_active_co_${initialClient.id}`, id)
    }
  }

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || null

  return (
    <PortalContext.Provider
      value={{
        user: initialUser,
        client: initialClient,
        companies,
        activeCompany,
        setActiveCompanyId,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
      }}
    >
      {children}
    </PortalContext.Provider>
  )
}

export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider')
  }
  return context
}
