'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'

export async function markNotificationReadAction(notificationId: string) {
  try {
    const { client } = await getAuthenticatedPortalUser()

    await prisma.portalNotification.updateMany({
      where: {
        id: notificationId,
        clientId: client.id,
      },
      data: { isRead: true },
    })

    revalidatePath('/portal')
    revalidatePath('/portal/notifications')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update notification.' }
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const { client } = await getAuthenticatedPortalUser()

    await prisma.portalNotification.updateMany({
      where: { clientId: client.id },
      data: { isRead: true },
    })

    revalidatePath('/portal')
    revalidatePath('/portal/notifications')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to mark notifications read.' }
  }
}
