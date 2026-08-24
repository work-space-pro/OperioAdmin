import prisma from '@/lib/db'

export interface GetClientsOptions {
  search?: string
  status?: string
  limit?: number
  offset?: number
}

export async function getAllClients(options: GetClientsOptions = {}) {
  const { search, status, limit, offset } = options

  const whereClause: any = {}

  if (status && status !== 'All') {
    whereClause.status = status
  }

  if (search && search.trim()) {
    const q = search.trim()
    whereClause.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { mobileNumber: { contains: q, mode: 'insensitive' } },
      { nationality: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      include: {
        companies: {
          select: {
            id: true,
            legalName: true,
            tradeLicenceNumber: true,
            status: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        actions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.client.count({ where: whereClause }),
  ])

  return { clients, totalCount }
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      companies: {
        include: {
          personnel: true,
          employees: true,
          vehicles: true,
          bankAccounts: true,
        },
      },
      services: true,
      documents: true,
      actions: {
        orderBy: { dueDate: 'asc' },
      },
      bankAccounts: true,
      portalUsers: true,
      clientRequests: {
        include: {
          messages: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createClient(data: {
  fullName: string
  clientType?: string
  email?: string | null
  mobileNumber?: string | null
  whatsappNumber?: string | null
  nationality?: string | null
  passportNumber?: string | null
  passportExpiryDate?: Date | null
  emiratesIdNumber?: string | null
  eidExpiryDate?: Date | null
  visaNumber?: string | null
  visaExpiryDate?: Date | null
  notes?: string | null
}) {
  return prisma.client.create({
    data: {
      clientType: data.clientType || 'Individual',
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      whatsappNumber: data.whatsappNumber,
      nationality: data.nationality,
      passportNumber: data.passportNumber,
      passportExpiryDate: data.passportExpiryDate,
      emiratesIdNumber: data.emiratesIdNumber,
      eidExpiryDate: data.eidExpiryDate,
      visaNumber: data.visaNumber,
      visaExpiryDate: data.visaExpiryDate,
      notes: data.notes,
    },
  })
}

export async function updateClient(id: string, data: any) {
  return prisma.client.update({
    where: { id },
    data,
  })
}

export async function archiveClient(id: string) {
  return prisma.client.update({
    where: { id },
    data: { status: 'Archived', archivedAt: new Date() },
  })
}

export async function restoreClient(id: string) {
  return prisma.client.update({
    where: { id },
    data: { status: 'Active', archivedAt: null },
  })
}
