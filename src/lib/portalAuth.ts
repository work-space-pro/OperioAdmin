import { redirect } from 'next/navigation'
import { verifyPortalSession } from './portalSession'

export interface AuthenticatedPortalContext {
  portalUser: {
    id: string
    clientId: string
    email: string
    fullName: string | null
    status: string
    lastLogin: Date | null
  }
  client: {
    id: string
    fullName: string
    email: string | null
    mobileNumber: string | null
    whatsappNumber: string | null
    nationality: string | null
    clientType: string
    address: string | null
    passportNumber?: string | null
    passportExpiryDate?: Date | null
    emiratesIdNumber?: string | null
    eidExpiryDate?: Date | null
    visaNumber?: string | null
    visaExpiryDate?: Date | null
    healthInsNumber?: string | null
    healthInsExpiryDate?: Date | null
  }
  companies: Array<{
    id: string
    legalName: string
    tradeName: string | null
    tradeLicenceNumber: string | null
    licenceExpiryDate: Date | null
    businessActivity: string | null
    estCardNumber: string | null
    vatTrn: string | null
    corporateTaxRegNumber: string | null
    companyEmail: string | null
    companyMobile: string | null
    registeredAddress: string | null
    status: string
  }>
  authorizedCompanyIds: string[]
}

export async function getAuthenticatedPortalUser(): Promise<AuthenticatedPortalContext> {
  const session = await verifyPortalSession()

  if (!session || !session.portalUser || !session.portalUser.client) {
    redirect('/portal/login')
  }

  const { portalUser } = session
  const { client } = portalUser
  const companies = client.companies || []
  const authorizedCompanyIds = companies.map((c) => c.id)

  return {
    portalUser: {
      id: portalUser.id,
      clientId: portalUser.clientId,
      email: portalUser.email,
      fullName: portalUser.fullName || client.fullName,
      status: portalUser.status,
      lastLogin: portalUser.lastLogin,
    },
    client: {
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      mobileNumber: client.mobileNumber,
      whatsappNumber: client.whatsappNumber,
      nationality: client.nationality,
      clientType: client.clientType,
      address: client.address,
      passportNumber: client.passportNumber,
      passportExpiryDate: client.passportExpiryDate,
      emiratesIdNumber: client.emiratesIdNumber,
      eidExpiryDate: client.eidExpiryDate,
      visaNumber: client.visaNumber,
      visaExpiryDate: client.visaExpiryDate,
      healthInsNumber: client.healthInsNumber,
      healthInsExpiryDate: client.healthInsExpiryDate,
    },
    companies: companies.map((c) => ({
      id: c.id,
      legalName: c.legalName,
      tradeName: c.tradeName,
      tradeLicenceNumber: c.tradeLicenceNumber,
      licenceExpiryDate: c.licenceExpiryDate,
      businessActivity: c.businessActivity,
      estCardNumber: c.estCardNumber,
      vatTrn: c.vatTrn,
      corporateTaxRegNumber: c.corporateTaxRegNumber,
      companyEmail: c.companyEmail,
      companyMobile: c.companyMobile,
      registeredAddress: c.registeredAddress,
      status: c.status,
    })),
    authorizedCompanyIds,
  }
}

export function assertClientAccess(resourceClientId: string | null | undefined, authorizedClientId: string) {
  if (!resourceClientId || resourceClientId !== authorizedClientId) {
    throw new Error('Unauthorized: You do not have permission to access this resource.')
  }
}

export function assertCompanyAccess(resourceCompanyId: string | null | undefined, authorizedCompanyIds: string[]) {
  if (!resourceCompanyId || !authorizedCompanyIds.includes(resourceCompanyId)) {
    throw new Error('Unauthorized: You do not have permission to access this company profile.')
  }
}
