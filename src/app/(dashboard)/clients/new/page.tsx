'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComprehensive } from '../actions'
import { formatEmiratesId, formatPassportNumber, isValidEmiratesId, isValidPassport } from '@/lib/formatters'
import './wizard.css'
import { Loader2, User, Briefcase, FileText, Settings, Bell, Layers } from 'lucide-react'
import { SERVICE_CATEGORIES, SERVICE_PACKAGES_BY_CATEGORY, ServiceCategoryType } from '@/lib/servicePackages'

const WIZARD_STEPS = [
  ["Client details", "Identity & contact"],
  ["Company", "Business information"],
  ["Personnel", "Members & employees"],
  ["Vehicles", "Fleet registration"],
  ["Drivers", "Driver details"],
  ["Services", "Work requirements"],
  ["Documents", "Supporting files"],
  ["Payment", "Fees & collection"],
  ["Reminder", "Dates & follow-up"],
  ["Review", "Confirm & complete"]
]

export const SERVICE_DEFINITIONS: Record<string, {
  category: string
  fields: Array<{ label: string; key: string; type: 'text' | 'number' | 'date' | 'select'; options?: string[] }>
}> = {
  "Trade Licence (New / Renewal / Amendment)": {
    category: "Company Setup",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Licence Type", key: "licenceType", type: "select", options: ["Commercial", "Professional", "Industrial", "E-commerce", "Other"] },
      { label: "Licence Number", key: "licenceNumber", type: "text" },
      { label: "Licence Issue Date", key: "licenceIssueDate", type: "date" },
      { label: "Licence Expiry Date", key: "licenceExpiryDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" },
      { label: "Authority / Department", key: "authority", type: "text" }
    ]
  },
  "VAT Registration": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Trade Licence Number", key: "tradeLicenceNumber", type: "text" },
      { label: "VAT TRN (After Approval)", key: "vatTrn", type: "text" },
      { label: "Registration Type", key: "registrationType", type: "select", options: ["Mandatory", "Voluntary", "Tax Group"] },
      { label: "Effective Registration Date", key: "effectiveDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" }
    ]
  },
  "VAT Deregistration": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "VAT TRN", key: "vatTrn", type: "text" },
      { label: "Deregistration Reason", key: "reason", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "Effective Deregistration Date", key: "effectiveDate", type: "date" }
    ]
  },
  "Corporate Tax Registration": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "CT Registration Number", key: "ctNumber", type: "text" },
      { label: "Financial Year Start Date", key: "financialYearStart", type: "date" },
      { label: "Financial Year End Date", key: "financialYearEnd", type: "date" },
      { label: "Registration Date", key: "registrationDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" }
    ]
  },
  "Establishment Card (New / Renewal)": {
    category: "Immigration & Labour",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Establishment Card Number", key: "estCardNumber", type: "text" },
      { label: "Issue Date", key: "issueDate", type: "date" },
      { label: "Expiry Date", key: "expiryDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" }
    ]
  },
  "Signature Card (New / Renewal)": {
    category: "Immigration & Labour",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Signatory Name", key: "signatoryName", type: "text" },
      { label: "Signature Card Number", key: "cardNo", type: "text" },
      { label: "Issue Date", key: "issueDate", type: "date" },
      { label: "Expiry Date", key: "expiryDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" }
    ]
  },
  "Signature Card Activation": {
    category: "Immigration & Labour",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Signatory Name", key: "signatoryName", type: "text" },
      { label: "Signature Card Number", key: "cardNo", type: "text" },
      { label: "Activation Date", key: "activationDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" }
    ]
  },
  "Bank Account Assistance": {
    category: "Banking",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "Bank Name", key: "bankName", type: "text" },
      { label: "Account Type", key: "accountType", type: "select", options: ["Business Current", "Business Savings", "Personal Current", "Other"] },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "Account Number / IBAN", key: "iban", type: "text" }
    ]
  },
  "VAT Filing (Quarterly / Monthly)": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "VAT TRN", key: "vatTrn", type: "text" },
      { label: "Tax Period Start Date", key: "periodStart", type: "date" },
      { label: "Tax Period End Date", key: "periodEnd", type: "date" },
      { label: "Filing Due Date", key: "dueDate", type: "date" },
      { label: "Output VAT Amount", key: "outputVat", type: "number" },
      { label: "Input VAT Amount", key: "inputVat", type: "number" },
      { label: "VAT Payable / Refundable", key: "vatPayable", type: "number" }
    ]
  },
  "VAT Payment Tracking": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "VAT TRN", key: "vatTrn", type: "text" },
      { label: "Tax Period", key: "taxPeriod", type: "text" },
      { label: "VAT Amount", key: "vatAmount", type: "number" },
      { label: "Payment Due Date", key: "dueDate", type: "date" },
      { label: "Amount Paid", key: "amountPaid", type: "number" },
      { label: "Payment Date", key: "paymentDate", type: "date" }
    ]
  },
  "Corporate Tax Filing (Annual)": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "CT Registration Number", key: "ctNumber", type: "text" },
      { label: "Financial Year", key: "financialYear", type: "text" },
      { label: "Filing Due Date", key: "dueDate", type: "date" },
      { label: "Taxable Income", key: "taxableIncome", type: "number" },
      { label: "Tax Payable", key: "taxPayable", type: "number" },
      { label: "Filing Date", key: "filingDate", type: "date" }
    ]
  },
  "Corporate Tax Payment Tracking": {
    category: "Tax & VAT",
    fields: [
      { label: "Company", key: "company", type: "text" },
      { label: "CT Registration Number", key: "ctNumber", type: "text" },
      { label: "Tax Period / Financial Year", key: "taxPeriod", type: "text" },
      { label: "Tax Amount", key: "taxAmount", type: "number" },
      { label: "Payment Due Date", key: "dueDate", type: "date" },
      { label: "Payment Date", key: "paymentDate", type: "date" }
    ]
  },
  "Investor / Partner / Employee Visa (New)": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company / Sponsor", key: "sponsor", type: "text" },
      { label: "Visa Type", key: "visaType", type: "select", options: ["Investor", "Partner", "Employment", "Family", "Domestic Worker"] },
      { label: "Passport Number", key: "passportNumber", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "Visa Expiry Date", key: "visaExpiryDate", type: "date" }
    ]
  },
  "Visa Renewal": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company / Sponsor", key: "sponsor", type: "text" },
      { label: "Visa Type", key: "visaType", type: "select", options: ["Investor", "Partner", "Employment", "Family", "Domestic Worker"] },
      { label: "Current Visa Number", key: "currentVisaNumber", type: "text" },
      { label: "Current Expiry Date", key: "currentExpiryDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "New Visa Expiry Date", key: "newVisaExpiryDate", type: "date" }
    ]
  },
  "Visa Cancellation": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company / Sponsor", key: "sponsor", type: "text" },
      { label: "Visa Number", key: "visaNumber", type: "text" },
      { label: "Cancellation Reason", key: "reason", type: "text" },
      { label: "Cancellation Date", key: "cancellationDate", type: "date" },
      { label: "Application Number", key: "applicationNumber", type: "text" }
    ]
  },
  "Status Change": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company / Sponsor", key: "sponsor", type: "text" },
      { label: "Current Visa / Entry Permit", key: "currentEntryPermit", type: "text" },
      { label: "New Visa Type", key: "newVisaType", type: "select", options: ["Investor", "Partner", "Employment", "Family", "Other"] },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "Status Change Date", key: "statusChangeDate", type: "date" }
    ]
  },
  "Medical Test": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company", key: "company", type: "text" },
      { label: "Medical Type", key: "medicalType", type: "select", options: ["Normal", "Express", "VIP"] },
      { label: "Test Date", key: "testDate", type: "date" },
      { label: "Result Date", key: "resultDate", type: "date" },
      { label: "Medical Result", key: "medicalResult", type: "select", options: ["Pending", "Fit", "Unfit"] }
    ]
  },
  "Emirates ID": {
    category: "Visa & PRO",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company", key: "company", type: "text" },
      { label: "EID Number (After Issued)", key: "eidNumber", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" },
      { label: "EID Expiry Date", key: "eidExpiryDate", type: "date" }
    ]
  },
  "Health Insurance": {
    category: "Insurance",
    fields: [
      { label: "Insured Person", key: "insuredPerson", type: "text" },
      { label: "Company", key: "company", type: "text" },
      { label: "Insurance Provider", key: "provider", type: "text" },
      { label: "Policy Number", key: "policyNumber", type: "text" },
      { label: "Policy Start Date", key: "startDate", type: "date" },
      { label: "Policy Expiry Date", key: "expiryDate", type: "date" }
    ]
  },
  "ILOE Insurance": {
    category: "Insurance",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company", key: "company", type: "text" },
      { label: "ILOE Policy Number", key: "iloePolicyNumber", type: "text" },
      { label: "Policy Start Date", key: "startDate", type: "date" },
      { label: "Policy Expiry Date", key: "expiryDate", type: "date" }
    ]
  },
  "Beneficiary Update": {
    category: "PRO Services",
    fields: [
      { label: "Employee / Person", key: "personName", type: "text" },
      { label: "Company", key: "company", type: "text" },
      { label: "Beneficiary Name", key: "beneficiaryName", type: "text" },
      { label: "Relationship", key: "relationship", type: "text" },
      { label: "Application Date", key: "applicationDate", type: "date" }
    ]
  },
  "Typing Services": {
    category: "Typing & Document Clearing",
    fields: [
      { label: "Company / Person", key: "companyPerson", type: "text" },
      { label: "Service Type", key: "serviceType", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" },
      { label: "Authority", key: "authority", type: "text" }
    ]
  },
  "Immigration / Labour Services": {
    category: "Immigration & Labour",
    fields: [
      { label: "Company / Person", key: "companyPerson", type: "text" },
      { label: "Service Type", key: "serviceType", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Submission Date", key: "submissionDate", type: "date" },
      { label: "Authority", key: "authority", type: "text" }
    ]
  },
  "Other / Custom Service": {
    category: "Other",
    fields: [
      { label: "Company / Person", key: "companyPerson", type: "text" },
      { label: "Service Type", key: "serviceType", type: "text" },
      { label: "Application Number", key: "applicationNumber", type: "text" },
      { label: "Start Date", key: "startDate", type: "date" },
      { label: "Due Date", key: "dueDate", type: "date" }
    ]
  }
}

export default function WizardAddClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [clientData, setClientData] = useState<any>({ clientType: 'Company Representative' })
  const [companyData, setCompanyData] = useState<any>({})
  const [members, setMembers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedWizardCategory, setSelectedWizardCategory] = useState<ServiceCategoryType>('Business Setup')
  const [selectedWizardPackage, setSelectedWizardPackage] = useState<string>(SERVICE_PACKAGES_BY_CATEGORY['Business Setup'][0])
  const [isWizardCustomPackage, setIsWizardCustomPackage] = useState(false)
  const [wizardCustomPackageName, setWizardCustomPackageName] = useState('')
  const [documents, setDocuments] = useState<any[]>([])
  const [payment, setPayment] = useState<any>({ status: 'Unpaid' })
  const [reminder, setReminder] = useState<any>({ priority: 'Normal', before: '7' })

  const updateClient = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'emiratesIdNumber') {
      setClientData({ ...clientData, [name]: formatEmiratesId(value) })
    } else if (name === 'passportNumber') {
      setClientData({ ...clientData, [name]: formatPassportNumber(value) })
    } else {
      setClientData({ ...clientData, [name]: value })
    }
  }
  const updateCompany = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value })
  }
  const updatePayment = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPayment({ ...payment, [e.target.name]: e.target.value })
  }
  const updateReminder = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setReminder({ ...reminder, [e.target.name]: e.target.value })
  }
  const handleAddPackageToWizard = () => {
    const pkgName = isWizardCustomPackage ? wizardCustomPackageName : selectedWizardPackage
    if (!pkgName || !pkgName.trim()) return

    const newService = {
      id: `srv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: pkgName.trim(),
      category: selectedWizardCategory,
      status: 'In progress',
      paymentStatus: 'Unpaid',
      price: '',
      targetCompletion: '',
      notes: ''
    }

    setServices([...services, newService])
    if (isWizardCustomPackage) {
      setIsWizardCustomPackage(false)
      setWizardCustomPackageName('')
    }
  }

  const updateServiceValue = (serviceIdx: number, fieldKey: string, val: string) => {
    const updated = [...services]
    if (!updated[serviceIdx].values) updated[serviceIdx].values = {}
    updated[serviceIdx].values[fieldKey] = val
    setServices(updated)
  }

  const nextStep = () => {
    if (currentStep === 0) {
      if (!clientData.fullName) return setError('Client Full Legal Name is required.')
      if (clientData.emiratesIdNumber && !isValidEmiratesId(clientData.emiratesIdNumber)) {
        return setError('Emirates ID must be 15 digits starting with 784 in format: 784-YYYY-XXXXXXX-X')
      }
      if (clientData.passportNumber && !isValidPassport(clientData.passportNumber)) {
        return setError('Passport Number must start with 1 letter followed by digits (e.g. A1234567).')
      }
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1))
  }
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const handleSave = async () => {
    setIsSubmitting(true)
    setError('')
    
    const payload = {
      client: clientData,
      company: clientData.clientType === 'Company Representative' ? companyData : {},
      members,
      vehicles,
      drivers,
      services,
      documents,
      payment,
      reminder
    }

    const res = await createClientComprehensive(payload)
    
    if (res.success) {
      router.push(`/clients/${res.clientId}`)
    } else {
      setError(res.error)
      setIsSubmitting(false)
    }
  }

  const progressPercent = Math.round((currentStep / (WIZARD_STEPS.length - 1)) * 100)

  return (
    <div className="wizard-page">
      <div className="wizard-topline">
        <div className="wizard-header">
          <p className="eyebrow">New client setup</p>
          <h1>Add a new client</h1>
          <p>Complete the guided setup to create a detailed client record.</p>
        </div>
        <div className="header-actions">
          <button className="wizard-btn wizard-btn-secondary" onClick={() => router.push('/clients')}>Close</button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-xl border border-red-100 flex items-center">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      <div className="wizard-shell">
        <aside className="wizard-rail">
          <div className="wizard-progress-copy">
            <span>Setup progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="wizard-steps">
            {WIZARD_STEPS.map(([name, desc], index) => {
              const isActive = index === currentStep
              const isDone = index < currentStep
              
              let className = "wizard-step"
              if (isActive) className += " active"
              if (isDone) className += " done"
              
              return (
                <button key={index} type="button" className={className} onClick={() => index <= currentStep && setCurrentStep(index)}>
                  <span className="wizard-step-number">{isDone ? '✓' : index + 1}</span>
                  <div>
                    <strong>{name}</strong>
                    <span>{desc}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="wizard-content">
          {/* STEP 0: CLIENT DETAILS */}
          {currentStep === 0 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Client details</h2>
                    <p>Start with the client's identity and preferred contact information.</p>
                  </div>
                  <span className="required-note"><strong>*</strong> Required fields</span>
                </div>
              </div>
              <div className="form-grid three">
                <div className="field span-2">
                  <label>Full name <span className="required">*</span></label>
                  <input required name="fullName" value={clientData.fullName || ''} onChange={updateClient} placeholder="e.g. Mohammed Ali" />
                </div>
                <div className="field">
                  <label>Nationality</label>
                  <select name="nationality" value={clientData.nationality || ''} onChange={updateClient}>
                    <option value="">Select Nationality</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Egypt">Egypt</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Mobile number</label>
                  <input type="tel" name="mobileNumber" value={clientData.mobileNumber || ''} onChange={updateClient} placeholder="+971 50 000 0000" />
                </div>
                <div className="field">
                  <label>WhatsApp number</label>
                  <input type="tel" name="whatsappNumber" value={clientData.whatsappNumber || ''} onChange={updateClient} placeholder="+971 50 000 0000" />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input type="email" name="email" value={clientData.email || ''} onChange={updateClient} placeholder="client@example.com" />
                </div>
                <div className="field">
                  <label>Passport number</label>
                  <input 
                    name="passportNumber" 
                    value={clientData.passportNumber || ''} 
                    onChange={updateClient} 
                    placeholder="e.g. A1234567" 
                    maxLength={9}
                  />
                </div>
                <div className="field">
                  <label>Passport issue date</label>
                  <input 
                    type="date" 
                    name="passportIssueDate" 
                    value={clientData.passportIssueDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Passport expiry date</label>
                  <input 
                    type="date" 
                    name="passportExpiryDate" 
                    value={clientData.passportExpiryDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Emirates ID (EID)</label>
                  <input 
                    name="emiratesIdNumber" 
                    value={clientData.emiratesIdNumber || ''} 
                    onChange={updateClient} 
                    placeholder="784-YYYY-XXXXXXX-X" 
                    maxLength={18}
                  />
                </div>
                <div className="field">
                  <label>Emirates ID issue date</label>
                  <input 
                    type="date" 
                    name="eidIssueDate" 
                    value={clientData.eidIssueDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Emirates ID expiry date</label>
                  <input 
                    type="date" 
                    name="eidExpiryDate" 
                    value={clientData.eidExpiryDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Visa / UID number</label>
                  <input 
                    name="visaNumber" 
                    value={clientData.visaNumber || ''} 
                    onChange={updateClient} 
                    placeholder="e.g. 201/2023/1234567" 
                  />
                </div>
                <div className="field">
                  <label>Visa issue date</label>
                  <input 
                    type="date" 
                    name="visaIssueDate" 
                    value={clientData.visaIssueDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Visa expiry date</label>
                  <input 
                    type="date" 
                    name="visaExpiryDate" 
                    value={clientData.visaExpiryDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Health insurance policy no.</label>
                  <input 
                    name="healthInsNumber" 
                    value={clientData.healthInsNumber || ''} 
                    onChange={updateClient} 
                    placeholder="e.g. POL-987654321" 
                  />
                </div>
                <div className="field">
                  <label>Health ins issue date</label>
                  <input 
                    type="date" 
                    name="healthInsIssueDate" 
                    value={clientData.healthInsIssueDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
                <div className="field">
                  <label>Health ins expiry date</label>
                  <input 
                    type="date" 
                    name="healthInsExpiryDate" 
                    value={clientData.healthInsExpiryDate || ''} 
                    onChange={updateClient} 
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 1: COMPANY */}
          {currentStep === 1 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Company information</h2>
                    <p>Connect the client to a registered business, or continue as an individual.</p>
                  </div>
                </div>
              </div>

              <div className="segmented-control" role="group">
                <button 
                  className={`segment ${clientData.clientType === 'Individual' ? 'active' : ''}`} 
                  onClick={() => setClientData({...clientData, clientType: 'Individual'})}
                >Individual</button>
                <button 
                  className={`segment ${clientData.clientType === 'Company Representative' ? 'active' : ''}`} 
                  onClick={() => setClientData({...clientData, clientType: 'Company Representative'})}
                >Company</button>
              </div>

              {clientData.clientType === 'Company Representative' ? (
                <div className="form-grid three">
                  <div className="field span-2">
                    <label>Company legal name</label>
                    <input name="legalName" value={companyData.legalName || ''} onChange={updateCompany} placeholder="Registered business name" />
                  </div>
                  <div className="field">
                    <label>Trade licence number</label>
                    <input name="tradeLicenceNumber" value={companyData.tradeLicenceNumber || ''} onChange={updateCompany} placeholder="Licence number" />
                  </div>
                  <div className="field">
                    <label>Licence expiry date</label>
                    <input type="date" name="licenceExpiryDate" value={companyData.licenceExpiryDate || ''} onChange={updateCompany} />
                  </div>
                  <div className="field">
                    <label>VAT TRN</label>
                    <input name="vatTrn" value={companyData.vatTrn || ''} onChange={updateCompany} placeholder="Tax registration number" />
                  </div>
                  <div className="field">
                    <label>Corporate tax number</label>
                    <input name="corporateTaxRegNumber" value={companyData.corporateTaxRegNumber || ''} onChange={updateCompany} placeholder="CT registration" />
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><User /></div>
                    <h3>Individual client</h3>
                    <p>This record will be saved without a connected business profile.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: PERSONNEL */}
          {currentStep === 2 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Personnel & Members</h2>
                    <p>Add employees, partners or members for this client/company.</p>
                  </div>
                  <button onClick={() => setMembers([...members, { memberType: 'Partner' }])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add member</button>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><User /></div>
                    <h3>No members added</h3>
                    <p>Add employees or partners for this client.</p>
                    <button onClick={() => setMembers([...members, { memberType: 'Partner' }])} className="wizard-btn wizard-btn-secondary">Click here to add one</button>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {members.map((m, idx) => (
                    <div key={idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>Member Details {m.memberType ? `(${m.memberType})` : ''}</strong>
                        </div>
                        <button onClick={() => setMembers(members.filter((_, i) => i !== idx))} className="remove-service">Remove</button>
                      </div>
                      <div className="service-fields form-grid three">
                        <div className="field">
                          <label>Member Type / Role</label>
                          <select 
                            value={m.memberType || 'Partner'} 
                            onChange={e => { 
                              const nm = [...members]; 
                              nm[idx].memberType = e.target.value; 
                              nm[idx].visaType = e.target.value;
                              setMembers(nm); 
                            }}
                          >
                            <option value="Partner">Partner</option>
                            <option value="Employee/Staff">Employee/Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Director">Director</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="field two-thirds">
                          <label>Full Legal Name</label>
                          <input 
                            value={m.fullName || ''} 
                            placeholder="Enter full name"
                            onChange={e => { const nm = [...members]; nm[idx].fullName = e.target.value; setMembers(nm); }} 
                          />
                        </div>
                        <div className="field">
                          <label>Passport Number</label>
                          <input 
                            value={m.passportNumber || ''} 
                            onChange={e => { 
                              const nm = [...members]; 
                              nm[idx].passportNumber = formatPassportNumber(e.target.value); 
                              setMembers(nm); 
                            }} 
                            placeholder="e.g. A1234567" 
                            maxLength={9}
                          />
                        </div>
                        <div className="field">
                          <label>Passport Issue Date</label>
                          <input 
                            type="date" 
                            value={m.passportIssueDate || ''} 
                            onChange={e => { const nm = [...members]; nm[idx].passportIssueDate = e.target.value; setMembers(nm); }} 
                          />
                        </div>
                        <div className="field">
                          <label>Passport Expiry Date</label>
                          <input 
                            type="date" 
                            value={m.passportExpiry || m.passportExpiryDate || ''} 
                            onChange={e => { 
                              const nm = [...members]; 
                              nm[idx].passportExpiry = e.target.value; 
                              nm[idx].passportExpiryDate = e.target.value; 
                              setMembers(nm); 
                            }} 
                          />
                        </div>
                        <div className="field">
                          <label>Emirates ID</label>
                          <input 
                            value={m.emiratesId || ''} 
                            onChange={e => { 
                              const nm = [...members]; 
                              nm[idx].emiratesId = formatEmiratesId(e.target.value); 
                              setMembers(nm); 
                            }} 
                            placeholder="784-YYYY-XXXXXXX-X" 
                            maxLength={18}
                          />
                        </div>
                        <div className="field">
                          <label>EID Expiry</label>
                          <input type="date" value={m.eidExpiryDate || ''} onChange={e => { const nm = [...members]; nm[idx].eidExpiryDate = e.target.value; setMembers(nm); }} />
                        </div>
                        <div className="field">
                          <label>E-Visa Expiry</label>
                          <input type="date" value={m.eVisaExpiryDate || ''} onChange={e => { const nm = [...members]; nm[idx].eVisaExpiryDate = e.target.value; setMembers(nm); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 3: VEHICLES */}
          {currentStep === 3 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Vehicles</h2>
                    <p>Track company vehicles or fleet registration.</p>
                  </div>
                  <button onClick={() => setVehicles([...vehicles, {}])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add vehicle</button>
                </div>
              </div>

              {vehicles.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><Briefcase /></div>
                    <h3>No vehicles added</h3>
                    <p>Track company vehicles or fleet registration.</p>
                    <button onClick={() => setVehicles([...vehicles, {}])} className="wizard-btn wizard-btn-secondary">Click here to add one</button>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {vehicles.map((v, idx) => (
                    <div key={idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>Vehicle Details</strong>
                        </div>
                        <button onClick={() => setVehicles(vehicles.filter((_, i) => i !== idx))} className="remove-service">Remove</button>
                      </div>
                      <div className="service-fields form-grid three">
                        <div className="field">
                          <label>Reg No</label>
                          <input value={v.regNo || ''} onChange={e => { const nv = [...vehicles]; nv[idx].regNo = e.target.value; setVehicles(nv); }} />
                        </div>
                        <div className="field">
                          <label>T.C. No</label>
                          <input value={v.tcNo || ''} onChange={e => { const nv = [...vehicles]; nv[idx].tcNo = e.target.value; setVehicles(nv); }} />
                        </div>
                        <div className="field">
                          <label>Policy No</label>
                          <input value={v.policyNo || ''} onChange={e => { const nv = [...vehicles]; nv[idx].policyNo = e.target.value; setVehicles(nv); }} />
                        </div>
                        <div className="field">
                          <label>Reg Expiry</label>
                          <input type="date" value={v.expDate || ''} onChange={e => { const nv = [...vehicles]; nv[idx].expDate = e.target.value; setVehicles(nv); }} />
                        </div>
                        <div className="field">
                          <label>Ins Expiry</label>
                          <input type="date" value={v.insuranceExpDate || ''} onChange={e => { const nv = [...vehicles]; nv[idx].insuranceExpDate = e.target.value; setVehicles(nv); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 4: DRIVERS */}
          {currentStep === 4 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Drivers</h2>
                    <p>Track driver licences and details.</p>
                  </div>
                  <button onClick={() => setDrivers([...drivers, {}])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add driver</button>
                </div>
              </div>

              {drivers.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><User /></div>
                    <h3>No drivers added</h3>
                    <p>Track driver licences and details.</p>
                    <button onClick={() => setDrivers([...drivers, {}])} className="wizard-btn wizard-btn-secondary">Click here to add one</button>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {drivers.map((d, idx) => (
                    <div key={idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>Driver Details</strong>
                        </div>
                        <button onClick={() => setDrivers(drivers.filter((_, i) => i !== idx))} className="remove-service">Remove</button>
                      </div>
                      <div className="service-fields form-grid">
                        <div className="field full">
                          <label>Driver Full Name</label>
                          <input value={d.fullName || ''} onChange={e => { const nd = [...drivers]; nd[idx].fullName = e.target.value; setDrivers(nd); }} />
                        </div>
                        <div className="field">
                          <label>Licence Issue Date</label>
                          <input type="date" value={d.licenseIssueDate || ''} onChange={e => { const nd = [...drivers]; nd[idx].licenseIssueDate = e.target.value; setDrivers(nd); }} />
                        </div>
                        <div className="field">
                          <label>Licence Expiry Date</label>
                          <input type="date" value={d.licenseExpDate || ''} onChange={e => { const nd = [...drivers]; nd[idx].licenseExpDate = e.target.value; setDrivers(nd); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 5: SERVICES & PACKAGES */}
          {currentStep === 5 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Add services &amp; packages</h2>
                    <p>Assign business setup, visa, accounting, PRO, or legal packages with manual price agreement.</p>
                  </div>
                  <span className="required-note">Operational packages</span>
                </div>
              </div>

              {/* PACKAGE SELECTION BAR */}
              <div className="service-adder bg-purple-50/40 p-4 rounded-xl border border-purple-100 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  <div className="field">
                    <label>Category</label>
                    <select 
                      value={selectedWizardCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ServiceCategoryType
                        setSelectedWizardCategory(cat)
                        setSelectedWizardPackage(SERVICE_PACKAGES_BY_CATEGORY[cat][0])
                        setIsWizardCustomPackage(false)
                      }}
                      className="cursor-pointer"
                    >
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Package / Service Template</label>
                    <select 
                      value={isWizardCustomPackage ? '__CUSTOM__' : selectedWizardPackage}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsWizardCustomPackage(true)
                        } else {
                          setIsWizardCustomPackage(false)
                          setSelectedWizardPackage(e.target.value)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {SERVICE_PACKAGES_BY_CATEGORY[selectedWizardCategory]?.map(pkg => (
                        <option key={pkg} value={pkg}>{pkg}</option>
                      ))}
                      <option value="__CUSTOM__">✍️ Custom Package Name...</option>
                    </select>
                  </div>

                  {isWizardCustomPackage && (
                    <div className="field">
                      <label>Custom Package Name</label>
                      <input 
                        type="text" 
                        value={wizardCustomPackageName}
                        onChange={(e) => setWizardCustomPackageName(e.target.value)}
                        placeholder="Enter package name..." 
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={handleAddPackageToWizard}
                  className="wizard-btn wizard-btn-primary mt-3"
                  style={{ minHeight: '42px', fontSize: '13px' }}
                >
                  ＋ Add Package
                </button>
              </div>

              {services.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><Settings /></div>
                    <h3>No packages added yet</h3>
                    <p>Select a category and package from above, then enter the agreed price.</p>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {services.map((s, idx) => (
                    <div key={s.id || idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>{s.name}</strong>
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 ml-2">
                            {s.category}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setServices(services.filter((_, i) => i !== idx))} 
                          className="remove-service"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="service-fields">
                        <div className="form-grid">
                          <div className="field">
                            <label>Service status</label>
                            <select 
                              value={s.status || 'In progress'} 
                              onChange={e => {
                                const ns = [...services]
                                ns[idx].status = e.target.value
                                setServices(ns)
                              }}
                            >
                              <option value="Not started">Not started</option>
                              <option value="In progress">In progress</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          <div className="field">
                            <label>Agreed Price / Fee (AED)</label>
                            <input 
                              type="number" 
                              value={s.price || ''} 
                              onChange={e => {
                                const ns = [...services]
                                ns[idx].price = e.target.value
                                setServices(ns)
                              }} 
                              placeholder="0.00 (Enter price)" 
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="field">
                            <label>Target Completion Date</label>
                            <input 
                              type="date" 
                              value={s.targetCompletion || ''} 
                              onChange={e => {
                                const ns = [...services]
                                ns[idx].targetCompletion = e.target.value
                                setServices(ns)
                              }} 
                            />
                          </div>

                          <div className="field full">
                            <label>Scope / Notes</label>
                            <input 
                              type="text" 
                              value={s.notes || ''} 
                              onChange={e => {
                                const ns = [...services]
                                ns[idx].notes = e.target.value
                                setServices(ns)
                              }} 
                              placeholder="Optional scope notes or special requirements..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 6: DOCUMENTS */}
          {currentStep === 6 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Supporting documents</h2>
                    <p>Register the files associated with this client.</p>
                  </div>
                  <button onClick={() => setDocuments([...documents, {}])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add document</button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><FileText /></div>
                    <h3>No documents</h3>
                    <p>Track passports, IDs, or trade licenses here.</p>
                    <button onClick={() => setDocuments([...documents, {}])} className="wizard-btn wizard-btn-secondary">Add document record</button>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>Document</strong>
                        </div>
                        <button onClick={() => setDocuments(documents.filter((_, i) => i !== idx))} className="remove-service">Remove</button>
                      </div>
                      <div className="service-fields form-grid three">
                        <div className="field full">
                          <label>Document Title</label>
                          <input value={doc.title || ''} onChange={e => { const nd = [...documents]; nd[idx].title = e.target.value; setDocuments(nd); }} placeholder="e.g. Passport Copy" />
                        </div>
                        <div className="field">
                          <label>Document Type</label>
                          <select value={doc.documentType || ''} onChange={e => { const nd = [...documents]; nd[idx].documentType = e.target.value; setDocuments(nd); }}>
                            <option value="">Select Type</option>
                            <option value="Passport">Passport</option>
                            <option value="Emirates ID">Emirates ID</option>
                            <option value="Visa">Visa</option>
                            <option value="Trade License">Trade License</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Issue Date</label>
                          <input type="date" value={doc.issueDate || ''} onChange={e => { const nd = [...documents]; nd[idx].issueDate = e.target.value; setDocuments(nd); }} />
                        </div>
                        <div className="field">
                          <label>Expiry Date</label>
                          <input type="date" value={doc.expiryDate || ''} onChange={e => { const nd = [...documents]; nd[idx].expiryDate = e.target.value; setDocuments(nd); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 7: PAYMENT */}
          {currentStep === 7 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Fees & collection</h2>
                    <p>Record the payment details for this client's setup.</p>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Total Billed (AED)</label>
                  <input type="number" name="totalBilled" value={payment.totalBilled || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Amount Received (AED)</label>
                  <input type="number" name="amountReceived" value={payment.amountReceived || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Payment Status</label>
                  <select name="status" value={payment.status || 'Unpaid'} onChange={updatePayment}>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div className="field">
                  <label>Payment Method</label>
                  <select name="method" value={payment.method || ''} onChange={updatePayment}>
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Payment Reference / Notes</label>
                  <textarea name="reference" value={payment.reference || ''} onChange={updatePayment} placeholder="Transaction ID, Cheque number or notes..."></textarea>
                </div>
              </div>
            </section>
          )}

          {/* STEP 8: REMINDER */}
          {currentStep === 8 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Dates & follow-up</h2>
                    <p>Schedule a follow-up or expiry reminder.</p>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Follow-up Date / Due Date</label>
                  <input type="date" name="dueDate" value={reminder.dueDate || ''} onChange={updateReminder} />
                </div>
                <div className="field">
                  <label>Remind me before</label>
                  <select name="before" value={reminder.before || '7'} onChange={updateReminder}>
                    <option value="1">1 day before</option>
                    <option value="3">3 days before</option>
                    <option value="7">7 days before</option>
                    <option value="14">14 days before</option>
                    <option value="30">30 days before</option>
                  </select>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select name="priority" value={reminder.priority || 'Normal'} onChange={updateReminder}>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Reminder Notes</label>
                  <textarea name="notes" value={reminder.notes || ''} onChange={updateReminder} placeholder="What needs to be done?"></textarea>
                </div>
              </div>
            </section>
          )}

          {/* STEP 9: REVIEW */}
          {currentStep === 9 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Confirm & complete</h2>
                    <p>Review the details below before creating this client record.</p>
                  </div>
                </div>
              </div>
              
              <div className="review-grid">
                <div className="review-card full">
                  <div className="review-card-header">
                    <h3>Client Identity</h3>
                  </div>
                  <div className="review-row">
                    <span>Full name</span>
                    <strong>{clientData.fullName || '—'}</strong>
                  </div>
                  <div className="review-row">
                    <span>Contact</span>
                    <strong>{clientData.mobileNumber || clientData.email || '—'}</strong>
                  </div>
                  <div className="review-row">
                    <span>Client type</span>
                    <strong>{clientData.clientType}</strong>
                  </div>
                </div>

                {clientData.clientType === 'Company Representative' && (
                  <div className="review-card full">
                    <div className="review-card-header">
                      <h3>Company details</h3>
                    </div>
                    <div className="review-row">
                      <span>Legal name</span>
                      <strong>{companyData.legalName || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span>Trade licence</span>
                      <strong>{companyData.tradeLicenceNumber || '—'}</strong>
                    </div>
                  </div>
                )}
                
                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Fleet & Personnel</h3>
                  </div>
                  <div className="review-row">
                    <span>Members</span>
                    <strong>{members.length}</strong>
                  </div>
                  <div className="review-row">
                    <span>Vehicles</span>
                    <strong>{vehicles.length}</strong>
                  </div>
                  <div className="review-row">
                    <span>Drivers</span>
                    <strong>{drivers.length}</strong>
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Operations</h3>
                  </div>
                  <div className="review-row">
                    <span>Services</span>
                    <strong>{services.length}</strong>
                  </div>
                  <div className="review-row">
                    <span>Documents</span>
                    <strong>{documents.length}</strong>
                  </div>
                  <div className="review-row">
                    <span>Payment Status</span>
                    <strong>{payment.status}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          <footer className="wizard-footer">
            <div className="wizard-footer-left">
              <button 
                className="wizard-btn wizard-btn-secondary" 
                onClick={prevStep} 
                disabled={currentStep === 0 || isSubmitting}
              >
                ← Back
              </button>
            </div>
            <div className="wizard-footer-right">
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <button className="wizard-btn wizard-btn-primary" onClick={nextStep}>
                  Save & continue →
                </button>
              ) : (
                <button className="wizard-btn wizard-btn-primary" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Complete setup ✓'}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
