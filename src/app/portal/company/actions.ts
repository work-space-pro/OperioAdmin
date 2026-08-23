'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser, assertCompanyAccess } from '@/lib/portalAuth'

export async function submitStructuredEntityRequestAction(data: {
  companyId: string
  requestType: 'ADD_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'ADD_PARTNER' | 'UPDATE_PARTNER' | 'ADD_VEHICLE' | 'UPDATE_VEHICLE' | 'ADD_BANK' | 'UPDATE_BANK' | 'UPDATE_COMPANY'
  targetEntityId?: string
  targetEntityName?: string
  formData: Record<string, any>
  documentUrls?: string[]
  notes?: string
}) {
  try {
    const { client, portalUser, authorizedCompanyIds } = await getAuthenticatedPortalUser()

    assertCompanyAccess(data.companyId, authorizedCompanyIds)

    const count = await prisma.clientRequest.count()
    const reqYear = new Date().getFullYear()
    const requestNumber = `REQ-${reqYear}-${String(count + 1).padStart(4, '0')}`

    let subject = ''
    let category = 'Application Support'

    switch (data.requestType) {
      case 'ADD_EMPLOYEE':
        subject = `New Staff Visa Request: ${data.formData.fullName} (${data.formData.designation || 'Staff'})`
        category = 'Application Support'
        break
      case 'UPDATE_EMPLOYEE':
        subject = `Staff Information Update: ${data.targetEntityName || data.formData.fullName}`
        category = 'Document Update'
        break
      case 'ADD_PARTNER':
        subject = `New Partner / Signatory Addition: ${data.formData.fullName}`
        category = 'Application Support'
        break
      case 'UPDATE_PARTNER':
        subject = `Partner Information Update: ${data.targetEntityName || data.formData.fullName}`
        category = 'Document Update'
        break
      case 'ADD_VEHICLE':
        subject = `Vehicle Registration Request: Plate ${data.formData.regNo}`
        category = 'Application Support'
        break
      case 'UPDATE_VEHICLE':
        subject = `Vehicle Information / Mulkiya Update: Plate ${data.formData.regNo}`
        category = 'Renewal'
        break
      case 'ADD_BANK':
        subject = `Corporate Bank Account Linking: ${data.formData.bankName}`
        category = 'Account Support'
        break
      case 'UPDATE_BANK':
        subject = `Bank Account Information Update: ${data.formData.bankName}`
        category = 'Account Support'
        break
      default:
        subject = `Company Information Update: ${data.formData.fieldToUpdate || 'General'}`
        category = 'Document Update'
    }

    // Format message description
    const formattedDetails = Object.entries(data.formData)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n')

    const message = `Client ${client.fullName} submitted a structured ${data.requestType.replace('_', ' ')} request.\n\n` +
      `Submitted Information (Pending Admin Approval):\n${formattedDetails}\n\n` +
      (data.notes ? `Client Notes: ${data.notes}\n` : '') +
      (data.documentUrls && data.documentUrls.length > 0 ? `Uploaded Documents: ${data.documentUrls.length} file(s)` : '')

    // 1. Create ClientRequest record
    const clientRequest = await prisma.clientRequest.create({
      data: {
        requestNumber,
        clientId: client.id,
        companyId: data.companyId,
        portalUserId: portalUser.id,
        category,
        subject,
        message,
        priority: 'Normal',
        status: 'Open',
      },
    })

    // 2. Initial Message
    await prisma.requestMessage.create({
      data: {
        requestId: clientRequest.id,
        senderType: 'CLIENT',
        senderName: client.fullName,
        message,
      },
    })

    // 3. Create Action Task in Admin CRM
    await prisma.action.create({
      data: {
        title: `Portal Request: ${subject}`,
        description: `Pending client submission for review & approval by Operio team.`,
        actionType: 'Task',
        clientId: client.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'Normal',
        status: 'Pending',
      },
    })

    // 4. Create Notification for client
    await prisma.portalNotification.create({
      data: {
        clientId: client.id,
        portalUserId: portalUser.id,
        title: `Request Queued: ${subject}`,
        message: `Your request (${requestNumber}) has been submitted to your Operio PRO advisor for review & authority approval.`,
        type: 'APPLICATION_STATUS',
        relatedEntityType: 'Request',
        relatedEntityId: clientRequest.id,
      },
    })

    revalidatePath('/portal/company')
    revalidatePath('/portal/requests')
    revalidatePath('/actions')
    return { success: true, requestNumber }
  } catch (error: any) {
    return { error: error.message || 'Failed to submit request.' }
  }
}
