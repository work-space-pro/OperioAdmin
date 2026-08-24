'use server'

import { revalidatePath } from 'next/cache'
import {
  toggleActionStatus,
  sendChatMessage,
  updateTicketStatus,
  getUnreadTicketCounts,
} from '@/services'
import prisma from '@/lib/db'

export async function toggleGlobalActionStatus(actionId: string, currentStatus: string) {
  try {
    const updated = await toggleActionStatus(actionId, currentStatus)
    revalidatePath('/actions')
    revalidatePath('/clients')
    return { success: true, newStatus: updated.status }
  } catch (error: any) {
    return { error: error.message || 'Failed to update action status' }
  }
}

export async function sendAdminGlobalReplyAction(requestId: string, messageText: string) {
  try {
    const msg = await sendChatMessage({
      requestId,
      senderType: 'ADMIN',
      senderName: 'Operio Support Team',
      message: messageText,
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
    const updated = await updateTicketStatus(requestId, status)
    revalidatePath('/actions')
    revalidatePath('/portal/requests')
    return { success: true, status: updated.status }
  } catch (error: any) {
    return { error: error.message || 'Failed to update request status' }
  }
}

export async function getGlobalSupportCounts() {
  try {
    const { unreadAdminCount } = await getUnreadTicketCounts()
    const pendingTasksCount = await prisma.action.count({
      where: { status: { not: 'Completed' } },
    })

    return {
      unreadRequestsCount: unreadAdminCount,
      pendingTasksCount,
      totalPending: unreadAdminCount + pendingTasksCount,
    }
  } catch {
    return { unreadRequestsCount: 0, pendingTasksCount: 0, totalPending: 0 }
  }
}
