'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '@/lib/db'

export async function getClientPortalAccessInfo(clientId: string) {
  const portalUser = await prisma.portalUser.findFirst({
    where: { clientId },
  })

  if (!portalUser) {
    return {
      status: 'Not Invited',
      portalUser: null,
    }
  }

  return {
    status: portalUser.status,
    portalUser: {
      id: portalUser.id,
      email: portalUser.email,
      fullName: portalUser.fullName,
      status: portalUser.status,
      lastLogin: portalUser.lastLogin ? portalUser.lastLogin.toISOString() : null,
      invitationSentAt: portalUser.invitationSentAt ? portalUser.invitationSentAt.toISOString() : null,
      createdAt: portalUser.createdAt.toISOString(),
    },
  }
}

export async function enableClientPortalAccessAction(
  clientId: string,
  email: string,
  temporaryPassword?: string
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return { error: 'Client record not found.' }
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      return { error: 'A valid email address is required for portal access.' }
    }

    // Check if email is already taken by another portal user
    const existing = await prisma.portalUser.findUnique({
      where: { email: cleanEmail },
    })

    if (existing && existing.clientId !== clientId) {
      return { error: 'This email is already registered to another portal user.' }
    }

    const passwordToUse = temporaryPassword?.trim() || 'Operio@2026'
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordToUse, salt)

    let portalUser
    if (existing) {
      portalUser = await prisma.portalUser.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          status: 'Active',
          invitationSentAt: new Date(),
        },
      })
    } else {
      portalUser = await prisma.portalUser.create({
        data: {
          clientId,
          email: cleanEmail,
          fullName: client.fullName,
          passwordHash,
          status: 'Active',
          invitationSentAt: new Date(),
        },
      })
    }

    // Log Activity in Admin CRM
    await prisma.activityLog.create({
      data: {
        eventType: 'Portal Access Enabled',
        entityType: 'Client',
        entityId: clientId,
        description: `Enabled Client Portal access for ${client.fullName} (${cleanEmail}).`,
      },
    })

    revalidatePath(`/clients/${clientId}`)
    return {
      success: true,
      portalUser: {
        id: portalUser.id,
        email: portalUser.email,
        status: portalUser.status,
      },
      temporaryPassword: passwordToUse,
    }
  } catch (error: any) {
    console.error('Failed to enable portal access:', error)
    return { error: error.message || 'Failed to enable portal access.' }
  }
}

export async function togglePortalStatusAction(portalUserId: string, newStatus: 'Active' | 'Suspended') {
  try {
    const portalUser = await prisma.portalUser.update({
      where: { id: portalUserId },
      data: { status: newStatus },
      include: { client: true },
    })

    // If suspending, also kill all active sessions immediately
    if (newStatus === 'Suspended') {
      await prisma.portalSession.deleteMany({
        where: { portalUserId },
      }).catch(() => {})
    }

    await prisma.activityLog.create({
      data: {
        eventType: `Portal Access ${newStatus}`,
        entityType: 'Client',
        entityId: portalUser.clientId,
        description: `Set portal access status to ${newStatus} for ${portalUser.email}.`,
      },
    })

    revalidatePath(`/clients/${portalUser.clientId}`)
    return { success: true, status: newStatus }
  } catch (error: any) {
    return { error: error.message || 'Failed to update portal status.' }
  }
}

export async function resetPortalPasswordByAdminAction(portalUserId: string, newPassword?: string) {
  try {
    const passwordToSet = newPassword?.trim() || 'Operio@' + Math.floor(1000 + Math.random() * 9000)
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordToSet, salt)

    const portalUser = await prisma.portalUser.update({
      where: { id: portalUserId },
      data: { passwordHash },
      include: { client: true },
    })

    // Kill old sessions so user must log in with new password
    await prisma.portalSession.deleteMany({
      where: { portalUserId },
    }).catch(() => {})

    await prisma.activityLog.create({
      data: {
        eventType: 'Portal Password Reset',
        entityType: 'Client',
        entityId: portalUser.clientId,
        description: `Admin reset portal password for ${portalUser.email}.`,
      },
    })

    revalidatePath(`/clients/${portalUser.clientId}`)
    return { success: true, newPassword: passwordToSet }
  } catch (error: any) {
    return { error: error.message || 'Failed to reset password.' }
  }
}

export async function disablePortalAccessAction(portalUserId: string) {
  try {
    const portalUser = await prisma.portalUser.findUnique({
      where: { id: portalUserId },
    })

    if (!portalUser) return { error: 'Portal user not found.' }

    // Delete sessions and portal user record
    await prisma.portalSession.deleteMany({ where: { portalUserId } }).catch(() => {})
    await prisma.portalUser.delete({ where: { id: portalUserId } })

    revalidatePath(`/clients/${portalUser.clientId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to disable portal access.' }
  }
}

export async function getClientRequestsForAdminAction(clientId: string) {
  try {
    const requests = await prisma.clientRequest.findMany({
      where: { clientId },
      include: {
        company: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return {
      success: true,
      requests: requests.map((r) => ({
        id: r.id,
        requestNumber: r.requestNumber,
        category: r.category,
        subject: r.subject,
        message: r.message,
        priority: r.priority,
        status: r.status,
        companyName: r.company?.legalName || 'Personal',
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        messages: r.messages.map((m) => ({
          id: m.id,
          senderType: m.senderType,
          senderName: m.senderName,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
    }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch requests.' }
  }
}

export async function sendAdminRequestReplyAction(
  requestId: string,
  messageText: string,
  adminName = 'Operio Support'
) {
  try {
    const request = await prisma.clientRequest.findUnique({
      where: { id: requestId },
      include: { client: true },
    })

    if (!request) return { error: 'Request not found.' }

    const msg = await prisma.requestMessage.create({
      data: {
        requestId,
        senderType: 'ADMIN',
        senderName: adminName,
        message: messageText.trim(),
      },
    })

    // Update request status to Waiting for Client
    await prisma.clientRequest.update({
      where: { id: requestId },
      data: {
        status: 'Waiting for Client',
        updatedAt: new Date(),
      },
    })

    // Create Notification for the client in their portal
    if (request.portalUserId) {
      await prisma.portalNotification.create({
        data: {
          clientId: request.clientId,
          portalUserId: request.portalUserId,
          title: `Reply received: ${request.subject}`,
          message: `${adminName}: "${messageText.substring(0, 80)}..."`,
          type: 'REQUEST_UPDATE',
          relatedEntityType: 'Request',
          relatedEntityId: request.id,
        },
      })
    }

    revalidatePath(`/clients/${request.clientId}`)
    revalidatePath(`/portal/requests/${requestId}`)
    return { success: true, message: msg }
  } catch (error: any) {
    return { error: error.message || 'Failed to send reply.' }
  }
}

export async function updateClientRequestStatusAction(
  requestId: string,
  newStatus: string
) {
  try {
    const updated = await prisma.clientRequest.update({
      where: { id: requestId },
      data: { status: newStatus },
    })

    revalidatePath(`/clients/${updated.clientId}`)
    revalidatePath(`/portal/requests/${requestId}`)
    return { success: true, status: newStatus }
  } catch (error: any) {
    return { error: error.message || 'Failed to update request status.' }
  }
}
