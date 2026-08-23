'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'

export async function requestRenewalAction(renewalItem: {
  title: string
  type: string
  companyId?: string
  expiryDate?: string
}) {
  try {
    const { client, portalUser } = await getAuthenticatedPortalUser()

    // 1. Create a ClientRequest (Support ticket) for this renewal
    const count = await prisma.clientRequest.count()
    const reqYear = new Date().getFullYear()
    const requestNumber = `REQ-${reqYear}-${String(count + 1).padStart(4, '0')}`

    const clientRequest = await prisma.clientRequest.create({
      data: {
        requestNumber,
        clientId: client.id,
        companyId: renewalItem.companyId || null,
        portalUserId: portalUser.id,
        category: 'Renewal',
        subject: `Renewal Request: ${renewalItem.title}`,
        message: `Client requested urgent renewal for ${renewalItem.type}. Expiry Date: ${renewalItem.expiryDate || 'N/A'}.`,
        priority: 'High',
        status: 'Open',
      },
    })

    // 2. Create an Action in Admin CRM
    await prisma.action.create({
      data: {
        title: `Portal Renewal: ${renewalItem.title}`,
        description: `Client ${client.fullName} requested renewal through portal.`,
        actionType: 'Renewal follow-up',
        clientId: client.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
        priority: 'High',
        status: 'Pending',
      },
    })

    // 3. Create Notification for client
    await prisma.portalNotification.create({
      data: {
        clientId: client.id,
        portalUserId: portalUser.id,
        title: `Renewal Request Logged: ${renewalItem.title}`,
        message: `Your renewal request has been queued. Our PRO team will contact you shortly with the required documents and fee quotation.`,
        type: 'RENEWAL_DUE',
        relatedEntityType: 'Request',
        relatedEntityId: clientRequest.id,
      },
    })

    revalidatePath('/portal/renewals')
    revalidatePath('/renewals')
    return { success: true, requestNumber }
  } catch (error: any) {
    return { error: error.message || 'Failed to submit renewal request.' }
  }
}
