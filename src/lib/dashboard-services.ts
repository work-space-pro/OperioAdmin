'use server'
import prisma from '@/lib/db'

async function safeCount(fn: () => Promise<number>, fallback = 0, retries = 2): Promise<number> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) {
        console.warn('safeCount query failed after retries:', err)
        return fallback
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)))
    }
  }
  return fallback
}

export async function getDashboardKPIs() {
  const now = new Date()
  const in30Days = new Date()
  in30Days.setDate(now.getDate() + 30)

  try {
    // Batch 1: Core counts
    const [totalClients, totalCompanies, expiringDocs30Days, pendingVatFilings] = await Promise.all([
      safeCount(() => prisma.client.count({ where: { status: { not: 'Archived' } } })),
      safeCount(() => prisma.company.count({ where: { status: 'Active', archivedAt: null } })),
      safeCount(() => prisma.document.count({ where: { expiryDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.vATFiling.count({ where: { status: 'Pending', dueDate: { lte: in30Days, gte: now } } })),
    ])

    // Batch 2: Corporate tax and visas
    const [pendingCorporateTax, empVisaRenewals, clientVisaRenewals] = await Promise.all([
      safeCount(() => prisma.company.count({ where: { corporateTaxRegDate: null, status: 'Active' } })),
      safeCount(() =>
        prisma.employee.count({
          where: {
            OR: [
              { visaExpiryDate: { lte: in30Days, gte: now } },
              { eVisaExpiryDate: { lte: in30Days, gte: now } },
            ],
          },
        })
      ),
      safeCount(() => prisma.client.count({ where: { visaExpiryDate: { lte: in30Days, gte: now } } })),
    ])

    // Batch 3: Insurances
    const [empIns, vehIns, clientIns] = await Promise.all([
      safeCount(() => prisma.employee.count({ where: { healthInsExpiry: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.vehicle.count({ where: { insuranceExpDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.client.count({ where: { healthInsExpiryDate: { lte: in30Days, gte: now } } })),
    ])

    // Batch 4: Passports, EIDs, Vehicles, Drivers
    const [
      empPassportRenewals,
      clientPassportRenewals,
      empEidRenewals,
      clientEidRenewals,
      vehicleRegRenewals,
      driverLicRenewals,
    ] = await Promise.all([
      safeCount(() => prisma.employee.count({ where: { passportExpiry: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.client.count({ where: { passportExpiryDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.employee.count({ where: { eidExpiryDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.client.count({ where: { eidExpiryDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.vehicle.count({ where: { expDate: { lte: in30Days, gte: now } } })),
      safeCount(() => prisma.driver.count({ where: { licenseExpDate: { lte: in30Days, gte: now } } })),
    ])

    const visaRenewals = empVisaRenewals + clientVisaRenewals
    const insuranceRenewals = empIns + vehIns + clientIns
    const expiringDocsTotal =
      expiringDocs30Days +
      empPassportRenewals +
      clientPassportRenewals +
      empEidRenewals +
      clientEidRenewals +
      vehicleRegRenewals +
      driverLicRenewals

    return {
      totalClients,
      activeCompanies: totalCompanies,
      expiringDocsTotal,
      pendingVatFilings,
      pendingCorporateTax,
      visaRenewals,
      insuranceRenewals,
    }
  } catch (error) {
    console.error('getDashboardKPIs global error:', error)
    return {
      totalClients: 0,
      activeCompanies: 0,
      expiringDocsTotal: 0,
      pendingVatFilings: 0,
      pendingCorporateTax: 0,
      visaRenewals: 0,
      insuranceRenewals: 0,
    }
  }
}

export async function getUpcomingActions() {
  try {
    return await prisma.action.findMany({
      where: { status: { not: 'Completed' } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        client: { select: { fullName: true } },
      },
    })
  } catch {
    return []
  }
}

export async function getRecentActivity() {
  try {
    return await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  } catch {
    return []
  }
}

export async function getDashboardCalendarEvents(year: number, month: number) {
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)

  try {
    const [actions, documents] = await Promise.all([
      prisma.action.findMany({
        where: { dueDate: { gte: startOfMonth, lte: endOfMonth }, status: { not: 'Completed' } },
        include: { client: { select: { fullName: true } } },
      }),
      prisma.document.findMany({
        where: { expiryDate: { gte: startOfMonth, lte: endOfMonth } },
      }),
    ])

    const events: any[] = []

    actions.forEach((a) => {
      events.push({
        id: `action-${a.id}`,
        title: a.title,
        date: a.dueDate.toISOString().split('T')[0],
        type: 'action',
        priority: a.priority,
        clientName: a.client?.fullName,
      })
    })

    documents.forEach((d) => {
      if (d.expiryDate) {
        events.push({
          id: `doc-${d.id}`,
          title: `Expiry: ${d.title}`,
          date: d.expiryDate.toISOString().split('T')[0],
          type: 'expiry',
          priority: 'High',
        })
      }
    })

    return events
  } catch {
    return []
  }
}
