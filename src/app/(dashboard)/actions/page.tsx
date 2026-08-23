import React from 'react'
import prisma from '@/lib/db'
import SupportAndTasksView from './SupportAndTasksView'

export const dynamic = 'force-dynamic'

export default async function ActionsPage() {
  const [actions, requests, clients] = await Promise.all([
    prisma.action.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        client: true,
      },
    }),
    prisma.clientRequest.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        client: true,
        company: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.client.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  const serializedActions = actions.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    actionType: a.actionType,
    dueDate: a.dueDate.toISOString(),
    dueTime: a.dueTime,
    priority: a.priority,
    status: a.status,
    clientId: a.clientId,
    client: a.client
      ? {
          id: a.client.id,
          fullName: a.client.fullName,
        }
      : null,
  }))

  const serializedRequests = requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    subject: r.subject,
    message: r.message,
    category: r.category,
    priority: r.priority,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    client: r.client
      ? {
          id: r.client.id,
          fullName: r.client.fullName,
        }
      : null,
    company: r.company
      ? {
          id: r.company.id,
          legalName: r.company.legalName,
        }
      : null,
    messages: r.messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderName,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
  }))

  return (
    <SupportAndTasksView
      requests={serializedRequests}
      actions={serializedActions}
      clients={clients}
    />
  )
}
