import prisma from '@/lib/db'

export async function getAllSupportTickets(options?: {
  status?: string
  clientId?: string
  companyId?: string
  search?: string
}) {
  const whereClause: any = {}

  if (options?.status && options.status !== 'All') {
    if (options.status === 'Open') {
      whereClause.status = { in: ['Open', 'In Progress'] }
    } else if (options.status === 'Closed') {
      whereClause.status = { in: ['Resolved', 'Closed'] }
    } else {
      whereClause.status = options.status
    }
  }

  if (options?.clientId) {
    whereClause.clientId = options.clientId
  }

  if (options?.companyId) {
    whereClause.companyId = options.companyId
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim()
    whereClause.OR = [
      { requestNumber: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
      { client: { fullName: { contains: q, mode: 'insensitive' } } },
      { company: { legalName: { contains: q, mode: 'insensitive' } } },
    ]
  }

  return prisma.clientRequest.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
        },
      },
      company: {
        select: {
          id: true,
          legalName: true,
          tradeLicenceNumber: true,
        },
      },
      portalUser: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getSupportTicketById(id: string) {
  return prisma.clientRequest.findUnique({
    where: { id },
    include: {
      client: true,
      company: true,
      portalUser: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function createClientTicket(data: {
  clientId: string
  portalUserId: string
  companyId?: string | null
  category: string
  subject: string
  message: string
  priority?: string
}) {
  const now = new Date()
  const requestNumber = `REQ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  const ticket = await prisma.clientRequest.create({
    data: {
      requestNumber,
      clientId: data.clientId,
      portalUserId: data.portalUserId,
      companyId: data.companyId || null,
      category: data.category || 'General Support',
      subject: data.subject,
      message: data.message,
      priority: data.priority || 'Normal',
      status: 'Open',
      messages: {
        create: {
          senderType: 'CLIENT',
          senderName: 'Client via Portal',
          message: data.message,
        },
      },
    },
  })

  // Create action for Admin
  await prisma.action.create({
    data: {
      title: `Client Request: ${data.subject}`,
      description: `Support Ticket #${requestNumber} logged by client.`,
      actionType: 'Support',
      priority: data.priority || 'Normal',
      status: 'Pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      clientId: data.clientId,
      entityType: data.companyId ? 'Company' : 'Client',
      entityId: data.companyId || data.clientId,
    },
  })

  return ticket
}

export async function sendChatMessage(params: {
  requestId: string
  senderType: 'CLIENT' | 'ADMIN'
  senderName: string
  message: string
}) {
  const { requestId, senderType, senderName, message } = params
  if (!message.trim()) throw new Error('Message cannot be empty')

  const request = await prisma.clientRequest.findUnique({
    where: { id: requestId },
    include: { client: true, portalUser: true },
  })

  if (!request) throw new Error('Ticket not found')

  const msg = await prisma.requestMessage.create({
    data: {
      requestId,
      senderType,
      senderName,
      message: message.trim(),
    },
  })

  // Update status & timestamp
  await prisma.clientRequest.update({
    where: { id: requestId },
    data: {
      status: request.status === 'Open' ? 'In Progress' : request.status,
      updatedAt: new Date(),
    },
  })

  // Create notification if ADMIN replies to CLIENT
  if (senderType === 'ADMIN') {
    await prisma.portalNotification.create({
      data: {
        clientId: request.clientId,
        portalUserId: request.portalUserId,
        title: `Response to ${request.requestNumber}`,
        message: message.length > 90 ? `${message.substring(0, 90)}...` : message,
        type: 'REQUEST_UPDATE',
        relatedEntityType: 'Request',
        relatedEntityId: requestId,
      },
    })
  }

  return msg
}

export async function updateTicketStatus(requestId: string, status: string) {
  const updated = await prisma.clientRequest.update({
    where: { id: requestId },
    data: { status },
    include: { client: true, portalUser: true },
  })

  if (status === 'Resolved' || status === 'Closed') {
    await prisma.portalNotification.create({
      data: {
        clientId: updated.clientId,
        portalUserId: updated.portalUserId,
        title: `Ticket ${status}: ${updated.requestNumber}`,
        message: `Your support request "${updated.subject}" has been marked as ${status}.`,
        type: 'REQUEST_UPDATE',
        relatedEntityType: 'Request',
        relatedEntityId: requestId,
      },
    })
  }

  return updated
}

export async function getUnreadTicketCounts() {
  const unreadAdminCount = await prisma.clientRequest.count({
    where: {
      status: { in: ['Open', 'In Progress'] },
      messages: {
        some: {
          senderType: 'CLIENT',
        },
      },
    },
  })

  return { unreadAdminCount }
}
