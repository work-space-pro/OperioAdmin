'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser, assertClientAccess } from '@/lib/portalAuth'

export async function createSupportRequestAction(data: {
  category: string
  subject: string
  message: string
  priority?: string
  companyId?: string
}) {
  try {
    const { client, portalUser } = await getAuthenticatedPortalUser()

    const count = await prisma.clientRequest.count()
    const reqYear = new Date().getFullYear()
    const requestNumber = `REQ-${reqYear}-${String(count + 1).padStart(4, '0')}`

    const request = await prisma.clientRequest.create({
      data: {
        requestNumber,
        clientId: client.id,
        companyId: data.companyId || null,
        portalUserId: portalUser.id,
        category: data.category,
        subject: data.subject,
        message: data.message,
        priority: data.priority || 'Normal',
        status: 'Open',
      },
    })

    // Initial message
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message: data.message,
      },
    })

    // Log Activity for Admin
    await prisma.activityLog.create({
      data: {
        eventType: 'Support Request Opened',
        entityType: 'Request',
        entityId: request.id,
        description: `Client ${client.fullName} opened ticket ${requestNumber}: "${data.subject}"`,
      },
    })

    revalidatePath('/portal/requests')
    return { success: true, requestId: request.id, requestNumber }
  } catch (error: any) {
    return { error: error.message || 'Failed to open support request.' }
  }
}

export async function sendRequestMessageAction(requestId: string, messageText: string) {
  try {
    const { client } = await getAuthenticatedPortalUser()

    const request = await prisma.clientRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return { error: 'Request not found.' }
    }

    assertClientAccess(request.clientId, client.id)

    const msg = await prisma.requestMessage.create({
      data: {
        requestId,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message: messageText.trim(),
      },
    })

    // If request was waiting for client, change status to In Progress
    if (request.status === 'Waiting for Client') {
      await prisma.clientRequest.update({
        where: { id: requestId },
        data: { status: 'In Progress' },
      })
    }

    revalidatePath(`/portal/requests/${requestId}`)
    return { success: true, message: msg }
  } catch (error: any) {
    return { error: error.message || 'Failed to send message.' }
  }
}
