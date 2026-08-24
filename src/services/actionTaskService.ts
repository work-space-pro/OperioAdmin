import prisma from '@/lib/db'

export async function getAllActions(options?: {
  clientId?: string
  status?: string
}) {
  const whereClause: any = {}

  if (options?.clientId) {
    whereClause.clientId = options.clientId
  }

  if (options?.status && options.status !== 'All') {
    whereClause.status = options.status
  }

  return prisma.action.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function createAction(data: {
  title: string
  description?: string | null
  actionType?: string
  priority?: string
  dueDate: Date
  dueTime?: string | null
  clientId?: string | null
  entityType?: string | null
  entityId?: string | null
}) {
  return prisma.action.create({
    data: {
      title: data.title,
      description: data.description,
      actionType: data.actionType || 'Task',
      priority: data.priority || 'Normal',
      status: 'Pending',
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      clientId: data.clientId || null,
      entityType: data.entityType || (data.clientId ? 'Client' : null),
      entityId: data.entityId || data.clientId || null,
    },
  })
}

export async function toggleActionStatus(actionId: string, currentStatus: string) {
  const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
  return prisma.action.update({
    where: { id: actionId },
    data: { status: nextStatus },
  })
}

export async function deleteAction(actionId: string) {
  return prisma.action.delete({
    where: { id: actionId },
  })
}
