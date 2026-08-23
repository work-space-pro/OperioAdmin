import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalRenewalsView from './PortalRenewalsView'

export const dynamic = 'force-dynamic'

export default async function PortalRenewalsPage() {
  const { client, authorizedCompanyIds } = await getAuthenticatedPortalUser()

  const now = new Date()

  // Fetch full company records
  const companies = await prisma.company.findMany({
    where: { id: { in: authorizedCompanyIds } },
    include: {
      employees: true,
      vehicles: true,
      drivers: true,
      vatFilings: true,
      documents: true,
    },
  })

  const renewalsList: Array<{
    id: string
    title: string
    category: string
    type: string
    identifier: string
    companyId: string | null
    companyName: string
    expiryDate: string
    daysUntil: number
    isExpired: boolean
    isExpiringSoon: boolean
    status: 'Valid' | 'Due Soon' | 'Expired'
  }> = []

  const calculateDays = (date: Date) => {
    return Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 3600 * 24))
  }

  // 1. Company Trade Licences & Establishment Cards
  companies.forEach((co) => {
    if (co.licenceExpiryDate) {
      const days = calculateDays(co.licenceExpiryDate)
      renewalsList.push({
        id: `licence-${co.id}`,
        title: `${co.legalName} - Trade Licence`,
        category: 'Trade Licence',
        type: 'Trade Licence',
        identifier: co.tradeLicenceNumber || '—',
        companyId: co.id,
        companyName: co.legalName,
        expiryDate: co.licenceExpiryDate.toISOString(),
        daysUntil: days,
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    if (co.estCardExpiryDate) {
      const days = calculateDays(co.estCardExpiryDate)
      renewalsList.push({
        id: `est-${co.id}`,
        title: `${co.legalName} - Establishment Card`,
        category: 'Establishment Card',
        type: 'Establishment Card',
        identifier: co.estCardNumber || '—',
        companyId: co.id,
        companyName: co.legalName,
        expiryDate: co.estCardExpiryDate.toISOString(),
        daysUntil: days,
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    // 2. Vehicles Mulkiya & Insurance
    co.vehicles.forEach((veh) => {
      if (veh.expDate) {
        const days = calculateDays(veh.expDate)
        renewalsList.push({
          id: `veh-${veh.id}`,
          title: `Vehicle Mulkiya - Plate ${veh.regNo}`,
          category: 'Vehicle Registration',
          type: 'Vehicle Mulkiya',
          identifier: `Plate: ${veh.regNo}${veh.tcNo ? ` • TC: ${veh.tcNo}` : ''}`,
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: veh.expDate.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }

      if (veh.insuranceExpDate) {
        const days = calculateDays(veh.insuranceExpDate)
        renewalsList.push({
          id: `veh-ins-${veh.id}`,
          title: `Vehicle Insurance - Plate ${veh.regNo}`,
          category: 'Vehicle Insurance',
          type: 'Vehicle Insurance',
          identifier: veh.policyNo ? `Policy: ${veh.policyNo}` : `Plate: ${veh.regNo}`,
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: veh.insuranceExpDate.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })

    // 3. Staff Visas, Passports, EIDs & Health Insurances
    co.employees.forEach((emp) => {
      if (emp.visaExpiryDate) {
        const days = calculateDays(emp.visaExpiryDate)
        renewalsList.push({
          id: `visa-${emp.id}`,
          title: `Staff Visa (${emp.fullName})`,
          category: 'Visa',
          type: emp.visaType || 'Employment Visa',
          identifier: emp.visaNumber || emp.uidNumber || '—',
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: emp.visaExpiryDate.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }

      if (emp.passportExpiry) {
        const days = calculateDays(emp.passportExpiry)
        renewalsList.push({
          id: `pass-${emp.id}`,
          title: `Passport (${emp.fullName})`,
          category: 'Passport',
          type: 'Passport',
          identifier: emp.passportNumber || '—',
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: emp.passportExpiry.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }

      if (emp.eidExpiryDate) {
        const days = calculateDays(emp.eidExpiryDate)
        renewalsList.push({
          id: `eid-${emp.id}`,
          title: `Emirates ID (${emp.fullName})`,
          category: 'Emirates ID',
          type: 'Emirates ID',
          identifier: emp.emiratesId || '—',
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: emp.eidExpiryDate.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }

      if (emp.healthInsExpiry) {
        const days = calculateDays(emp.healthInsExpiry)
        renewalsList.push({
          id: `health-${emp.id}`,
          title: `Health Insurance (${emp.fullName})`,
          category: 'Health Insurance',
          type: 'Health Insurance',
          identifier: emp.healthInsNumber || '—',
          companyId: co.id,
          companyName: co.legalName,
          expiryDate: emp.healthInsExpiry.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })
  })

  // 4. Client Personal Identity Records
  if (client.passportExpiryDate) {
    const days = calculateDays(client.passportExpiryDate)
    renewalsList.push({
      id: `cli-pass-${client.id}`,
      title: `Owner Passport (${client.fullName})`,
      category: 'Passport',
      type: 'Personal Passport',
      identifier: client.passportNumber || '—',
      companyId: null,
      companyName: 'Personal Identity',
      expiryDate: client.passportExpiryDate.toISOString(),
      daysUntil: days,
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60,
      status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  if (client.eidExpiryDate) {
    const days = calculateDays(client.eidExpiryDate)
    renewalsList.push({
      id: `cli-eid-${client.id}`,
      title: `Owner Emirates ID (${client.fullName})`,
      category: 'Emirates ID',
      type: 'Personal Emirates ID',
      identifier: client.emiratesIdNumber || '—',
      companyId: null,
      companyName: 'Personal Identity',
      expiryDate: client.eidExpiryDate.toISOString(),
      daysUntil: days,
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60,
      status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  if (client.visaExpiryDate) {
    const days = calculateDays(client.visaExpiryDate)
    renewalsList.push({
      id: `cli-visa-${client.id}`,
      title: `Owner Residence Visa (${client.fullName})`,
      category: 'Visa',
      type: 'Investor / Partner Visa',
      identifier: client.visaNumber || '—',
      companyId: null,
      companyName: 'Personal Identity',
      expiryDate: client.visaExpiryDate.toISOString(),
      daysUntil: days,
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60,
      status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
    })
  }

  // Sort: most urgent first (expired first, then closest expiries)
  renewalsList.sort((a, b) => a.daysUntil - b.daysUntil)

  return <PortalRenewalsView renewals={renewalsList} />
}
