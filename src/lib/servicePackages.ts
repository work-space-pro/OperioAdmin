export interface ServicePackage {
  id: string
  name: string
  category: string
  defaultDescription?: string
}

export const SERVICE_CATEGORIES = [
  'Business Setup',
  'Visa & Immigration',
  'Tax & Accounting',
  'PRO Services',
  'Legal & Advisory'
] as const

export type ServiceCategoryType = typeof SERVICE_CATEGORIES[number]

export const SERVICE_PACKAGES_BY_CATEGORY: Record<ServiceCategoryType, string[]> = {
  'Business Setup': [
    'Mainland LLC Company Formation Package',
    'Freezone Company Formation Package',
    'Offshore Company Setup Package',
    'Trade Licence Renewal Package',
    'Trade Licence Amendment / Partner Change',
    'Instant / Freelance License Setup',
    'Bank Account Opening Assistance Package',
    'Branch Office / Foreign Entity Setup',
    'Custom Business Setup Service'
  ],
  'Visa & Immigration': [
    'Investor / Partner 2-Year Visa Package',
    'Employment Visa (Normal / Skilled) Package',
    'Golden Visa (10-Year Residency) Package',
    'Family / Dependent Visa Package',
    'Domestic Worker / Maid Visa Package',
    'Visa Cancellation / Change of Status Package',
    'Emirates ID & VIP Medical Assistance',
    'Tourist / Visit Visa Extension Package',
    'Custom Visa & Immigration Service'
  ],
  'Tax & Accounting': [
    'Corporate Tax Registration Package',
    'Annual Corporate Tax Return Filing',
    'VAT Registration Package',
    'VAT Deregistration Package',
    'Quarterly VAT Return Filing Package',
    'Monthly Bookkeeping & Accounting Package',
    'Financial Audit & Balance Sheet Assistance',
    'Tax Assessment & Advisory Consultation',
    'Custom Tax & Accounting Service'
  ],
  'PRO Services': [
    'Establishment Card (New / Renewal) Package',
    'MOHRE / Labour File & Quota Processing',
    'Signature Card Issuance & E-Sign Activation',
    'Municipality / Civil Defence / External Approvals',
    'Legal Translation & Notarization Package',
    'Customs Code (New / Renewal) Package',
    'Tenancy Contract / Ejari Registration Assistance',
    'Commercial Vehicle / Fleet Approval Assistance',
    'Custom PRO Service'
  ],
  'Legal & Advisory': [
    'MOA & Shareholder Agreement Drafting / Amendment',
    'Power of Attorney (POA) & Board Resolution',
    'Trademark Registration & Brand Protection',
    'Company Liquidation / Deregistration Package',
    'Commercial Contract Review & Legal Advisory',
    'UBO & ESR (Economic Substance) Compliance Filing',
    'Share Transfer / Capital Increase Agreement',
    'Custom Legal & Advisory Service'
  ]
}
