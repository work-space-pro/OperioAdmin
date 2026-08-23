import React from 'react'
import { verifyPortalSession } from '@/lib/portalSession'
import prisma from '@/lib/db'
import PortalLayoutClient from '@/components/portal/PortalLayout'

export const dynamic = 'force-dynamic'

export default async function PortalRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifyPortalSession()

  // If no session exists (e.g. login / forgot-password / reset-password), render children directly
  if (!session || !session.portalUser || !session.portalUser.client) {
    return <>{children}</>
  }

  const { portalUser } = session
  const { client } = portalUser
  const companies = client.companies || []

  // Fetch unread notifications
  const unreadNotifications = await prisma.portalNotification.findMany({
    where: {
      clientId: client.id,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }).catch(() => [])

  const serializedUser = {
    id: portalUser.id,
    clientId: portalUser.clientId,
    email: portalUser.email,
    fullName: portalUser.fullName || client.fullName,
    status: portalUser.status,
    lastLogin: portalUser.lastLogin ? portalUser.lastLogin.toISOString() : null,
  }

  const serializedClient = {
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    mobileNumber: client.mobileNumber,
    whatsappNumber: client.whatsappNumber,
    nationality: client.nationality,
    clientType: client.clientType,
    address: client.address,
  }

  const serializedCompanies = companies.map((c) => ({
    id: c.id,
    legalName: c.legalName,
    tradeName: c.tradeName,
    tradeLicenceNumber: c.tradeLicenceNumber,
    licenceExpiryDate: c.licenceExpiryDate ? c.licenceExpiryDate.toISOString() : null,
    businessActivity: c.businessActivity,
    estCardNumber: c.estCardNumber,
    vatTrn: c.vatTrn,
    corporateTaxRegNumber: c.corporateTaxRegNumber,
    companyEmail: c.companyEmail,
    companyMobile: c.companyMobile,
    registeredAddress: c.registeredAddress,
    status: c.status,
  }))

  const serializedNotifications = unreadNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    createdAt: n.createdAt.toISOString(),
    isRead: n.isRead,
  }))

  return (
    <PortalLayoutClient
      initialUser={serializedUser}
      initialClient={serializedClient}
      initialCompanies={serializedCompanies}
      initialUnreadCount={unreadNotifications.length}
      unreadNotifications={serializedNotifications}
    >
      {children}
    </PortalLayoutClient>
  )
}
