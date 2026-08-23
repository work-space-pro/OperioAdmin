'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getAllRenewals() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        client: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        employees: true,
        vehicles: true,
        drivers: true,
        documents: true
      }
    }).catch(() => [])

    const standaloneDocs = await prisma.document.findMany({
      where: { expiryDate: { not: null } },
      include: {
        client: { select: { id: true, fullName: true } },
        company: { select: { id: true, legalName: true } }
      }
    }).catch(() => [])

    const clientsWithPassports = await prisma.client.findMany({
      where: {
        OR: [
          { passportExpiryDate: { not: null } },
          { eidExpiryDate: { not: null } },
          { visaExpiryDate: { not: null } },
          { healthInsExpiryDate: { not: null } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        passportNumber: true,
        passportIssueDate: true,
        passportExpiryDate: true,
        emiratesIdNumber: true,
        eidIssueDate: true,
        eidExpiryDate: true,
        visaNumber: true,
        visaIssueDate: true,
        visaExpiryDate: true,
        healthInsNumber: true,
        healthInsIssueDate: true,
        healthInsExpiryDate: true
      }
    }).catch(() => [])

  const allRenewals: any[] = []
  const now = new Date()

  // 0. Owner / Client Expiries (Passport, Emirates ID, Visa, Health Insurance)
  clientsWithPassports.forEach((cli) => {
    // Passport
    if (cli.passportExpiryDate) {
      const days = (new Date(cli.passportExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `cli-pass-${cli.id}`,
        entityType: 'Client',
        entityId: cli.id,
        field: 'passportExpiryDate',
        numberField: 'passportNumber',
        identifier: cli.passportNumber || '—',
        title: `Owner Passport (${cli.fullName})`,
        category: 'Passport',
        entityName: `${cli.fullName} (Owner)`,
        clientName: cli.fullName,
        clientId: cli.id,
        expiryDate: cli.passportExpiryDate.toISOString(),
        issueDate: cli.passportIssueDate ? cli.passportIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: cli.email,
        contactPhone: cli.mobileNumber
      })
    }

    // Emirates ID
    if (cli.eidExpiryDate) {
      const days = (new Date(cli.eidExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `cli-eid-${cli.id}`,
        entityType: 'Client',
        entityId: cli.id,
        field: 'eidExpiryDate',
        numberField: 'emiratesIdNumber',
        identifier: cli.emiratesIdNumber || '—',
        title: `Owner Emirates ID (${cli.fullName})`,
        category: 'Emirates ID',
        entityName: `${cli.fullName} (Owner)`,
        clientName: cli.fullName,
        clientId: cli.id,
        expiryDate: cli.eidExpiryDate.toISOString(),
        issueDate: cli.eidIssueDate ? cli.eidIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: cli.email,
        contactPhone: cli.mobileNumber
      })
    }

    // Visa / Residency
    if (cli.visaExpiryDate) {
      const days = (new Date(cli.visaExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `cli-visa-${cli.id}`,
        entityType: 'Client',
        entityId: cli.id,
        field: 'visaExpiryDate',
        numberField: 'visaNumber',
        identifier: cli.visaNumber || '—',
        title: `Owner Visa / Residency (${cli.fullName})`,
        category: 'Visa',
        entityName: `${cli.fullName} (Owner)`,
        clientName: cli.fullName,
        clientId: cli.id,
        expiryDate: cli.visaExpiryDate.toISOString(),
        issueDate: cli.visaIssueDate ? cli.visaIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: cli.email,
        contactPhone: cli.mobileNumber
      })
    }

    // Health Insurance
    if (cli.healthInsExpiryDate) {
      const days = (new Date(cli.healthInsExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `cli-ins-${cli.id}`,
        entityType: 'Client',
        entityId: cli.id,
        field: 'healthInsExpiryDate',
        numberField: 'healthInsNumber',
        identifier: cli.healthInsNumber || '—',
        title: `Owner Health Insurance (${cli.fullName})`,
        category: 'Insurance',
        entityName: `${cli.fullName} (Owner)`,
        clientName: cli.fullName,
        clientId: cli.id,
        expiryDate: cli.healthInsExpiryDate.toISOString(),
        issueDate: cli.healthInsIssueDate ? cli.healthInsIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: cli.email,
        contactPhone: cli.mobileNumber
      })
    }
  })

  // 1. Companies
  companies.forEach((comp) => {
    // Trade Licence
    if (comp.licenceExpiryDate) {
      const days = (new Date(comp.licenceExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `comp-lic-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'licenceExpiryDate',
        numberField: 'tradeLicenceNumber',
        identifier: comp.tradeLicenceNumber || '—',
        title: `Trade Licence (${comp.tradeLicenceNumber || comp.legalName})`,
        category: 'Trade Licence',
        entityName: comp.legalName,
        clientName: comp.client?.fullName || '—',
        clientId: comp.client?.id,
        companyId: comp.id,
        companyName: comp.legalName,
        expiryDate: comp.licenceExpiryDate.toISOString(),
        issueDate: comp.licenceIssueDate ? comp.licenceIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: comp.companyEmail || comp.client?.email,
        contactPhone: comp.companyMobile || comp.client?.mobileNumber
      })
    }

    // Establishment Card
    if (comp.estCardExpiryDate) {
      const days = (new Date(comp.estCardExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `comp-est-${comp.id}`,
        entityType: 'Company',
        entityId: comp.id,
        field: 'estCardExpiryDate',
        numberField: 'estCardNumber',
        identifier: comp.estCardNumber || '—',
        title: `Establishment Card (${comp.estCardNumber || comp.legalName})`,
        category: 'Establishment Card',
        entityName: comp.legalName,
        clientName: comp.client?.fullName || '—',
        clientId: comp.client?.id,
        companyId: comp.id,
        companyName: comp.legalName,
        expiryDate: comp.estCardExpiryDate.toISOString(),
        issueDate: comp.estCardIssueDate ? comp.estCardIssueDate.toISOString() : null,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        contactEmail: comp.companyEmail || comp.client?.email,
        contactPhone: comp.companyMobile || comp.client?.mobileNumber
      })
    }

    // 2. Employees / Members
    comp.employees.forEach((emp) => {
      // E-Visa
      if (emp.eVisaExpiryDate || emp.visaExpiryDate) {
        const exp = emp.eVisaExpiryDate || emp.visaExpiryDate
        const days = (new Date(exp!).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `emp-visa-${emp.id}`,
          entityType: 'Employee',
          entityId: emp.id,
          field: emp.eVisaExpiryDate ? 'eVisaExpiryDate' : 'visaExpiryDate',
          numberField: 'visaNumber',
          identifier: emp.visaNumber || emp.uidNumber || '—',
          title: `E-Visa (${emp.fullName})`,
          category: 'E-Visa',
          entityName: `${emp.fullName} • ${comp.legalName}`,
          personName: emp.fullName,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: exp!.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          extraInfo: `EID: ${emp.emiratesId || '—'} | Passport: ${emp.passportNumber || '—'}`
        })
      }

      // Emirates ID
      if (emp.eidExpiryDate) {
        const days = (new Date(emp.eidExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `emp-eid-${emp.id}`,
          entityType: 'Employee',
          entityId: emp.id,
          field: 'eidExpiryDate',
          numberField: 'emiratesId',
          identifier: emp.emiratesId || '—',
          title: `Emirates ID (${emp.fullName})`,
          category: 'Emirates ID',
          entityName: `${emp.fullName} • ${comp.legalName}`,
          personName: emp.fullName,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: emp.eidExpiryDate.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          extraInfo: `Passport: ${emp.passportNumber || '—'}`
        })
      }

      // Passport
      if (emp.passportExpiry) {
        const days = (new Date(emp.passportExpiry).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `emp-pass-${emp.id}`,
          entityType: 'Employee',
          entityId: emp.id,
          field: 'passportExpiry',
          numberField: 'passportNumber',
          identifier: emp.passportNumber || '—',
          title: `Passport (${emp.fullName})`,
          category: 'Passport',
          entityName: `${emp.fullName} • ${comp.legalName}`,
          personName: emp.fullName,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: emp.passportExpiry.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        })
      }

      // Health Insurance
      if (emp.healthInsExpiry) {
        const days = (new Date(emp.healthInsExpiry).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `emp-health-${emp.id}`,
          entityType: 'Employee',
          entityId: emp.id,
          field: 'healthInsExpiry',
          numberField: 'healthInsNumber',
          identifier: emp.healthInsNumber || '—',
          title: `Health Insurance (${emp.fullName})`,
          category: 'Health Insurance',
          entityName: `${emp.fullName} • ${comp.legalName}`,
          personName: emp.fullName,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: emp.healthInsExpiry.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        })
      }
    })

    // 3. Vehicles
    comp.vehicles.forEach((veh) => {
      if (veh.expDate) {
        const days = (new Date(veh.expDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `veh-reg-${veh.id}`,
          entityType: 'Vehicle',
          entityId: veh.id,
          field: 'expDate',
          numberField: 'regNo',
          identifier: veh.regNo,
          title: `Mulkiya / Registration (${veh.regNo})`,
          category: 'Vehicle Registration',
          entityName: `Plate ${veh.regNo} • ${comp.legalName}`,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: veh.expDate.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          extraInfo: `TC No: ${veh.tcNo || '—'}`
        })
      }

      if (veh.insuranceExpDate) {
        const days = (new Date(veh.insuranceExpDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `veh-ins-${veh.id}`,
          entityType: 'Vehicle',
          entityId: veh.id,
          field: 'insuranceExpDate',
          numberField: 'policyNo',
          identifier: veh.policyNo || '—',
          title: `Vehicle Insurance (${veh.regNo})`,
          category: 'Vehicle Insurance',
          entityName: `Plate ${veh.regNo} • ${comp.legalName}`,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: veh.insuranceExpDate.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        })
      }
    })

    // 4. Drivers
    comp.drivers.forEach((drv) => {
      if (drv.licenseExpDate) {
        const days = (new Date(drv.licenseExpDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
        allRenewals.push({
          id: `drv-lic-${drv.id}`,
          entityType: 'Driver',
          entityId: drv.id,
          field: 'licenseExpDate',
          identifier: '—',
          title: `Driving Licence (${drv.fullName})`,
          category: 'Driving Licence',
          entityName: `${drv.fullName} • ${comp.legalName}`,
          personName: drv.fullName,
          clientName: comp.client?.fullName || '—',
          clientId: comp.client?.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: drv.licenseExpDate.toISOString(),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        })
      }
    })
  })

  // 5. Standalone Documents
  standaloneDocs.forEach((doc) => {
    if (doc.expiryDate) {
      const days = (new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `doc-${doc.id}`,
        entityType: 'Document',
        entityId: doc.id,
        field: 'expiryDate',
        numberField: 'title',
        identifier: doc.title,
        title: doc.title,
        category: doc.documentType || 'Document',
        entityName: doc.company?.legalName || doc.client?.fullName || '—',
        clientName: doc.client?.fullName || '—',
        clientId: doc.client?.id,
        companyId: doc.company?.id,
        companyName: doc.company?.legalName,
        expiryDate: doc.expiryDate.toISOString(),
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
  })

    // Sort earliest expiry first
    allRenewals.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

    return allRenewals
  } catch (error) {
    console.error('getAllRenewals error:', error)
    return []
  }
}

export async function updateRenewalItem(params: {
  entityType: 'Company' | 'Employee' | 'Vehicle' | 'Driver' | 'Document' | 'Client'
  entityId: string
  field: string
  newExpiryDate: string
  newIdentifier?: string
  numberField?: string
  notes?: string
}) {
  const { entityType, entityId, field, newExpiryDate, newIdentifier, numberField } = params
  const expiryDateObj = new Date(newExpiryDate)

  try {
    if (entityType === 'Client') {
      const data: any = { [field]: expiryDateObj }
      if (numberField && newIdentifier) data[numberField] = newIdentifier
      await prisma.client.update({
        where: { id: entityId },
        data
      })
    } else if (entityType === 'Company') {
      const data: any = { [field]: expiryDateObj }
      if (numberField && newIdentifier) data[numberField] = newIdentifier
      await prisma.company.update({
        where: { id: entityId },
        data
      })
    } else if (entityType === 'Employee') {
      const data: any = { [field]: expiryDateObj }
      if (numberField && newIdentifier) data[numberField] = newIdentifier
      await prisma.employee.update({
        where: { id: entityId },
        data
      })
    } else if (entityType === 'Vehicle') {
      const data: any = { [field]: expiryDateObj }
      if (numberField && newIdentifier) data[numberField] = newIdentifier
      await prisma.vehicle.update({
        where: { id: entityId },
        data
      })
    } else if (entityType === 'Driver') {
      await prisma.driver.update({
        where: { id: entityId },
        data: { licenseExpDate: expiryDateObj }
      })
    } else if (entityType === 'Document') {
      await prisma.document.update({
        where: { id: entityId },
        data: { expiryDate: expiryDateObj }
      })
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        eventType: 'Renewal Updated',
        entityType,
        entityId,
        description: `Updated renewal date for ${entityType} to ${newExpiryDate}`
      }
    })

    revalidatePath('/renewals')
    revalidatePath('/')
    revalidatePath('/clients')
    revalidatePath('/companies')
    return { success: true }
  } catch (error) {
    console.error('Failed to update renewal item:', error)
    return { error: 'Failed to update renewal item.' }
  }
}
