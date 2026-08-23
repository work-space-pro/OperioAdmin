'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function createCompany(prevState: any, formData: FormData) {
  const clientId = formData.get('clientId') as string
  const legalName = formData.get('legalName') as string
  const companyType = formData.get('companyType') as string
  const zoneType = formData.get('zoneType') as string
  
  if (!clientId || !legalName) {
    return { error: 'Client and Legal Name are required.' }
  }

  try {
    const company = await prisma.company.create({
      data: {
        clientId,
        legalName,
        tradeName: formData.get('tradeName') as string,
        companyType,
        legalForm: formData.get('legalForm') as string,
        zoneType,
        freeZoneName: formData.get('freeZoneName') as string,
        registeredEmirate: formData.get('registeredEmirate') as string,
        companyEmail: formData.get('companyEmail') as string,
        companyMobile: formData.get('companyMobile') as string,
        registeredAddress: formData.get('registeredAddress') as string,
        status: 'Active',
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Company Created',
        entityType: 'Company',
        entityId: company.id,
        description: `Created new company: ${company.legalName}`,
      }
    })

    revalidatePath('/companies')
    revalidatePath(`/clients/${clientId}`)
    return { success: true, companyId: company.id }
  } catch (error) {
    console.error('Failed to create company:', error)
    return { error: 'Failed to create company. Please check the inputs.' }
  }
}

export async function getCompanies() {
  return prisma.company.findMany({
    where: { archivedAt: null },
    include: {
      client: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      client: true,
      personnel: true,
      bankAccounts: true,
      employees: { orderBy: { createdAt: 'asc' } },
      vehicles: { orderBy: { createdAt: 'asc' } },
      drivers: { orderBy: { createdAt: 'asc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      services: { orderBy: { createdAt: 'desc' } },
      vatFilings: { orderBy: { dueDate: 'desc' } }
    }
  })
}

export async function getClientsForSelect() {
  return prisma.client.findMany({
    where: { archivedAt: null },
    select: { id: true, fullName: true, clientType: true },
    orderBy: { fullName: 'asc' }
  })
}

export async function deleteCompany(id: string) {
  try {
    await prisma.company.delete({ where: { id } })
    revalidatePath('/companies')
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete company:', error)
    return { error: 'Failed to delete company.' }
  }
}
