import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalApplicationsView from './PortalApplicationsView'

export const dynamic = 'force-dynamic'

export default async function PortalApplicationsPage() {
  const { client } = await getAuthenticatedPortalUser()

  const applications = await prisma.application.findMany({
    where: { clientId: client.id },
    include: {
      company: true,
      service: true,
      documents: true,
      messages: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const serializedApplications = applications.map((a) => ({
    id: a.id,
    applicationNumber: a.applicationNumber,
    title: a.title,
    serviceCategory: a.serviceCategory,
    serviceType: a.serviceType,
    status: a.status,
    priority: a.priority,
    description: a.description,
    companyName: a.company?.legalName || 'Individual Client',
    companyId: a.companyId,
    submittedAt: a.submittedAt.toISOString(),
    expectedCompletion: a.expectedCompletion ? a.expectedCompletion.toISOString() : null,
    completedAt: a.completedAt ? a.completedAt.toISOString() : null,
    clientNotes: a.clientNotes,
    documentsCount: a.documents.length,
    messagesCount: a.messages.filter(m => !m.isInternal).length,
  }))

  return <PortalApplicationsView applications={serializedApplications} />
}
