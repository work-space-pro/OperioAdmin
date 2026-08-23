'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function toggleGlobalActionStatus(actionId: string, currentStatus: string) {
  try {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    await prisma.action.update({
      where: { id: actionId },
      data: { status: nextStatus },
    })

    revalidatePath('/actions')
    revalidatePath('/clients')
    return { success: true, newStatus: nextStatus }
  } catch (error: any) {
    return { error: error.message || 'Failed to update action status' }
  }
}

export async function sendAdminGlobalReplyAction(requestId: string, messageText: string) {
  try {
    if (!messageText.trim()) throw new Error('Message cannot be empty')

    const request = await prisma.clientRequest.findUnique({
      where: { id: requestId },
      include: { client: true, portalUser: true },
    })

    if (!request) throw new Error('Request ticket not found')

    // 1. Create message
    const msg = await prisma.requestMessage.create({
      data: {
        requestId,
        senderType: 'ADMIN',
        senderName: 'Operio Support Team',
        message: messageText.trim(),
      },
    })

    // 2. Update request status to In Progress / Updated
    await prisma.clientRequest.update({
      where: { id: requestId },
      data: {
        status: request.status === 'Open' ? 'In Progress' : request.status,
        updatedAt: new Date(),
      },
    })

    // 3. Create Portal Notification for client
    await prisma.portalNotification.create({
      data: {
        clientId: request.clientId,
        portalUserId: request.portalUserId,
        title: `Response to ${request.requestNumber}`,
        message: messageText.length > 90 ? `${messageText.substring(0, 90)}...` : messageText,
        type: 'REQUEST_UPDATE',
        relatedEntityType: 'Request',
        relatedEntityId: requestId,
      },
    })

    revalidatePath('/actions')
    revalidatePath('/portal/requests')
    revalidatePath(`/portal/requests/${requestId}`)
    return { success: true, message: msg }
  } catch (error: any) {
    return { error: error.message || 'Failed to send reply' }
  }
}

export async function updateRequestStatusByAdminAction(requestId: string, status: string) {
  try {
    const updated = await prisma.clientRequest.update({
      where: { id: requestId },
      data: { status },
      include: { client: true, portalUser: true },
    })

    // Notify client if resolved or closed
    if (status === 'Resolved' || status === 'Closed') {
      await prisma.portalNotification.create({
        data: {
          clientId: updated.clientId,
          portalUserId: updated.portalUserId,
          title: `Ticket ${status}: ${updated.requestNumber}`,
          message: `Your support request "${updated.subject}" has been marked as ${status}.`,
          type: 'REQUEST_UPDATE',
          relatedEntityType: 'Request',
          relatedEntityId: requestId,
        },
      })
    }

    revalidatePath('/actions')
    revalidatePath('/portal/requests')
    return { success: true, status }
  } catch (error: any) {
    return { error: error.message || 'Failed to update request status' }
  }
}

export async function getGlobalSupportCounts() {
  try {
    const unreadAdminRequestsCount = await prisma.clientRequest.count({
      where: {
        status: { in: ['Open', 'In Progress'] },
        messages: {
          some: {
            senderType: 'CLIENT',
          },
        },
      },
    })

    const pendingTasksCount = await prisma.action.count({
      where: { status: { not: 'Completed' } },
    })

    return {
      unreadRequestsCount: unreadAdminRequestsCount,
      pendingTasksCount,
      totalPending: unreadAdminRequestsCount + pendingTasksCount,
    }
  } catch {
    return { unreadRequestsCount: 0, pendingTasksCount: 0, totalPending: 0 }
  }
}
