'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'

export async function createClient(prevState: any, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const clientType = formData.get('clientType') as string
  const mobileNumber = formData.get('mobileNumber') as string
  const email = formData.get('email') as string
  
  if (!fullName || !clientType) {
    return { error: 'Full name and client type are required.' }
  }

  try {
    const client = await prisma.client.create({
      data: {
        fullName,
        clientType,
        mobileNumber,
        whatsappNumber: formData.get('whatsappNumber') as string,
        email,
        nationality: formData.get('nationality') as string,
        gender: formData.get('gender') as string,
        emiratesIdNumber: formData.get('emiratesIdNumber') as string,
        passportNumber: formData.get('passportNumber') as string,
        address: formData.get('address') as string,
        preferredCommunication: formData.get('preferredCommunication') as string,
        notes: formData.get('notes') as string,
        status: 'Active',
      }
    })

    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Client Created',
        entityType: 'Client',
        entityId: client.id,
        description: `Created new client: ${client.fullName}`,
      }
    })

    revalidatePath('/clients')
    return { success: true, clientId: client.id }
  } catch (error) {
    console.error('Failed to create client:', error)
    return { error: 'Failed to create client. Please check the inputs.' }
  }
}

export async function getClients(params?: {
  q?: string;
  type?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}) {
  const { q, type, status, sort = 'createdAt', order = 'desc', page = 1, pageSize = 25 } = params || {};
  
  const where: any = { archivedAt: null };
  
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { mobileNumber: { contains: q, mode: 'insensitive' } },
      { whatsappNumber: { contains: q, mode: 'insensitive' } },
      { companies: { some: { legalName: { contains: q, mode: 'insensitive' } } } }
    ];
  }

  if (type && type !== 'All') {
    where.clientType = type;
  }

  if (status && status !== 'All') {
    if (status === 'Archived') {
      delete where.archivedAt; 
      where.status = 'Archived';
    } else {
      where.status = status;
    }
  }

  try {
    const [totalCount, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          companies: { select: { id: true, legalName: true } },
          _count: {
            select: {
              companies: true,
              documents: true,
              services: true,
              actions: true
            }
          }
        }
      })
    ]);

    return { clients, totalCount };
  } catch (error) {
    console.error('Error fetching clients, attempting fallback retry:', error);
    try {
      // Retry once after 250ms
      await new Promise(res => setTimeout(res, 250));
      const totalCount = await prisma.client.count({ where });
      const clients = await prisma.client.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          companies: { select: { id: true, legalName: true } },
          _count: {
            select: {
              companies: true,
              documents: true,
              services: true,
              actions: true
            }
          }
        }
      });
      return { clients, totalCount };
    } catch (retryErr) {
      console.error('Fatal client fetch error:', retryErr);
      return { clients: [], totalCount: 0 };
    }
  }
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      companies: {
        include: { 
          personnel: true,
          vehicles: true,
          drivers: true,
          employees: true,
          vatFilings: true,
          services: true,
          documents: true,
          bankAccounts: true
        }
      },
      bankAccounts: true,
      services: true,
      documents: true,
      actions: {
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  if (!client) return null;

  const activityLogs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { entityId: id },
        { entityId: { in: client.companies.map((c: any) => c.id) } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return { ...client, activityLogs };
}

export async function addDocumentToClient(clientId: string, data: any) {
  try {
    const document = await prisma.document.create({
      data: {
        clientId,
        title: data.title,
        documentType: data.documentType,
        fileUrl: data.fileUrl || '/placeholder.pdf', // Mock upload URL
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.expiryDate && (new Date(data.expiryDate).getTime() < new Date().getTime()) ? 'Expired' : 'Valid',
      }
    })

    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Document Added',
        entityType: 'Document',
        entityId: document.id,
        description: `Added document: ${document.title} to client`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/') // Revalidate dashboard for metrics
    return { success: true, document }
  } catch (error) {
    console.error('Failed to add document:', error)
    return { error: 'Failed to add document.' }
  }
}

export async function updateClient(clientId: string, prevState: any, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const clientType = formData.get('clientType') as string
  
  if (!fullName || !clientType) {
    return { error: 'Full name and client type are required.' }
  }

  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        fullName,
        clientType,
        mobileNumber: formData.get('mobileNumber') as string,
        whatsappNumber: formData.get('whatsappNumber') as string,
        email: formData.get('email') as string,
        nationality: formData.get('nationality') as string,
        gender: formData.get('gender') as string,
        emiratesIdNumber: formData.get('emiratesIdNumber') as string,
        eidIssueDate: formData.get('eidIssueDate') ? new Date(formData.get('eidIssueDate') as string) : null,
        eidExpiryDate: formData.get('eidExpiryDate') ? new Date(formData.get('eidExpiryDate') as string) : null,
        passportNumber: formData.get('passportNumber') as string,
        passportIssueDate: formData.get('passportIssueDate') ? new Date(formData.get('passportIssueDate') as string) : null,
        passportExpiryDate: formData.get('passportExpiryDate') ? new Date(formData.get('passportExpiryDate') as string) : null,
        visaNumber: formData.get('visaNumber') as string,
        visaIssueDate: formData.get('visaIssueDate') ? new Date(formData.get('visaIssueDate') as string) : null,
        visaExpiryDate: formData.get('visaExpiryDate') ? new Date(formData.get('visaExpiryDate') as string) : null,
        healthInsNumber: formData.get('healthInsNumber') as string,
        healthInsIssueDate: formData.get('healthInsIssueDate') ? new Date(formData.get('healthInsIssueDate') as string) : null,
        healthInsExpiryDate: formData.get('healthInsExpiryDate') ? new Date(formData.get('healthInsExpiryDate') as string) : null,
        address: formData.get('address') as string,
        preferredCommunication: formData.get('preferredCommunication') as string,
        notes: formData.get('notes') as string,
      }
    })

    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Client Updated',
        entityType: 'Client',
        entityId: client.id,
        description: `Updated client: ${client.fullName}`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/clients')
    return { success: true, clientId: client.id }
  } catch (error) {
    console.error('Failed to update client:', error)
    return { error: 'Failed to update client. Please check the inputs.' }
  }
}

export async function addVehicleToCompany(companyId: string, formData: FormData) {
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        companyId,
        regNo: formData.get('regNo') as string,
        tcNo: formData.get('tcNo') as string,
        policyNo: formData.get('policyNo') as string,
        regDate: formData.get('regDate') ? new Date(formData.get('regDate') as string) : null,
        expDate: formData.get('expDate') ? new Date(formData.get('expDate') as string) : null,
        insuranceIssueDate: formData.get('insuranceIssueDate') ? new Date(formData.get('insuranceIssueDate') as string) : null,
        insuranceExpDate: formData.get('insuranceExpDate') ? new Date(formData.get('insuranceExpDate') as string) : null,
      }
    })
    
    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Vehicle Added',
        entityType: 'Vehicle',
        entityId: vehicle.id,
        description: `Added vehicle ${vehicle.regNo} to company`,
      }
    })

    revalidatePath(`/clients`)
    revalidatePath('/')
    return { success: true, vehicle }
  } catch (error) {
    console.error('Failed to add vehicle:', error)
    return { error: 'Failed to add vehicle.' }
  }
}

export async function addDriverToCompany(companyId: string, formData: FormData) {
  try {
    const driver = await prisma.driver.create({
      data: {
        companyId,
        fullName: formData.get('fullName') as string,
        licenseIssueDate: formData.get('licenseIssueDate') ? new Date(formData.get('licenseIssueDate') as string) : null,
        licenseExpDate: formData.get('licenseExpDate') ? new Date(formData.get('licenseExpDate') as string) : null,
      }
    })
    
    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Driver Added',
        entityType: 'Driver',
        entityId: driver.id,
        description: `Added driver ${driver.fullName} to company`,
      }
    })

    revalidatePath(`/clients`)
    revalidatePath('/')
    return { success: true, driver }
  } catch (error) {
    console.error('Failed to add driver:', error)
    return { error: 'Failed to add driver.' }
  }
}

export async function addEmployeeToCompany(companyId: string, formData: FormData) {
  try {
    const employee = await prisma.employee.create({
      data: {
        companyId,
        fullName: formData.get('fullName') as string,
        designation: (formData.get('designation') as string) || (formData.get('memberType') as string) || 'Partner',
        visaType: (formData.get('memberType') as string) || (formData.get('visaType') as string) || 'Partner',
        passportNumber: formData.get('passportNumber') as string,
        passportIssueDate: formData.get('passportIssueDate') ? new Date(formData.get('passportIssueDate') as string) : null,
        passportExpiry: (formData.get('passportExpiry') || formData.get('passportExpiryDate')) ? new Date((formData.get('passportExpiry') || formData.get('passportExpiryDate')) as string) : null,
        emiratesId: formData.get('emiratesId') as string,
        eidExpiryDate: formData.get('eidExpiryDate') ? new Date(formData.get('eidExpiryDate') as string) : null,
        healthInsExpiry: formData.get('healthInsExpiry') ? new Date(formData.get('healthInsExpiry') as string) : null,
        eVisaIssueDate: formData.get('eVisaIssueDate') ? new Date(formData.get('eVisaIssueDate') as string) : null,
        eVisaExpiryDate: formData.get('eVisaExpiryDate') ? new Date(formData.get('eVisaExpiryDate') as string) : null,
      }
    })
    
    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Employee Added',
        entityType: 'Employee',
        entityId: employee.id,
        description: `Added employee ${employee.fullName} to company`,
      }
    })

    revalidatePath(`/clients`)
    revalidatePath('/')
    return { success: true, employee }
  } catch (error) {
    console.error('Failed to add employee:', error)
    return { error: 'Failed to add employee.' }
  }
}

export async function createClientComprehensive(data: any) {
  try {
    const { client, company, members = [], vehicles = [], drivers = [], services = [], documents = [], payment, reminder } = data

    const hasCompany = !!company?.legalName

    let paymentNotes = ''
    if (payment && (payment.totalBilled || payment.amountReceived || payment.method)) {
      paymentNotes = `\n\n--- Payment Details ---\nTotal Billed: ${payment.totalBilled || 0} AED\nAmount Received: ${payment.amountReceived || 0} AED\nStatus: ${payment.status || 'Unpaid'}\nMethod: ${payment.method || ''}\nReference/Notes: ${payment.reference || ''}`
    }

    // Duplicate Detection
    const duplicateChecks = []
    if (client.email) duplicateChecks.push({ email: { equals: client.email, mode: 'insensitive' } })
    if (client.mobileNumber) duplicateChecks.push({ mobileNumber: client.mobileNumber })
    if (hasCompany && company.legalName) duplicateChecks.push({ companies: { some: { legalName: { equals: company.legalName, mode: 'insensitive' } } } })

    if (duplicateChecks.length > 0) {
      const duplicate = await prisma.client.findFirst({
        where: { OR: duplicateChecks as any[] },
        select: { fullName: true }
      })
      if (duplicate) {
        return { error: `A client with similar details (Email, Phone, or Company Name) already exists: ${duplicate.fullName}` }
      }
    }

    const createdClient = await prisma.client.create({
      data: {
        fullName: client.fullName,
        clientType: client.clientType,
        nationality: client.nationality || null,
        gender: client.gender || null,
        mobileNumber: client.mobileNumber || null,
        whatsappNumber: client.whatsappNumber || null,
        email: client.email || null,
        address: client.address || null,
        emiratesIdNumber: client.emiratesIdNumber || null,
        eidIssueDate: client.eidIssueDate ? new Date(client.eidIssueDate) : null,
        eidExpiryDate: client.eidExpiryDate ? new Date(client.eidExpiryDate) : null,
        passportNumber: client.passportNumber || null,
        passportIssueDate: client.passportIssueDate ? new Date(client.passportIssueDate) : null,
        passportExpiryDate: client.passportExpiryDate ? new Date(client.passportExpiryDate) : null,
        visaNumber: client.visaNumber || null,
        visaIssueDate: client.visaIssueDate ? new Date(client.visaIssueDate) : null,
        visaExpiryDate: client.visaExpiryDate ? new Date(client.visaExpiryDate) : null,
        healthInsNumber: client.healthInsNumber || null,
        healthInsIssueDate: client.healthInsIssueDate ? new Date(client.healthInsIssueDate) : null,
        healthInsExpiryDate: client.healthInsExpiryDate ? new Date(client.healthInsExpiryDate) : null,
        notes: paymentNotes,
        status: 'Active',
        
        services: services.filter((s: any) => s && s.name && s.name.trim() !== '').length > 0 ? {
          create: services
            .filter((s: any) => s && s.name && s.name.trim() !== '')
            .map((s: any) => {
              const formattedDetails = s.values && typeof s.values === 'object'
                ? Object.entries(s.values)
                    .filter(([_, v]) => v && String(v).trim() !== '')
                    .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}: ${v}`)
                    .join(' | ')
                : ''

              return {
                name: s.name.trim(),
                category: s.category || 'General',
                description: formattedDetails || s.description || null,
                notes: s.values ? JSON.stringify(s.values) : (s.notes || null),
                status: s.status || 'In progress',
                paymentStatus: s.paymentStatus || 'Unpaid',
                price: s.price && !isNaN(parseFloat(s.price)) ? parseFloat(s.price) : null,
                targetCompletion: s.targetCompletion ? new Date(s.targetCompletion) : null,
              }
            })
        } : undefined,

        documents: documents.filter((doc: any) => doc && doc.title && doc.title.trim() !== '').length > 0 ? {
          create: documents
            .filter((doc: any) => doc && doc.title && doc.title.trim() !== '')
            .map((doc: any) => ({
              title: doc.title.trim(),
              documentType: doc.documentType || 'Other',
              fileUrl: '/placeholder.pdf',
              issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
              status: doc.expiryDate && (new Date(doc.expiryDate).getTime() < new Date().getTime()) ? 'Expired' : 'Valid',
            }))
        } : undefined,
        
        companies: hasCompany ? {
          create: {
            legalName: company.legalName,
            tradeLicenceNumber: company.tradeLicenceNumber || null,
            licenceExpiryDate: company.licenceExpiryDate ? new Date(company.licenceExpiryDate) : null,
            vatTrn: company.vatTrn || null,
            estCardNumber: company.estCardNumber || null,
            estCardExpiryDate: company.estCardExpiryDate ? new Date(company.estCardExpiryDate) : null,
            corporateTaxRegNumber: company.corporateTaxRegNumber || null,
            
            employees: members.length > 0 ? {
              create: members.map((m: any) => ({
                fullName: m.fullName,
                designation: m.designation || m.memberType || 'Partner',
                visaType: m.memberType || m.visaType || 'Partner',
                passportNumber: m.passportNumber || null,
                passportIssueDate: m.passportIssueDate ? new Date(m.passportIssueDate) : null,
                passportExpiry: (m.passportExpiry || m.passportExpiryDate) ? new Date(m.passportExpiry || m.passportExpiryDate) : null,
                emiratesId: m.emiratesId || null,
                eidExpiryDate: m.eidExpiryDate ? new Date(m.eidExpiryDate) : null,
                healthInsExpiry: m.healthInsExpiry ? new Date(m.healthInsExpiry) : null,
                eVisaIssueDate: m.eVisaIssueDate ? new Date(m.eVisaIssueDate) : null,
                eVisaExpiryDate: m.eVisaExpiryDate ? new Date(m.eVisaExpiryDate) : null,
              }))
            } : undefined,
            
            vehicles: vehicles.length > 0 ? {
              create: vehicles.map((v: any) => ({
                regNo: v.regNo,
                tcNo: v.tcNo || null,
                policyNo: v.policyNo || null,
                regDate: v.regDate ? new Date(v.regDate) : null,
                expDate: v.expDate ? new Date(v.expDate) : null,
                insuranceIssueDate: v.insuranceIssueDate ? new Date(v.insuranceIssueDate) : null,
                insuranceExpDate: v.insuranceExpDate ? new Date(v.insuranceExpDate) : null,
              }))
            } : undefined,
            
            drivers: drivers.length > 0 ? {
              create: drivers.map((d: any) => ({
                fullName: d.fullName,
                licenseIssueDate: d.licenseIssueDate ? new Date(d.licenseIssueDate) : null,
                licenseExpDate: d.licenseExpDate ? new Date(d.licenseExpDate) : null,
              }))
            } : undefined
          }
        } : undefined
      }
    })

    if (reminder && reminder.dueDate) {
      await prisma.action.create({
        data: {
          title: `Follow-up for ${createdClient.fullName}`,
          description: reminder.notes || 'Automated wizard reminder.',
          actionType: 'Follow-up',
          entityType: 'Client',
          entityId: createdClient.id,
          clientId: createdClient.id,
          dueDate: new Date(reminder.dueDate),
          status: 'Pending'
        }
      })
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        eventType: 'Client Created (Comprehensive)',
        entityType: 'Client',
        entityId: createdClient.id,
        description: `Created new client with 10-step wizard: ${createdClient.fullName}`,
      }
    })

    revalidatePath('/clients')
    return { success: true, clientId: createdClient.id }
  } catch (error: any) {
    console.error('Failed to create comprehensive client:', error)
    return { error: error?.message || 'Failed to create client. Please check your data.' }
  }
}

export async function archiveClient(id: string) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: { 
        status: 'Archived',
        archivedAt: new Date()
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Client Archived',
        entityType: 'Client',
        entityId: id,
        description: `Archived client: ${client.fullName}`,
      }
    })

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to archive client:', error)
    return { error: 'Failed to archive client.' }
  }
}

export async function restoreClient(id: string) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: { 
        status: 'Active',
        archivedAt: null
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Client Restored',
        entityType: 'Client',
        entityId: id,
        description: `Restored client: ${client.fullName}`,
      }
    })

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to restore client:', error)
    return { error: 'Failed to restore client.' }
  }
}

export async function toggleClientActionStatus(actionId: string, currentStatus: string, clientId?: string) {
  try {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    await prisma.action.update({
      where: { id: actionId },
      data: { status: newStatus }
    })

    if (clientId) {
      revalidatePath(`/clients/${clientId}`)
    }
    revalidatePath('/clients')
    revalidatePath('/')
    return { success: true, status: newStatus }
  } catch (error) {
    console.error('Failed to toggle action status:', error)
    return { error: 'Failed to toggle action status.' }
  }
}

export async function deleteClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { companies: { select: { id: true } } }
    })

    if (!client) {
      return { error: 'Client not found.' }
    }

    const companyIds = client.companies.map((c: any) => c.id)

    await prisma.$transaction(async (tx) => {
      // 1. Delete all company child entities
      if (companyIds.length > 0) {
        await tx.vehicle.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.driver.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.employee.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.companyPersonnel.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.vATFiling.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.document.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.service.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.bankAccount.deleteMany({ where: { companyId: { in: companyIds } } })
        await tx.company.deleteMany({ where: { id: { in: companyIds } } })
      }

      // 2. Delete direct client relations
      await tx.action.deleteMany({ where: { clientId: id } })
      await tx.document.deleteMany({ where: { clientId: id } })
      await tx.service.deleteMany({ where: { clientId: id } })
      await tx.bankAccount.deleteMany({ where: { clientId: id } })
      await tx.client.delete({ where: { id } })
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Client Deleted',
        entityType: 'Client',
        entityId: id,
        description: `Permanently deleted client: ${client.fullName} and all company data`,
      }
    })

    revalidatePath('/clients')
    revalidatePath('/companies')
    revalidatePath('/renewals')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete client completely:', error)
    return { error: 'Failed to delete client and associated company data.' }
  }
}

export async function updateClientComprehensive(clientId: string, payload: any) {
  try {
    const { 
      clientData, 
      companyData, 
      members = [], 
      vehicles = [], 
      drivers = [], 
      services = [], 
      documents = [], 
      payment, 
      reminder 
    } = payload

    let paymentNotes = ''
    if (payment && (payment.totalBilled || payment.amountReceived || payment.method)) {
      paymentNotes = `\n\n--- Payment Details ---\nTotal Billed: ${payment.totalBilled || 0} AED\nAmount Received: ${payment.amountReceived || 0} AED\nStatus: ${payment.status || 'Unpaid'}\nMethod: ${payment.method || ''}\nReference/Notes: ${payment.reference || ''}`
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Client basic and contact info
      await tx.client.update({
        where: { id: clientId },
        data: {
          fullName: clientData.fullName,
          clientType: clientData.clientType,
          mobileNumber: clientData.mobileNumber || null,
          whatsappNumber: clientData.whatsappNumber || null,
          email: clientData.email || null,
          nationality: clientData.nationality || null,
          gender: clientData.gender || null,
          emiratesIdNumber: clientData.emiratesIdNumber || null,
          eidIssueDate: clientData.eidIssueDate ? new Date(clientData.eidIssueDate) : null,
          eidExpiryDate: clientData.eidExpiryDate ? new Date(clientData.eidExpiryDate) : null,
          passportNumber: clientData.passportNumber || null,
          passportIssueDate: clientData.passportIssueDate ? new Date(clientData.passportIssueDate) : null,
          passportExpiryDate: clientData.passportExpiryDate ? new Date(clientData.passportExpiryDate) : null,
          visaNumber: clientData.visaNumber || null,
          visaIssueDate: clientData.visaIssueDate ? new Date(clientData.visaIssueDate) : null,
          visaExpiryDate: clientData.visaExpiryDate ? new Date(clientData.visaExpiryDate) : null,
          healthInsNumber: clientData.healthInsNumber || null,
          healthInsIssueDate: clientData.healthInsIssueDate ? new Date(clientData.healthInsIssueDate) : null,
          healthInsExpiryDate: clientData.healthInsExpiryDate ? new Date(clientData.healthInsExpiryDate) : null,
          address: clientData.address || null,
          preferredCommunication: clientData.preferredCommunication || null,
          notes: (clientData.notes ? clientData.notes + paymentNotes : paymentNotes) || null,
        }
      })

      // 2. Update or Create Company info if provided
      let currentCompanyId = companyData?.id || null
      if (companyData && companyData.legalName) {
        if (currentCompanyId) {
          await tx.company.update({
            where: { id: currentCompanyId },
            data: {
              legalName: companyData.legalName,
              tradeName: companyData.tradeName || null,
              tradeLicenceNumber: companyData.tradeLicenceNumber || null,
              licenceIssueDate: companyData.licenceIssueDate ? new Date(companyData.licenceIssueDate) : null,
              licenceExpiryDate: companyData.licenceExpiryDate ? new Date(companyData.licenceExpiryDate) : null,
              estCardNumber: companyData.estCardNumber || null,
              estCardIssueDate: companyData.estCardIssueDate ? new Date(companyData.estCardIssueDate) : null,
              estCardExpiryDate: companyData.estCardExpiryDate ? new Date(companyData.estCardExpiryDate) : null,
              vatTrn: companyData.vatTrn || null,
              corporateTaxRegNumber: companyData.corporateTaxRegNumber || null,
              zoneType: companyData.zoneType || 'Mainland',
              registeredEmirate: companyData.registeredEmirate || null,
              companyEmail: companyData.companyEmail || null,
              companyMobile: companyData.companyMobile || null,
              registeredAddress: companyData.registeredAddress || null,
            }
          })
        } else {
          const newComp = await tx.company.create({
            data: {
              clientId,
              legalName: companyData.legalName,
              tradeName: companyData.tradeName || null,
              tradeLicenceNumber: companyData.tradeLicenceNumber || null,
              licenceIssueDate: companyData.licenceIssueDate ? new Date(companyData.licenceIssueDate) : null,
              licenceExpiryDate: companyData.licenceExpiryDate ? new Date(companyData.licenceExpiryDate) : null,
              estCardNumber: companyData.estCardNumber || null,
              estCardIssueDate: companyData.estCardIssueDate ? new Date(companyData.estCardIssueDate) : null,
              estCardExpiryDate: companyData.estCardExpiryDate ? new Date(companyData.estCardExpiryDate) : null,
              vatTrn: companyData.vatTrn || null,
              corporateTaxRegNumber: companyData.corporateTaxRegNumber || null,
              zoneType: companyData.zoneType || 'Mainland',
              registeredEmirate: companyData.registeredEmirate || null,
              companyEmail: companyData.companyEmail || null,
              companyMobile: companyData.companyMobile || null,
              registeredAddress: companyData.registeredAddress || null,
              status: 'Active'
            }
          })
          currentCompanyId = newComp.id
        }
      }

      // 3. Sync Company Child Entities (Employees, Vehicles, Drivers)
      if (currentCompanyId) {
        // Sync Employees/Members
        if (members && members.length > 0) {
          await tx.employee.deleteMany({ where: { companyId: currentCompanyId } })
          await tx.employee.createMany({
            data: members
              .filter((m: any) => m && m.fullName && m.fullName.trim() !== '')
              .map((m: any) => ({
                companyId: currentCompanyId,
                fullName: m.fullName.trim(),
                designation: m.designation || m.memberType || 'Partner',
                visaType: m.memberType || m.visaType || 'Partner',
                passportNumber: m.passportNumber || null,
                passportIssueDate: m.passportIssueDate ? new Date(m.passportIssueDate) : null,
                passportExpiry: (m.passportExpiry || m.passportExpiryDate) ? new Date(m.passportExpiry || m.passportExpiryDate) : null,
                emiratesId: m.emiratesId || null,
                eidExpiryDate: m.eidExpiryDate ? new Date(m.eidExpiryDate) : null,
                healthInsExpiry: m.healthInsExpiry ? new Date(m.healthInsExpiry) : null,
                eVisaIssueDate: m.eVisaIssueDate ? new Date(m.eVisaIssueDate) : null,
                eVisaExpiryDate: m.eVisaExpiryDate ? new Date(m.eVisaExpiryDate) : null,
              }))
          })
        }

        // Sync Vehicles
        if (vehicles && vehicles.length > 0) {
          await tx.vehicle.deleteMany({ where: { companyId: currentCompanyId } })
          await tx.vehicle.createMany({
            data: vehicles
              .filter((v: any) => v && v.regNo && v.regNo.trim() !== '')
              .map((v: any) => ({
                companyId: currentCompanyId,
                regNo: v.regNo.trim(),
                tcNo: v.tcNo || null,
                policyNo: v.policyNo || null,
                regDate: v.regDate ? new Date(v.regDate) : null,
                expDate: v.expDate ? new Date(v.expDate) : null,
                insuranceIssueDate: v.insuranceIssueDate ? new Date(v.insuranceIssueDate) : null,
                insuranceExpDate: v.insuranceExpDate ? new Date(v.insuranceExpDate) : null,
              }))
          })
        }

        // Sync Drivers
        if (drivers && drivers.length > 0) {
          await tx.driver.deleteMany({ where: { companyId: currentCompanyId } })
          await tx.driver.createMany({
            data: drivers
              .filter((d: any) => d && d.fullName && d.fullName.trim() !== '')
              .map((d: any) => ({
                companyId: currentCompanyId,
                fullName: d.fullName.trim(),
                licenseIssueDate: d.licenseIssueDate ? new Date(d.licenseIssueDate) : null,
                licenseExpDate: d.licenseExpDate ? new Date(d.licenseExpDate) : null,
              }))
          })
        }
      }

      // 4. Sync Services
      if (services && Array.isArray(services)) {
        await tx.service.deleteMany({ where: { clientId } })
        const validServices = services.filter((s: any) => s && s.name && s.name.trim() !== '')
        if (validServices.length > 0) {
          await tx.service.createMany({
            data: validServices.map((s: any) => {
              const formattedDetails = s.values && typeof s.values === 'object'
                ? Object.entries(s.values)
                    .filter(([_, v]) => v && String(v).trim() !== '')
                    .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}: ${v}`)
                    .join(' | ')
                : ''

              return {
                clientId,
                companyId: currentCompanyId,
                name: s.name.trim(),
                category: s.category || 'General',
                description: formattedDetails || s.description || null,
                notes: s.values ? JSON.stringify(s.values) : (s.notes || null),
                status: s.status || 'In progress',
                paymentStatus: s.paymentStatus || 'Unpaid',
                price: s.price && !isNaN(parseFloat(s.price)) ? parseFloat(s.price) : null,
                targetCompletion: s.targetCompletion ? new Date(s.targetCompletion) : null,
              }
            })
          })
        }
      }

      // 5. Sync Documents
      if (documents && Array.isArray(documents)) {
        const validDocs = documents.filter((doc: any) => doc && doc.title && doc.title.trim() !== '')
        if (validDocs.length > 0) {
          await tx.document.deleteMany({ where: { clientId } })
          await tx.document.createMany({
            data: validDocs.map((doc: any) => ({
              clientId,
              companyId: currentCompanyId,
              title: doc.title.trim(),
              documentType: doc.documentType || 'Other',
              fileUrl: doc.fileUrl || '/placeholder.pdf',
              issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
              status: doc.expiryDate && (new Date(doc.expiryDate).getTime() < new Date().getTime()) ? 'Expired' : 'Valid',
            }))
          })
        }
      }

      // 6. Reminder
      if (reminder && reminder.dueDate) {
        await tx.action.create({
          data: {
            title: `Follow-up for ${clientData.fullName}`,
            description: reminder.notes || 'Updated via wizard.',
            actionType: 'Follow-up',
            entityType: 'Client',
            entityId: clientId,
            clientId,
            dueDate: new Date(reminder.dueDate),
            status: 'Pending'
          }
        })
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Client Comprehensive Update',
        entityType: 'Client',
        entityId: clientId,
        description: `Updated client and all operations via 10-step wizard for ${clientData.fullName}`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/clients')
    revalidatePath('/companies')
    revalidatePath('/renewals')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update client comprehensively:', error)
    return { error: error?.message || 'Failed to update client. Please check your inputs.' }
  }
}

export async function deleteCompany(id: string) {
  try {
    await prisma.company.delete({ where: { id } })
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete company:', error)
    return { error: 'Failed to delete company.' }
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({ where: { id } })
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete employee.' }
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } })
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete vehicle.' }
  }
}

export async function deleteDriver(id: string) {
  try {
    await prisma.driver.delete({ where: { id } })
    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete driver.' }
  }
}

export async function editEmployee(id: string, formData: FormData) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: formData.get('fullName') as string,
        passportNumber: formData.get('passportNumber') as string,
        passportIssueDate: formData.get('passportIssueDate') ? new Date(formData.get('passportIssueDate') as string) : null,
        passportExpiry: formData.get('passportExpiry') ? new Date(formData.get('passportExpiry') as string) : null,
        emiratesId: formData.get('emiratesId') as string,
        eidExpiryDate: formData.get('eidExpiryDate') ? new Date(formData.get('eidExpiryDate') as string) : null,
        healthInsExpiry: formData.get('healthInsExpiry') ? new Date(formData.get('healthInsExpiry') as string) : null,
        eVisaIssueDate: formData.get('eVisaIssueDate') ? new Date(formData.get('eVisaIssueDate') as string) : null,
        eVisaExpiryDate: formData.get('eVisaExpiryDate') ? new Date(formData.get('eVisaExpiryDate') as string) : null,
      }
    })
    revalidatePath('/clients')
    return { success: true, employee }
  } catch (error) {
    return { error: 'Failed to edit employee.' }
  }
}

export async function editVehicle(id: string, formData: FormData) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        regNo: formData.get('regNo') as string,
        tcNo: formData.get('tcNo') as string,
        policyNo: formData.get('policyNo') as string,
        regDate: formData.get('regDate') ? new Date(formData.get('regDate') as string) : null,
        expDate: formData.get('expDate') ? new Date(formData.get('expDate') as string) : null,
        insuranceIssueDate: formData.get('insuranceIssueDate') ? new Date(formData.get('insuranceIssueDate') as string) : null,
        insuranceExpDate: formData.get('insuranceExpDate') ? new Date(formData.get('insuranceExpDate') as string) : null,
      }
    })
    revalidatePath('/clients')
    return { success: true, vehicle }
  } catch (error) {
    return { error: 'Failed to edit vehicle.' }
  }
}

export async function editDriver(id: string, formData: FormData) {
  try {
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        fullName: formData.get('fullName') as string,
        licenseIssueDate: formData.get('licenseIssueDate') ? new Date(formData.get('licenseIssueDate') as string) : null,
        licenseExpDate: formData.get('licenseExpDate') ? new Date(formData.get('licenseExpDate') as string) : null,
      }
    })
    revalidatePath('/clients')
    return { success: true, driver }
  } catch (error) {
    return { error: 'Failed to edit driver.' }
  }
}

export async function addServiceToClient(clientId: string, data: any) {
  try {
    const service = await prisma.service.create({
      data: {
        clientId,
        name: data.name,
        category: data.category,
        status: data.status || 'Pending',
        paymentStatus: data.paymentStatus || 'Unpaid',
        price: data.price ? parseFloat(data.price) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetCompletion: data.targetCompletion ? new Date(data.targetCompletion) : null,
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Service Added',
        entityType: 'Service',
        entityId: service.id,
        description: `Added service: ${service.name} to client`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    return { success: true, service }
  } catch (error) {
    console.error('Failed to add service:', error)
    return { error: 'Failed to add service.' }
  }
}

export async function updateClientNotes(clientId: string, notes: string) {
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { notes }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Notes Updated',
        entityType: 'Client',
        entityId: clientId,
        description: `Updated notes for client`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update notes:', error)
    return { error: 'Failed to update notes.' }
  }
}

export async function addBankAccountToClient(clientId: string, data: {
  bankName: string
  accountName?: string
  accountNumber: string
  iban?: string
  swiftCode?: string
  currency?: string
  branch?: string
  accountType?: string
  companyId?: string
}) {
  try {
    const bankAccount = await prisma.bankAccount.create({
      data: {
        clientId,
        companyId: data.companyId || null,
        bankName: data.bankName,
        accountName: data.accountName || 'Primary Account',
        accountNumber: data.accountNumber,
        iban: data.iban || null,
        swiftCode: data.swiftCode || null,
        branch: data.branch || null,
        currency: data.currency || 'AED',
        accountStatus: 'Active',
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Bank Account Added',
        entityType: 'BankAccount',
        entityId: bankAccount.id,
        description: `Added bank account: ${bankAccount.bankName} (${bankAccount.accountNumber})`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/clients')
    return { success: true, bankAccount }
  } catch (error: any) {
    console.error('Failed to add bank account:', error)
    return { error: error?.message || 'Failed to add bank account.' }
  }
}

export async function deleteBankAccount(bankAccountId: string, clientId: string) {
  try {
    await prisma.bankAccount.delete({
      where: { id: bankAccountId }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Bank Account Deleted',
        entityType: 'BankAccount',
        entityId: bankAccountId,
        description: `Deleted bank account`,
      }
    })

    revalidatePath(`/clients/${clientId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete bank account:', error)
    return { error: 'Failed to delete bank account.' }
  }
}

