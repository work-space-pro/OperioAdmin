'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser, assertCompanyAccess } from '@/lib/portalAuth'

export async function submitNewApplicationAction(payload: {
  companyId?: string
  serviceCategory: string
  serviceType: string
  title: string
  description?: string
  contactPerson?: string
  contactNumber?: string
  preferredContact?: string
  clientNotes?: string
  uploadedDocs?: Array<{
    title: string
    documentType: string
    fileUrl: string
  }>
}) {
  try {
    const { client, portalUser, authorizedCompanyIds } = await getAuthenticatedPortalUser()

    if (payload.companyId) {
      assertCompanyAccess(payload.companyId, authorizedCompanyIds)
    }

    // Generate unique Application Number
    const count = await prisma.application.count()
    const appYear = new Date().getFullYear()
    const applicationNumber = `APP-${appYear}-${String(count + 1).padStart(4, '0')}`

    // 1. Create or link corresponding Service in the CRM database
    const crmService = await prisma.service.create({
      data: {
        clientId: client.id,
        companyId: payload.companyId || null,
        category: payload.serviceCategory,
        name: payload.serviceType,
        description: payload.description || payload.title,
        status: 'In Progress',
        priority: 'Normal',
        paymentStatus: 'Unpaid',
      },
    })

    // 2. Create Application record
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        clientId: client.id,
        companyId: payload.companyId || null,
        serviceId: crmService.id,
        portalUserId: portalUser.id,
        title: payload.title || `${payload.serviceType} Application`,
        serviceCategory: payload.serviceCategory,
        serviceType: payload.serviceType,
        status: 'Submitted',
        priority: 'Normal',
        description: payload.description,
        contactPerson: payload.contactPerson || client.fullName,
        contactNumber: payload.contactNumber || client.mobileNumber,
        preferredContact: payload.preferredContact || 'Email',
        applicationSource: 'PORTAL',
        lastClientActivityAt: new Date(),
        clientNotes: payload.clientNotes,
      },
    })

    // 3. Save any uploaded documents
    if (payload.uploadedDocs && payload.uploadedDocs.length > 0) {
      for (const doc of payload.uploadedDocs) {
        await prisma.document.create({
          data: {
            clientId: client.id,
            companyId: payload.companyId || null,
            serviceId: crmService.id,
            applicationId: application.id,
            title: doc.title,
            documentType: doc.documentType || 'Other',
            fileUrl: doc.fileUrl || '/placeholder.pdf',
            uploadedBy: 'Client',
            verificationStatus: 'Pending',
            status: 'Valid',
          },
        })
      }
    }

    // 4. Create an initial message/log
    await prisma.applicationMessage.create({
      data: {
        applicationId: application.id,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message: `Application submitted via Client Portal: ${payload.title}`,
      },
    })

    // 5. Create ActivityLog in CRM so admin staff sees it immediately
    await prisma.activityLog.create({
      data: {
        eventType: 'Portal Application Submitted',
        entityType: 'Application',
        entityId: application.id,
        description: `${client.fullName} submitted new application ${applicationNumber}: ${application.title}`,
      },
    })

    // 6. Create Portal Notification for the client
    await prisma.portalNotification.create({
      data: {
        clientId: client.id,
        portalUserId: portalUser.id,
        title: `Application ${applicationNumber} Received`,
        message: `Your request for "${payload.title}" has been received and is queued for processing.`,
        type: 'APPLICATION_STATUS',
        relatedEntityType: 'Application',
        relatedEntityId: application.id,
      },
    })

    revalidatePath('/portal')
    revalidatePath('/portal/applications')
    revalidatePath('/clients')

    return { success: true, applicationId: application.id, applicationNumber }
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return { error: error.message || 'Failed to submit application. Please try again.' }
  }
}
