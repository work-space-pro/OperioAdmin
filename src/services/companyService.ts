import prisma from '@/lib/db'

export interface GetCompaniesOptions {
  search?: string
  status?: string
  zoneType?: string
  limit?: number
  offset?: number
}

export async function getAllCompanies(options: GetCompaniesOptions = {}) {
  const { search, status, zoneType, limit, offset } = options

  const whereClause: any = {}

  if (status && status !== 'All') {
    whereClause.status = status
  }

  if (zoneType && zoneType !== 'All') {
    whereClause.zoneType = zoneType
  }

  if (search && search.trim()) {
    const q = search.trim()
    whereClause.OR = [
      { legalName: { contains: q, mode: 'insensitive' } },
      { tradeLicenceNumber: { contains: q, mode: 'insensitive' } },
      { estCardNumber: { contains: q, mode: 'insensitive' } },
      { client: { fullName: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
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
        personnel: true,
        employees: true,
        vehicles: true,
        bankAccounts: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.company.count({ where: whereClause }),
  ])

  return { companies, totalCount }
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      client: true,
      personnel: true,
      employees: true,
      vehicles: true,
      bankAccounts: true,
      documents: true,
      vatFilings: true,
      clientRequests: {
        include: {
          messages: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createCompany(data: any) {
  return prisma.company.create({
    data,
  })
}

export async function updateCompany(id: string, data: any) {
  return prisma.company.update({
    where: { id },
    data,
  })
}

export async function submitStructuredEntityRequest(params: {
  clientId: string
  portalUserId: string
  companyId: string
  entityType: 'PERSONNEL' | 'EMPLOYEE' | 'VEHICLE' | 'BANK_ACCOUNT'
  operationType: 'ADD' | 'UPDATE'
  targetEntityId?: string
  entityData: Record<string, any>
}) {
  const {
    clientId,
    portalUserId,
    companyId,
    entityType,
    operationType,
    targetEntityId,
    entityData,
  } = params

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) throw new Error('Company record not found')

  const now = new Date()
  const requestNumber = `REQ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  const entityTypeLabels: Record<string, string> = {
    PERSONNEL: 'Partner / Signatory',
    EMPLOYEE: 'Staff / Employee Visa',
    VEHICLE: 'Fleet Vehicle / Mulkiya',
    BANK_ACCOUNT: 'Corporate Bank Account',
  }

  const label = entityTypeLabels[entityType] || entityType
  const subject = `[${operationType}] ${label} Request - ${company.legalName}`

  const dataDescription = Object.entries(entityData)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const message = `Client submitted a structured ${operationType} request for ${label}.\n\n--- Entity Payload ---\n${dataDescription}\n\nTarget Entity ID: ${
    targetEntityId || 'New Record'
  }`

  // 1. Create client request ticket
  const request = await prisma.clientRequest.create({
    data: {
      requestNumber,
      clientId,
      portalUserId,
      companyId,
      category: 'Company Update',
      subject,
      message,
      priority: 'Normal',
      status: 'Open',
      messages: {
        create: {
          senderType: 'CLIENT',
          senderName: 'Client via Portal',
          message: `Request for ${operationType} ${label} submitted with structured details.`,
        },
      },
    },
  })

  // 2. Create CRM Action for Admin
  await prisma.action.create({
    data: {
      title: `Review Client ${operationType}: ${label} (${company.legalName})`,
      description: `Client submitted details for ${label}. Check Client Requests #${requestNumber} to review and approve changes in CRM.`,
      actionType: 'Review',
      priority: 'Normal',
      status: 'Pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      clientId,
      entityType: 'Company',
      entityId: companyId,
    },
  })

  // 3. Create Notification for client
  await prisma.portalNotification.create({
    data: {
      clientId,
      portalUserId,
      title: `Request Submitted: ${requestNumber}`,
      message: `Your ${operationType.toLowerCase()} request for ${label} (${company.legalName}) has been sent to your Operio team for verification.`,
      type: 'REQUEST_UPDATE',
      relatedEntityType: 'Request',
      relatedEntityId: request.id,
    },
  })

  return { success: true, requestNumber, requestId: request.id }
}
