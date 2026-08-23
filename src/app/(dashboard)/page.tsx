import React from 'react'
import prisma from '@/lib/db'
import ModernDashboardView from '@/components/dashboard/ModernDashboardView'
import { getDashboardKPIs, getUpcomingActions, getRecentActivity } from '@/lib/dashboard-services'
import { getAllRenewals } from '@/app/(dashboard)/renewals/actions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Batch 1: KPIs & Renewals
  const kpis = await getDashboardKPIs().catch(() => ({
    totalClients: 0,
    activeCompanies: 0,
    expiringDocsTotal: 0,
    pendingVatFilings: 0,
    pendingCorporateTax: 0,
    visaRenewals: 0,
    insuranceRenewals: 0,
  }))

  const allRenewals = await getAllRenewals().catch(() => [])

  // Batch 2: Lists & Activities
  const [clients, companies, dbActions, dbActivity] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, fullName: true },
      where: { status: { not: 'Archived' } },
      orderBy: { fullName: 'asc' },
    }).catch(() => []),
    prisma.company.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { fullName: true } },
      },
    }).catch(() => []),
    getUpcomingActions().catch(() => []),
    getRecentActivity().catch(() => []),
  ])

  const renewalsStats = {
    total: allRenewals.length,
    expired: allRenewals.filter((r: any) => r.isExpired).length,
    dueSoon: allRenewals.filter((r: any) => !r.isExpired && r.daysUntil <= 60).length,
    valid: allRenewals.filter((r: any) => !r.isExpired && r.daysUntil > 60).length,
  }

  const formattedActions = dbActions.map((a: any) => ({
    id: a.id,
    title: a.title,
    assignedUser: a.assignedUser,
    clientName: a.client?.fullName,
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-GB') : undefined,
    priority: a.priority,
    status: a.status,
  }))

  const formattedActivity = dbActivity.map((act: any) => ({
    id: act.id,
    user: act.entityType || 'System',
    action: act.description,
    timestamp: act.createdAt ? new Date(act.createdAt).toLocaleString('en-GB') : '',
  }))

  return (
    <ModernDashboardView
      kpis={kpis}
      renewals={allRenewals}
      renewalsStats={renewalsStats}
      clients={clients}
      companies={companies}
      actions={formattedActions}
      recentActivity={formattedActivity}
    />
  )
}
