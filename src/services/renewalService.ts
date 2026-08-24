import prisma from '@/lib/db'

export interface UnifiedRenewalItem {
  id: string
  title: string
  category: string
  type: string
  identifier: string
  companyId: string | null
  companyName: string
  clientId: string | null
  clientName: string
  expiryDate: string
  daysUntil: number
  isExpired: boolean
  isExpiringSoon: boolean
  status: 'Valid' | 'Due Soon' | 'Expired'
}

export async function getUnifiedRenewalsRadar(options?: {
  companyIds?: string[]
  clientId?: string
}): Promise<UnifiedRenewalItem[]> {
  const now = new Date()

  const calculateDays = (date: Date) => {
    return Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 3600 * 24))
  }

  const whereCompany: any = {}
  if (options?.companyIds && options.companyIds.length > 0) {
    whereCompany.id = { in: options.companyIds }
  }
  if (options?.clientId) {
    whereCompany.clientId = options.clientId
  }

  const [companies, clients] = await Promise.all([
    prisma.company.findMany({
      where: whereCompany,
      include: {
        client: true,
        employees: true,
        vehicles: true,
      },
    }),
    options?.clientId
      ? prisma.client.findMany({ where: { id: options.clientId } })
      : prisma.client.findMany(),
  ])

  const renewalsList: UnifiedRenewalItem[] = []

  // 1. Company Trade Licences & Establishment Cards
  companies.forEach((co) => {
    const cName = co.legalName
    const cliId = co.clientId
    const cliName = co.client?.fullName || '—'

    if (co.licenceExpiryDate) {
      const days = calculateDays(co.licenceExpiryDate)
      renewalsList.push({
        id: `licence-${co.id}`,
        title: `${cName} - Trade Licence`,
        category: 'Trade Licence',
        type: 'Trade Licence',
        identifier: co.tradeLicenceNumber || '—',
        companyId: co.id,
        companyName: cName,
        clientId: cliId,
        clientName: cliName,
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
        title: `${cName} - Establishment Card`,
        category: 'Establishment Card',
        type: 'Establishment Card',
        identifier: co.estCardNumber || '—',
        companyId: co.id,
        companyName: cName,
        clientId: cliId,
        clientName: cliName,
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
          expiryDate: veh.insuranceExpDate.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })

    // 3. Employees Visas, Passports, EIDs & Health Insurances
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
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
          companyName: cName,
          clientId: cliId,
          clientName: cliName,
          expiryDate: emp.healthInsExpiry.toISOString(),
          daysUntil: days,
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60,
          status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
        })
      }
    })
  })

  // 4. Personal Client Identity Records
  clients.forEach((cli) => {
    if (cli.passportExpiryDate) {
      const days = calculateDays(cli.passportExpiryDate)
      renewalsList.push({
        id: `cli-pass-${cli.id}`,
        title: `Owner Passport (${cli.fullName})`,
        category: 'Passport',
        type: 'Personal Passport',
        identifier: cli.passportNumber || '—',
        companyId: null,
        companyName: 'Personal Identity',
        clientId: cli.id,
        clientName: cli.fullName,
        expiryDate: cli.passportExpiryDate.toISOString(),
        daysUntil: days,
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    if (cli.eidExpiryDate) {
      const days = calculateDays(cli.eidExpiryDate)
      renewalsList.push({
        id: `cli-eid-${cli.id}`,
        title: `Owner Emirates ID (${cli.fullName})`,
        category: 'Emirates ID',
        type: 'Personal Emirates ID',
        identifier: cli.emiratesIdNumber || '—',
        companyId: null,
        companyName: 'Personal Identity',
        clientId: cli.id,
        clientName: cli.fullName,
        expiryDate: cli.eidExpiryDate.toISOString(),
        daysUntil: days,
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
      })
    }

    if (cli.visaExpiryDate) {
      const days = calculateDays(cli.visaExpiryDate)
      renewalsList.push({
        id: `cli-visa-${cli.id}`,
        title: `Owner Residence Visa (${cli.fullName})`,
        category: 'Visa',
        type: 'Investor / Partner Visa',
        identifier: cli.visaNumber || '—',
        companyId: null,
        companyName: 'Personal Identity',
        clientId: cli.id,
        clientName: cli.fullName,
        expiryDate: cli.visaExpiryDate.toISOString(),
        daysUntil: days,
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60,
        status: days < 0 ? 'Expired' : days <= 60 ? 'Due Soon' : 'Valid',
      })
    }
  })

  // Sort by urgency: expired first, then closest expiries
  renewalsList.sort((a, b) => a.daysUntil - b.daysUntil)

  return renewalsList
}

export async function createRenewalRequest(data: {
  title: string
  type: string
  companyId?: string
  expiryDate?: string
  clientId: string
  portalUserId: string
}) {
  const { title, type, companyId, expiryDate, clientId, portalUserId } = data

  const now = new Date()
  const requestNumber = `REN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  // 1. Create client request
  const request = await prisma.clientRequest.create({
    data: {
      requestNumber,
      clientId,
      portalUserId,
      companyId: companyId || null,
      category: 'Renewal',
      subject: `Renewal Request: ${title}`,
      message: `Client requested renewal for ${type} (${title}). Current Expiry: ${expiryDate || 'N/A'}.`,
      priority: 'High',
      status: 'Open',
      messages: {
        create: {
          senderType: 'CLIENT',
          senderName: 'Client via Portal',
          message: `Please initiate the renewal process for ${title}.`,
        },
      },
    },
  })

  // 2. Create CRM Action for Admin
  await prisma.action.create({
    data: {
      title: `Process Renewal: ${title}`,
      description: `Client requested renewal via Portal. Request ticket #${requestNumber}.`,
      actionType: 'Renewal',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      clientId,
      entityType: companyId ? 'Company' : 'Client',
      entityId: companyId || clientId,
    },
  })

  // 3. Create Notification for client
  await prisma.portalNotification.create({
    data: {
      clientId,
      portalUserId,
      title: `Renewal Request Logged: ${requestNumber}`,
      message: `Your renewal request for "${title}" has been received. An advisor will contact you shortly.`,
      type: 'REQUEST_UPDATE',
      relatedEntityType: 'Request',
      relatedEntityId: request.id,
    },
  })

  return { success: true, requestNumber, requestId: request.id }
}
