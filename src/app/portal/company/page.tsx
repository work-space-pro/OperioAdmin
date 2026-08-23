import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import prisma from '@/lib/db'
import PortalCompanyView from './PortalCompanyView'

export const dynamic = 'force-dynamic'

export default async function PortalCompanyPage() {
  const { client, authorizedCompanyIds } = await getAuthenticatedPortalUser()

  const companiesWithDetails = await prisma.company.findMany({
    where: {
      id: { in: authorizedCompanyIds },
    },
    include: {
      personnel: true,
      employees: {
        include: {
          documents: true,
        },
      },
      vehicles: true,
      drivers: true,
      bankAccounts: true,
      services: true,
      documents: true,
      vatFilings: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const serializedCompanies = companiesWithDetails.map((c) => ({
    id: c.id,
    legalName: c.legalName,
    tradeName: c.tradeName,
    companyType: c.companyType,
    legalForm: c.legalForm,
    zoneType: c.zoneType,
    freeZoneName: c.freeZoneName,
    registeredEmirate: c.registeredEmirate,
    tradeLicenceNumber: c.tradeLicenceNumber,
    businessActivity: c.businessActivity,
    licenceIssueDate: c.licenceIssueDate ? c.licenceIssueDate.toISOString() : null,
    licenceExpiryDate: c.licenceExpiryDate ? c.licenceExpiryDate.toISOString() : null,
    estCardNumber: c.estCardNumber,
    estCardIssueDate: c.estCardIssueDate ? c.estCardIssueDate.toISOString() : null,
    estCardExpiryDate: c.estCardExpiryDate ? c.estCardExpiryDate.toISOString() : null,
    vatTrn: c.vatTrn,
    vatRegistrationDate: c.vatRegistrationDate ? c.vatRegistrationDate.toISOString() : null,
    corporateTaxRegNumber: c.corporateTaxRegNumber,
    corporateTaxRegDate: c.corporateTaxRegDate ? c.corporateTaxRegDate.toISOString() : null,
    companyEmail: c.companyEmail,
    companyMobile: c.companyMobile,
    registeredAddress: c.registeredAddress,
    financialYearStart: c.financialYearStart ? c.financialYearStart.toISOString() : null,
    financialYearEnd: c.financialYearEnd ? c.financialYearEnd.toISOString() : null,
    status: c.status,
    notes: c.notes,
    personnel: c.personnel.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      designation: p.designation,
      ownershipPercentage: p.ownershipPercentage,
      nationality: p.nationality,
      mobile: p.mobile,
      email: p.email,
      passportNumber: p.passportNumber,
      passportExpiryDate: p.passportExpiryDate ? p.passportExpiryDate.toISOString() : null,
      emiratesIdNumber: p.emiratesIdNumber,
      emiratesIdExpiryDate: p.emiratesIdExpiryDate ? p.emiratesIdExpiryDate.toISOString() : null,
      isOwner: p.isOwner,
      isSignatory: p.isSignatory,
      signatureCardNumber: p.signatureCardNumber,
      signatureCardStatus: p.signatureCardStatus,
      signatureCardExpiryDate: p.signatureCardExpiryDate ? p.signatureCardExpiryDate.toISOString() : null,
      notes: p.notes,
    })),
    employees: c.employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      designation: e.designation,
      nationality: e.nationality,
      dateOfBirth: e.dateOfBirth ? e.dateOfBirth.toISOString() : null,
      gender: e.gender,
      mobile: e.mobile,
      email: e.email,
      passportNumber: e.passportNumber,
      passportIssueDate: e.passportIssueDate ? e.passportIssueDate.toISOString() : null,
      passportExpiry: e.passportExpiry ? e.passportExpiry.toISOString() : null,
      visaNumber: e.visaNumber,
      visaIssueDate: e.visaIssueDate ? e.visaIssueDate.toISOString() : null,
      visaExpiryDate: e.visaExpiryDate ? e.visaExpiryDate.toISOString() : null,
      visaType: e.visaType,
      uidNumber: e.uidNumber,
      eVisaIssueDate: e.eVisaIssueDate ? e.eVisaIssueDate.toISOString() : null,
      eVisaExpiryDate: e.eVisaExpiryDate ? e.eVisaExpiryDate.toISOString() : null,
      emiratesId: e.emiratesId,
      eidExpiryDate: e.eidExpiryDate ? e.eidExpiryDate.toISOString() : null,
      healthInsNumber: e.healthInsNumber,
      healthInsExpiry: e.healthInsExpiry ? e.healthInsExpiry.toISOString() : null,
      iloeNumber: e.iloeNumber,
      iloeExpiry: e.iloeExpiry ? e.iloeExpiry.toISOString() : null,
      basicSalary: e.basicSalary,
      allowances: e.allowances,
      currency: e.currency,
      status: e.status,
      notes: e.notes,
      documentsCount: e.documents.length,
    })),
    vehicles: c.vehicles.map((v) => ({
      id: v.id,
      regNo: v.regNo,
      tcNo: v.tcNo,
      policyNo: v.policyNo,
      regDate: v.regDate ? v.regDate.toISOString() : null,
      expDate: v.expDate ? v.expDate.toISOString() : null,
      insuranceIssueDate: v.insuranceIssueDate ? v.insuranceIssueDate.toISOString() : null,
      insuranceExpDate: v.insuranceExpDate ? v.insuranceExpDate.toISOString() : null,
    })),
    bankAccounts: c.bankAccounts.map((b) => ({
      id: b.id,
      bankName: b.bankName,
      accountName: b.accountName,
      accountNumber: b.accountNumber,
      iban: b.iban,
      swiftCode: b.swiftCode,
      branch: b.branch,
      currency: b.currency,
      accountStatus: b.accountStatus,
      isPrimary: b.isPrimary,
      openingDate: b.openingDate ? b.openingDate.toISOString() : null,
      assistanceStatus: b.assistanceStatus,
      notes: b.notes,
    })),
  }))

  return (
    <PortalCompanyView
      companiesData={serializedCompanies}
      client={client}
    />
  )
}
