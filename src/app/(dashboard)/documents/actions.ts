'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function uploadDocument(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  const documentType = formData.get('documentType') as string
  const entityType = formData.get('entityType') as string
  const entityId = formData.get('entityId') as string
  const expiryDate = formData.get('expiryDate') as string

  if (!title || !documentType || !entityId) {
    return { error: 'Title, Document Type, and Entity are required.' }
  }

  // MOCK FILE UPLOAD logic here (in real app, upload to S3/Local and get URL)
  const fileUrl = `/uploads/mock-document-${Date.now()}.pdf`

  try {
    const data: any = {
      title,
      documentType,
      fileUrl,
      status: 'Valid',
      version: 1,
    }

    if (expiryDate) {
      data.expiryDate = new Date(expiryDate)
    }

    if (entityType === 'company') {
      data.companyId = entityId
    } else {
      data.clientId = entityId
    }

    const document = await prisma.document.create({ data })

    await prisma.activityLog.create({
      data: {
        eventType: 'Document Uploaded',
        entityType: 'Document',
        entityId: document.id,
        description: `Uploaded document: ${title}`,
      }
    })

    // Create automated reminder if expiry date exists (Phase 5 logic)
    if (expiryDate) {
      const dueDate = new Date(expiryDate)
      const reminderDate = new Date(dueDate)
      reminderDate.setDate(reminderDate.getDate() - 30) // Remind 30 days before

      await prisma.action.create({
        data: {
          title: `Expiry Reminder: ${title}`,
          description: `Document ${title} is expiring on ${dueDate.toLocaleDateString()}`,
          actionType: 'Document Renewal',
          entityType: 'Document',
          entityId: document.id,
          clientId: data.clientId || null, // Link the action to the client if available
          dueDate: dueDate,
          status: 'Pending'
        }
      })
    }

    revalidatePath('/documents')
    return { success: true }
  } catch (error) {
    console.error('Failed to upload document:', error)
    return { error: 'Failed to upload document. Please try again.' }
  }
}
