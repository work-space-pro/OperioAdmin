import React from 'react'
import { notFound } from 'next/navigation'
import { getAuthenticatedPortalUser, assertClientAccess } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import RequestDetailView from './RequestDetailView'

export const dynamic = 'force-dynamic'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { client } = await getAuthenticatedPortalUser()

  const request = await prisma.clientRequest.findUnique({
    where: { id },
    include: {
      company: true,
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!request) {
    notFound()
  }

  assertClientAccess(request.clientId, client.id)

  const serializedRequest = {
    id: request.id,
    requestNumber: request.requestNumber,
    category: request.category,
    subject: request.subject,
    message: request.message,
    priority: request.priority,
    status: request.status,
    companyName: request.company?.legalName || 'Personal Profile',
    createdAt: request.createdAt.toISOString(),
    messages: request.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderName,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
  }

  return <RequestDetailView request={serializedRequest} />
}
