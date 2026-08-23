import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalNotificationsView from './PortalNotificationsView'

export const dynamic = 'force-dynamic'

export default async function PortalNotificationsPage() {
  const { client } = await getAuthenticatedPortalUser()

  const notifications = await prisma.portalNotification.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }))

  return <PortalNotificationsView notifications={serialized} />
}
