import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalDocumentsView from './PortalDocumentsView'

export const dynamic = 'force-dynamic'

export default async function PortalDocumentsPage() {
  const { client, companies } = await getAuthenticatedPortalUser()

  const documents = await prisma.document.findMany({
    where: { clientId: client.id },
    include: {
      company: true,
      application: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const serializedDocs = documents.map((d) => ({
    id: d.id,
    title: d.title,
    documentType: d.documentType,
    fileUrl: d.fileUrl,
    verificationStatus: d.verificationStatus,
    uploadedBy: d.uploadedBy,
    rejectionReason: d.rejectionReason,
    companyName: d.company?.legalName || 'Personal',
    companyId: d.companyId,
    applicationNumber: d.application?.applicationNumber || null,
    issueDate: d.issueDate ? d.issueDate.toISOString() : null,
    expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  }))

  return (
    <PortalDocumentsView
      documents={serializedDocs}
      companies={companies}
    />
  )
}
