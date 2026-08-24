import prisma from '@/lib/db'

export async function getAllDocuments(options?: {
  clientId?: string
  companyId?: string
  documentType?: string
  verificationStatus?: string
  search?: string
}) {
  const whereClause: any = {}

  if (options?.clientId) {
    whereClause.clientId = options.clientId
  }

  if (options?.companyId) {
    whereClause.companyId = options.companyId
  }

  if (options?.documentType && options.documentType !== 'All') {
    whereClause.documentType = options.documentType
  }

  if (options?.verificationStatus && options.verificationStatus !== 'All') {
    whereClause.verificationStatus = options.verificationStatus
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim()
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { documentType: { contains: q, mode: 'insensitive' } },
      { client: { fullName: { contains: q, mode: 'insensitive' } } },
      { company: { legalName: { contains: q, mode: 'insensitive' } } },
    ]
  }

  return prisma.document.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
        },
      },
      company: {
        select: {
          id: true,
          legalName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createDocument(data: {
  title: string
  documentType: string
  fileUrl?: string | null
  fileSize?: number | null
  mimeType?: string | null
  issueDate?: Date | null
  expiryDate?: Date | null
  clientId?: string | null
  companyId?: string | null
  verificationStatus?: string
}) {
  return prisma.document.create({
    data: {
      title: data.title,
      documentType: data.documentType,
      fileUrl: data.fileUrl || '/documents/sample.pdf',
      fileSize: data.fileSize || 0,
      mimeType: data.mimeType || 'application/pdf',
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      clientId: data.clientId || null,
      companyId: data.companyId || null,
      verificationStatus: data.verificationStatus || 'Verified',
    },
  })
}

export async function updateDocumentVerificationStatus(id: string, verificationStatus: string) {
  return prisma.document.update({
    where: { id },
    data: { verificationStatus },
  })
}

export async function deleteDocument(id: string) {
  return prisma.document.delete({
    where: { id },
  })
}
