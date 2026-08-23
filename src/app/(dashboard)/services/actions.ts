'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function getServices() {
  return prisma.service.findMany({
    include: {
      client: true,
      company: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getEntitiesForSelect() {
  const clients = await prisma.client.findMany({
    where: { archivedAt: null },
    select: { id: true, fullName: true, clientType: true }
  })
  const companies = await prisma.company.findMany({
    where: { archivedAt: null },
    select: { id: true, legalName: true }
  })
  return { clients, companies }
}

export async function createService(prevState: any, formData: FormData) {
  const category = formData.get('category') as string
  const name = formData.get('name') as string
  const entityType = formData.get('entityType') as string
  const entityId = formData.get('entityId') as string
  const priority = formData.get('priority') as string || 'Normal'
  const status = formData.get('status') as string || 'In Progress'
  const paymentStatus = formData.get('paymentStatus') as string || 'Unpaid'
  const price = parseFloat(formData.get('price') as string) || null
  const targetCompletionStr = formData.get('targetCompletion') as string
  const targetCompletion = targetCompletionStr ? new Date(targetCompletionStr) : null

  if (!category || !name || !entityId) {
    return { error: 'Category, Package Name, and Client/Company are required.' }
  }

  try {
    const data: any = {
      category,
      name,
      description: (formData.get('description') as string) || null,
      status,
      priority,
      price,
      currency: 'AED',
      paymentStatus,
      targetCompletion,
      notes: (formData.get('notes') as string) || null,
    }

    if (entityType === 'company') {
      data.companyId = entityId
    } else {
      data.clientId = entityId
    }

    const service = await prisma.service.create({ data })

    await prisma.activityLog.create({
      data: {
        eventType: 'Service Created',
        entityType: 'Service',
        entityId: service.id,
        description: `Started new service: ${name}`,
      }
    })

    revalidatePath('/services')
    return { success: true, serviceId: service.id }
  } catch (error) {
    console.error('Failed to create service:', error)
    return { error: 'Failed to create service. Please check the inputs.' }
  }
}
