import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalDashboardView from './PortalDashboardView'

export const dynamic = 'force-dynamic'

export default async function PortalDashboardPage() {
  const { client, authorizedCompanyIds } = await getAuthenticatedPortalUser()

  const now = new Date()

  // 1. Fetch Full Company records with employees, vehicles, documents, bank accounts
  const companies = await prisma.company.findMany({
    where: { id: { in: authorizedCompanyIds } },
    include: {
      employees: true,
      vehicles: true,
      drivers: true,
      documents: true,
      bankAccounts: true,
      services: true,
    },
  })

  // 2. Fetch Client Applications
  const applications = await prisma.application.findMany({
    where: { clientId: client.id },
    include: {
      company: true,
      service: true,
      documents: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  // 3. Fetch CRM Services for this Client
  const crmServices = await prisma.service.findMany({
    where: {
      OR: [
        { clientId: client.id },
        { companyId: { in: authorizedCompanyIds } },
      ],
    },
    include: {
      company: true,
      documents: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // 4. Fetch Client & Company Documents
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { clientId: client.id },
        { companyId: { in: authorizedCompanyIds } },
      ],
    },
    include: {
      company: true,
      application: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // 5. Build Complete Renewals List
  const renewalsList: Array<{
    id: string
    title: string
    type: string
    companyName: string
    expiryDate: Date | null
    daysRemaining: number
    status: 'Valid' | 'Due Soon' | 'Expired'
  }> = []

  // (A) Company Trade Licenses & Establishment Cards
  companies.forEach((co) => {
    if (co.licenceExpiryDate) {
      const diffDays = Math.ceil((new Date(co.licenceExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
      renewalsList.push({
        id: `lic-${co.id}`,
        title: `${co.legalName} - Trade Licence`,
        type: 'Trade Licence',
        companyName: co.legalName,
        expiryDate: new Date(co.licenceExpiryDate),
        daysRemaining: diffDays,
        status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    if (co.estCardExpiryDate) {
      const diffDays = Math.ceil((new Date(co.estCardExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
      renewalsList.push({
        id: `est-${co.id}`,
        title: `${co.legalName} - Establishment Card`,
        type: 'Establishment Card',
        companyName: co.legalName,
        expiryDate: new Date(co.estCardExpiryDate),
        daysRemaining: diffDays,
        status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    // (B) Company Vehicles Mulkiya & Insurance
    co.vehicles.forEach((veh) => {
      if (veh.expDate) {
        const diffDays = Math.ceil((new Date(veh.expDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
        renewalsList.push({
          id: `veh-${veh.id}`,
          title: `Vehicle Mulkiya - Plate ${veh.regNo}`,
          type: 'Vehicle Mulkiya',
          companyName: co.legalName,
          expiryDate: new Date(veh.expDate),
          daysRemaining: diffDays,
          status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
        })
      }

      if (veh.insuranceExpDate) {
        const diffDays = Math.ceil((new Date(veh.insuranceExpDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
        renewalsList.push({
          id: `veh-ins-${veh.id}`,
          title: `Vehicle Insurance - Plate ${veh.regNo}`,
          type: 'Vehicle Insurance',
          companyName: co.legalName,
          expiryDate: new Date(veh.insuranceExpDate),
          daysRemaining: diffDays,
          status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })

    // (C) Company Staff Visas & Passports
    co.employees.forEach((emp) => {
      if (emp.visaExpiryDate) {
        const diffDays = Math.ceil((new Date(emp.visaExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
        renewalsList.push({
          id: `visa-${emp.id}`,
          title: `Visa - ${emp.fullName}`,
          type: 'Staff Visa',
          companyName: co.legalName,
          expiryDate: new Date(emp.visaExpiryDate),
          daysRemaining: diffDays,
          status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })
  })

  // (D) Client Personal Identity Records
  if (client.passportExpiryDate) {
    const diffDays = Math.ceil((new Date(client.passportExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
    renewalsList.push({
      id: `cli-pass-${client.id}`,
      title: `Passport - ${client.fullName}`,
      type: 'Passport',
      companyName: 'Personal',
      expiryDate: new Date(client.passportExpiryDate),
      daysRemaining: diffDays,
      status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  if (client.eidExpiryDate) {
    const diffDays = Math.ceil((new Date(client.eidExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
    renewalsList.push({
      id: `cli-eid-${client.id}`,
      title: `Emirates ID - ${client.fullName}`,
      type: 'Emirates ID',
      companyName: 'Personal',
      expiryDate: new Date(client.eidExpiryDate),
      daysRemaining: diffDays,
      status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  if (client.visaExpiryDate) {
    const diffDays = Math.ceil((new Date(client.visaExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24))
    renewalsList.push({
      id: `cli-visa-${client.id}`,
      title: `Residence Visa - ${client.fullName}`,
      type: 'Residence Visa',
      companyName: 'Personal',
      expiryDate: new Date(client.visaExpiryDate),
      daysRemaining: diffDays,
      status: diffDays < 0 ? 'Expired' : diffDays <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  // Sort by urgency: most urgent / expired first
  renewalsList.sort((a, b) => a.daysRemaining - b.daysRemaining)

  // 6. Fetch Portal Notifications
  const notifications = await prisma.portalNotification.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // 7. Calculate Aggregated Stats
  const activeAppsCount =
    applications.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'Rejected').length +
    crmServices.filter((s) => s.status === 'Pending' || s.status === 'In Progress').length

  const completedServicesCount =
    applications.filter((a) => a.status === 'Completed' || a.status === 'Approved').length +
    crmServices.filter((s) => s.status === 'Completed').length

  const pendingDocsCount = documents.filter(
    (d) => d.verificationStatus === 'Pending' || d.verificationStatus === 'Replacement Required' || d.status === 'Expired'
  ).length

  const urgentRenewalsCount = renewalsList.filter((r) => r.status === 'Due Soon' || r.status === 'Expired').length

  // 8. Merge Applications & CRM Services for Recent List
  const unifiedApplications = [
    ...applications.map((app) => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      title: app.title,
      serviceCategory: app.serviceCategory,
      serviceType: app.serviceType,
      status: app.status,
      priority: app.priority,
      companyName: app.company?.legalName || 'Individual',
      submittedAt: app.submittedAt.toISOString(),
      expectedCompletion: app.expectedCompletion ? app.expectedCompletion.toISOString() : null,
      documentsCount: app.documents.length,
    })),
    ...crmServices.map((srv) => ({
      id: srv.id,
      applicationNumber: `SRV-${srv.category.substring(0, 3).toUpperCase()}`,
      title: srv.name,
      serviceCategory: srv.category,
      serviceType: srv.name,
      status: srv.status,
      priority: srv.priority,
      companyName: srv.company?.legalName || 'Individual',
      submittedAt: srv.createdAt.toISOString(),
      expectedCompletion: srv.targetCompletion ? srv.targetCompletion.toISOString() : null,
      documentsCount: srv.documents.length,
    })),
  ].slice(0, 5)

  const serializedDocuments = documents.map((d) => ({
    id: d.id,
    title: d.title,
    documentType: d.documentType,
    fileUrl: d.fileUrl,
    verificationStatus: d.verificationStatus,
    uploadedBy: d.uploadedBy,
    companyName: d.company?.legalName || null,
    expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }))

  const serializedRenewals = renewalsList.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    companyName: r.companyName,
    expiryDate: r.expiryDate ? r.expiryDate.toISOString() : null,
    daysRemaining: r.daysRemaining,
    status: r.status,
  }))

  const serializedNotifications = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <PortalDashboardView
      stats={{
        activeApplications: activeAppsCount,
        pendingDocuments: pendingDocsCount,
        upcomingRenewals: urgentRenewalsCount,
        completedServices: completedServicesCount,
      }}
      recentApplications={unifiedApplications}
      recentDocuments={serializedDocuments}
      upcomingRenewals={serializedRenewals}
      recentNotifications={serializedNotifications}
    />
  )
}
