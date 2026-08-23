import React from 'react'
import { notFound } from 'next/navigation'
import { getAuthenticatedPortalUser, assertClientAccess } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import ApplicationDetailView from './ApplicationDetailView'

export const dynamic = 'force-dynamic'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { client } = await getAuthenticatedPortalUser()

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      company: true,
      service: true,
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!application) {
    notFound()
  }

  // Server-side security check: client can only view their own applications
  assertClientAccess(application.clientId, client.id)

  const serializedApplication = {
    id: application.id,
    applicationNumber: application.applicationNumber,
    title: application.title,
    serviceCategory: application.serviceCategory,
    serviceType: application.serviceType,
    status: application.status,
    priority: application.priority,
    description: application.description,
    contactPerson: application.contactPerson,
    contactNumber: application.contactNumber,
    preferredContact: application.preferredContact,
    submittedAt: application.submittedAt.toISOString(),
    expectedCompletion: application.expectedCompletion ? application.expectedCompletion.toISOString() : null,
    completedAt: application.completedAt ? application.completedAt.toISOString() : null,
    clientNotes: application.clientNotes,
    companyName: application.company?.legalName || 'Individual Client',
    documents: application.documents.map((d) => ({
      id: d.id,
      title: d.title,
      documentType: d.documentType,
      fileUrl: d.fileUrl,
      verificationStatus: d.verificationStatus,
      rejectionReason: d.rejectionReason,
      createdAt: d.createdAt.toISOString(),
    })),
    messages: application.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderName,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
  }

  return <ApplicationDetailView application={serializedApplication} />
}
