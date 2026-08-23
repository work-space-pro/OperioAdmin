'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser, assertClientAccess } from '@/lib/portalAuth'

export async function sendApplicationMessageAction(applicationId: string, messageText: string) {
  try {
    const { client, portalUser } = await getAuthenticatedPortalUser()

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { error: 'Application not found.' }
    }

    assertClientAccess(application.clientId, client.id)

    const msg = await prisma.applicationMessage.create({
      data: {
        applicationId,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message: messageText.trim(),
      },
    })

    // Update last client activity timestamp
    await prisma.application.update({
      where: { id: applicationId },
      data: { lastClientActivityAt: new Date() },
    })

    // Create activity log for admin
    await prisma.activityLog.create({
      data: {
        eventType: 'Client Message',
        entityType: 'Application',
        entityId: applicationId,
        description: `Client ${client.fullName} sent a message on ${application.applicationNumber}: "${messageText.substring(0, 50)}..."`,
      },
    })

    revalidatePath(`/portal/applications/${applicationId}`)
    return { success: true, message: msg }
  } catch (error: any) {
    return { error: error.message || 'Failed to send message.' }
  }
}

export async function uploadApplicationDocumentAction(
  applicationId: string,
  title: string,
  documentType: string,
  fileUrl: string
) {
  try {
    const { client } = await getAuthenticatedPortalUser()

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { error: 'Application not found.' }
    }

    assertClientAccess(application.clientId, client.id)

    const doc = await prisma.document.create({
      data: {
        clientId: client.id,
        companyId: application.companyId,
        serviceId: application.serviceId,
        applicationId: application.id,
        title,
        documentType,
        fileUrl: fileUrl || '/placeholder.pdf',
        uploadedBy: 'Client',
        verificationStatus: 'Pending',
        status: 'Valid',
      },
    })

    // Create notification & message
    await prisma.applicationMessage.create({
      data: {
        applicationId,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message: `Uploaded new document: ${title} (${documentType})`,
      },
    })

    await prisma.application.update({
      where: { id: applicationId },
      data: { lastClientActivityAt: new Date() },
    })

    revalidatePath(`/portal/applications/${applicationId}`)
    return { success: true, document: doc }
  } catch (error: any) {
    return { error: error.message || 'Failed to upload document.' }
  }
}
