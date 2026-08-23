'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser, assertCompanyAccess } from '@/lib/portalAuth'

export async function uploadPortalDocumentAction(data: {
  title: string
  documentType: string
  companyId?: string
  issueDate?: string
  expiryDate?: string
  fileUrl?: string
}) {
  try {
    const { client, authorizedCompanyIds } = await getAuthenticatedPortalUser()

    if (data.companyId) {
      assertCompanyAccess(data.companyId, authorizedCompanyIds)
    }

    const doc = await prisma.document.create({
      data: {
        clientId: client.id,
        companyId: data.companyId || null,
        title: data.title,
        documentType: data.documentType,
        fileUrl: data.fileUrl || '/placeholder.pdf',
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        uploadedBy: 'Client',
        verificationStatus: 'Pending',
        status: data.expiryDate && new Date(data.expiryDate) < new Date() ? 'Expired' : 'Valid',
      },
    })

    // Log Activity for Admin CRM
    await prisma.activityLog.create({
      data: {
        eventType: 'Portal Document Upload',
        entityType: 'Document',
        entityId: doc.id,
        description: `Client ${client.fullName} uploaded document: ${doc.title} (${doc.documentType})`,
      },
    })

    revalidatePath('/portal/documents')
    revalidatePath('/documents')
    return { success: true, document: doc }
  } catch (error: any) {
    return { error: error.message || 'Failed to upload document.' }
  }
}
