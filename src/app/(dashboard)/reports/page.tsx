import React from 'react'
import prisma from '@/lib/db'
import ReportsClientView from './ReportsClientView'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [clients, companies, services, vehicles, drivers, documents] = await Promise.all([
    prisma.client.findMany({
      include: {
        companies: true,
        services: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.company.findMany({
      include: {
        client: true,
        personnel: true,
        vehicles: true,
        drivers: true,
        services: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.service.findMany({
      include: {
        client: true,
        company: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.vehicle.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.driver.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.document.findMany({
      include: { client: true, company: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Revenue computations
  let totalRevenue = 0
  let collectedRevenue = 0
  let pendingRevenue = 0

  services.forEach(s => {
    const price = s.price || 0
    totalRevenue += price
    if (s.paymentStatus === 'Paid') {
      collectedRevenue += price
    } else {
      pendingRevenue += price
    }
  })

  // 5 Categories Breakdown
  const standardCategories = [
    'Business Setup',
    'Visa & Immigration',
    'Tax & Accounting',
    'PRO Services',
    'Legal & Advisory'
  ]

  const categoryMap: Record<string, { count: number; revenue: number }> = {}
  standardCategories.forEach(cat => {
    categoryMap[cat] = { count: 0, revenue: 0 }
  })

  services.forEach(s => {
    const rawCat = s.category || 'Business Setup'
    // Map existing legacy categories to standard 5
    let mapped = standardCategories.find(c => c.toLowerCase() === rawCat.toLowerCase())
    if (!mapped) {
      if (rawCat.toLowerCase().includes('visa') || rawCat.toLowerCase().includes('immigration')) mapped = 'Visa & Immigration'
      else if (rawCat.toLowerCase().includes('tax') || rawCat.toLowerCase().includes('vat') || rawCat.toLowerCase().includes('account')) mapped = 'Tax & Accounting'
      else if (rawCat.toLowerCase().includes('pro')) mapped = 'PRO Services'
      else if (rawCat.toLowerCase().includes('legal')) mapped = 'Legal & Advisory'
      else mapped = 'Business Setup'
    }

    if (!categoryMap[mapped]) {
      categoryMap[mapped] = { count: 0, revenue: 0 }
    }
    categoryMap[mapped].count += 1
    categoryMap[mapped].revenue += s.price || 0
  })

  const categoryBreakdown = standardCategories.map(cat => ({
    category: cat,
    count: categoryMap[cat]?.count || 0,
    revenue: categoryMap[cat]?.revenue || 0,
    percentage: totalRevenue > 0 ? Math.round(((categoryMap[cat]?.revenue || 0) / totalRevenue) * 100) : 0
  }))

  // Status Breakdown
  const statusCounts: Record<string, number> = {
    'Completed': 0,
    'In progress': 0,
    'Submitted': 0,
    'Not started': 0
  }

  services.forEach(s => {
    const st = s.status || 'In progress'
    if (st === 'Completed') statusCounts['Completed'] += 1
    else if (st === 'Submitted') statusCounts['Submitted'] += 1
    else if (st === 'Not started') statusCounts['Not started'] += 1
    else statusCounts['In progress'] += 1
  })

  const totalSrv = services.length || 1
  const statusBreakdown = [
    { status: 'Completed', count: statusCounts['Completed'], percentage: Math.round((statusCounts['Completed'] / totalSrv) * 100) },
    { status: 'In progress', count: statusCounts['In progress'], percentage: Math.round((statusCounts['In progress'] / totalSrv) * 100) },
    { status: 'Submitted', count: statusCounts['Submitted'], percentage: Math.round((statusCounts['Submitted'] / totalSrv) * 100) },
    { status: 'Not started', count: statusCounts['Not started'], percentage: Math.round((statusCounts['Not started'] / totalSrv) * 100) }
  ]

  // Real Expiries computation
  const now = new Date()
  const expiringItems: any[] = []
  let totalTrackedComplianceItems = 0
  let expiredOrCriticalCount = 0
  let criticalCount = 0
  let warningCount = 0

  const evaluateExpiry = (id: string, type: string, title: string, holder: string, expDate: Date | null | undefined, clientLink: string) => {
    if (!expDate) return
    totalTrackedComplianceItems += 1
    const expiry = new Date(expDate)
    const diffTime = expiry.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysLeft <= 60) {
      const status = daysLeft < 0 ? 'expired' : daysLeft <= 30 ? 'critical' : 'warning'
      if (daysLeft <= 30) criticalCount += 1
      else warningCount += 1
      if (daysLeft <= 30) expiredOrCriticalCount += 1

      expiringItems.push({
        id,
        type,
        title,
        holder,
        expiryDate: expiry.toISOString().split('T')[0],
        daysLeft,
        status,
        clientLink
      })
    }
  }

  // 1. Company Trade Licenses & Est Cards
  companies.forEach(c => {
    evaluateExpiry(`co-lic-${c.id}`, 'Trade Licence', `Trade Licence: ${c.tradeLicenceNumber || c.legalName}`, c.legalName, c.licenceExpiryDate, `/clients/${c.clientId}`)
    evaluateExpiry(`co-est-${c.id}`, 'Establishment Card', `Est Card: ${c.estCardNumber || c.legalName}`, c.legalName, c.estCardExpiryDate, `/clients/${c.clientId}`)
  })

  // 2. Client Identity (Owner Visas, EID, Passport, Insurance)
  clients.forEach(cl => {
    evaluateExpiry(`cl-eid-${cl.id}`, 'Emirates ID', `Emirates ID (${cl.emiratesIdNumber || cl.fullName})`, cl.fullName, cl.eidExpiryDate, `/clients/${cl.id}`)
    evaluateExpiry(`cl-visa-${cl.id}`, 'Residency Visa', `Residency Visa (${cl.visaNumber || cl.fullName})`, cl.fullName, cl.visaExpiryDate, `/clients/${cl.id}`)
    evaluateExpiry(`cl-pass-${cl.id}`, 'Passport', `Passport (${cl.passportNumber || cl.fullName})`, cl.fullName, cl.passportExpiryDate, `/clients/${cl.id}`)
    evaluateExpiry(`cl-ins-${cl.id}`, 'Health Insurance', `Health Insurance Policy`, cl.fullName, cl.healthInsExpiryDate, `/clients/${cl.id}`)
  })

  // 3. Vehicles Mulkiya & Insurance
  vehicles.forEach(v => {
    const co = v.company
    evaluateExpiry(`v-reg-${v.id}`, 'Vehicle Mulkiya', `Mulkiya: ${v.regNo}`, co?.legalName || 'Fleet', v.expDate, co ? `/clients/${co.clientId}` : '/compliance')
    evaluateExpiry(`v-ins-${v.id}`, 'Vehicle Insurance', `Insurance: ${v.policyNo || v.regNo}`, co?.legalName || 'Fleet', v.insuranceExpDate, co ? `/clients/${co.clientId}` : '/compliance')
  })

  // 4. Drivers
  drivers.forEach(d => {
    const co = d.company
    evaluateExpiry(`d-lic-${d.id}`, 'Driver Licence', `Driver Licence: ${d.fullName}`, co?.legalName || 'Driver', d.licenseExpDate, co ? `/clients/${co.clientId}` : '/compliance')
  })

  // Sort expiring items by daysLeft ascending
  expiringItems.sort((a, b) => a.daysLeft - b.daysLeft)

  // Compliance score
  const complianceScore = totalTrackedComplianceItems === 0 ? 100 : Math.max(0, Math.round(((totalTrackedComplianceItems - expiredOrCriticalCount) / totalTrackedComplianceItems) * 100))

  // Services formatted list
  const servicesList = services.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category || 'Business Setup',
    clientName: s.client?.fullName || 'General Client',
    companyName: s.company?.legalName || '',
    price: s.price || 0,
    status: s.status || 'In progress',
    paymentStatus: s.paymentStatus || 'Unpaid',
    targetCompletion: s.targetCompletion ? new Date(s.targetCompletion).toISOString().split('T')[0] : '',
    createdAt: new Date(s.createdAt).toISOString().split('T')[0]
  }))

  const stats = {
    totalRevenue,
    collectedRevenue,
    pendingRevenue,
    totalClients: clients.length,
    totalCompanies: companies.length,
    totalServices: services.length,
    completedServices: statusCounts['Completed'],
    inProgressServices: statusCounts['In progress'],
    pendingServices: statusCounts['Not started'] + statusCounts['Submitted'],
    complianceScore,
    criticalExpiriesCount: criticalCount,
    warningExpiriesCount: warningCount
  }

  return (
    <div className="max-w-7xl mx-auto py-2">
      <ReportsClientView 
        stats={stats}
        categoryBreakdown={categoryBreakdown}
        statusBreakdown={statusBreakdown}
        expiringItems={expiringItems}
        servicesList={servicesList}
      />
    </div>
  )
}
