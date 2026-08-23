import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalRequestsView from './PortalRequestsView'

export const dynamic = 'force-dynamic'

export default async function PortalRequestsPage() {
  const { client, companies } = await getAuthenticatedPortalUser()

  const requests = await prisma.clientRequest.findMany({
    where: { clientId: client.id },
    include: {
      company: true,
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const serializedRequests = requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    category: r.category,
    subject: r.subject,
    message: r.message,
    priority: r.priority,
    status: r.status,
    companyName: r.company?.legalName || 'Personal',
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    lastMessage: r.messages[0] ? r.messages[0].message : r.message,
    lastSender: r.messages[0] ? r.messages[0].senderName : client.fullName,
  }))

  return (
    <PortalRequestsView
      requests={serializedRequests}
      companies={companies}
    />
  )
}
