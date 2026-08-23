'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  User, 
  Phone, 
  FileText, 
  Building2, 
  Landmark, 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Car,
  CreditCard,
  Bell,
  Settings
} from 'lucide-react'
import { updateClientComprehensive } from '../../actions'
import { formatEmiratesId, formatPassportNumber, isValidEmiratesId, isValidPassport } from '@/lib/formatters'
import '../../new/wizard.css'
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

export default function EditClientForm({ client }: { client: any }) {
  const router = useRouter()
  const primaryCompany = client.companies && client.companies.length > 0 ? client.companies[0] : null

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 1. Client State
  const [clientData, setClientData] = useState<any>({
    fullName: client.fullName || '',
    clientType: client.clientType || 'Company Representative',
    nationality: client.nationality || '',
    gender: client.gender || 'Male',
    mobileNumber: client.mobileNumber || '',
    whatsappNumber: client.whatsappNumber || '',
    email: client.email || '',
    emiratesIdNumber: client.emiratesIdNumber ? formatEmiratesId(client.emiratesIdNumber) : '',
    passportNumber: client.passportNumber ? formatPassportNumber(client.passportNumber) : '',
    passportIssueDate: client.passportIssueDate ? new Date(client.passportIssueDate).toISOString().split('T')[0] : '',
    passportExpiryDate: client.passportExpiryDate ? new Date(client.passportExpiryDate).toISOString().split('T')[0] : '',
    address: client.address || '',
    preferredCommunication: client.preferredCommunication || 'WhatsApp',
    notes: client.notes || ''
  })

  // 2. Company State
  const [companyData, setCompanyData] = useState<any>(primaryCompany ? {
    id: primaryCompany.id,
    legalName: primaryCompany.legalName || '',
    tradeName: primaryCompany.tradeName || '',
    tradeLicenceNumber: primaryCompany.tradeLicenceNumber || '',
    licenceIssueDate: primaryCompany.licenceIssueDate ? new Date(primaryCompany.licenceIssueDate).toISOString().split('T')[0] : '',
    licenceExpiryDate: primaryCompany.licenceExpiryDate ? new Date(primaryCompany.licenceExpiryDate).toISOString().split('T')[0] : '',
    estCardNumber: primaryCompany.estCardNumber || '',
    estCardIssueDate: primaryCompany.estCardIssueDate ? new Date(primaryCompany.estCardIssueDate).toISOString().split('T')[0] : '',
    estCardExpiryDate: primaryCompany.estCardExpiryDate ? new Date(primaryCompany.estCardExpiryDate).toISOString().split('T')[0] : '',
    vatTrn: primaryCompany.vatTrn || '',
    corporateTaxRegNumber: primaryCompany.corporateTaxRegNumber || '',
    zoneType: primaryCompany.zoneType || 'Mainland',
    registeredEmirate: primaryCompany.registeredEmirate || 'Abu Dhabi',
    companyEmail: primaryCompany.companyEmail || '',
    companyMobile: primaryCompany.companyMobile || '',
    registeredAddress: primaryCompany.registeredAddress || ''
  } : {})

  // 3. Personnel / Members State
  const [members, setMembers] = useState<any[]>(() => {
    const raw = primaryCompany?.employees || []
    return raw.map((m: any) => ({
      memberType: m.visaType || m.designation || 'Partner',
      fullName: m.fullName || '',
      passportNumber: m.passportNumber ? formatPassportNumber(m.passportNumber) : '',
      passportIssueDate: m.passportIssueDate ? new Date(m.passportIssueDate).toISOString().split('T')[0] : '',
      passportExpiry: m.passportExpiry ? new Date(m.passportExpiry).toISOString().split('T')[0] : '',
      passportExpiryDate: m.passportExpiry ? new Date(m.passportExpiry).toISOString().split('T')[0] : '',
      emiratesId: m.emiratesId ? formatEmiratesId(m.emiratesId) : '',
      eidExpiryDate: m.eidExpiryDate ? new Date(m.eidExpiryDate).toISOString().split('T')[0] : '',
      healthInsExpiry: m.healthInsExpiry ? new Date(m.healthInsExpiry).toISOString().split('T')[0] : '',
      eVisaExpiryDate: m.eVisaExpiryDate ? new Date(m.eVisaExpiryDate).toISOString().split('T')[0] : '',
    }))
  })

  // 4. Vehicles State
  const [vehicles, setVehicles] = useState<any[]>(() => {
    const raw = primaryCompany?.vehicles || []
    return raw.map((v: any) => ({
      regNo: v.regNo || '',
      tcNo: v.tcNo || '',
      policyNo: v.policyNo || '',
      expDate: v.expDate ? new Date(v.expDate).toISOString().split('T')[0] : '',
      insuranceExpDate: v.insuranceExpDate ? new Date(v.insuranceExpDate).toISOString().split('T')[0] : '',
    }))
  })

  // 5. Drivers State
  const [drivers, setDrivers] = useState<any[]>(() => {
    const raw = primaryCompany?.drivers || []
    return raw.map((d: any) => ({
      fullName: d.fullName || '',
      licenseIssueDate: d.licenseIssueDate ? new Date(d.licenseIssueDate).toISOString().split('T')[0] : '',
      licenseExpDate: d.licenseExpDate ? new Date(d.licenseExpDate).toISOString().split('T')[0] : '',
    }))
  })

  // 6. Services State
  const [services, setServices] = useState<any[]>(() => {
    const raw = client.services || []
    return raw.map((s: any) => ({
      id: s.id,
      name: s.name || '',
      category: s.category || 'Business Setup',
      status: s.status || 'In progress',
      paymentStatus: s.paymentStatus || 'Unpaid',
      price: s.price ? String(s.price) : '',
      targetCompletion: s.targetCompletion ? new Date(s.targetCompletion).toISOString().split('T')[0] : '',
      notes: s.notes || ''
    }))
  })
  const [selectedEditCategory, setSelectedEditCategory] = useState<ServiceCategoryType>('Business Setup')
  const [selectedEditPackage, setSelectedEditPackage] = useState<string>(SERVICE_PACKAGES_BY_CATEGORY['Business Setup'][0])
  const [isEditCustomPackage, setIsEditCustomPackage] = useState(false)
  const [editCustomPackageName, setEditCustomPackageName] = useState('')

  // 7. Documents State
  const [documents, setDocuments] = useState<any[]>(() => {
    const raw = client.documents || []
    return raw.map((d: any) => ({
      title: d.title || '',
      documentType: d.documentType || 'Other',
      issueDate: d.issueDate ? new Date(d.issueDate).toISOString().split('T')[0] : '',
      expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().split('T')[0] : '',
      status: d.status || 'Valid'
    }))
  })

  // 8. Payment State
  const [payment, setPayment] = useState<any>({
    government: '',
    service: '',
    other: '',
    received: '',
    method: 'Bank Transfer',
    status: 'Unpaid'
  })

  // 9. Reminder State
  const latestAction = client.actions && client.actions.length > 0 ? client.actions[0] : null
  const [reminder, setReminder] = useState<any>({
    dueDate: latestAction?.dueDate ? new Date(latestAction.dueDate).toISOString().split('T')[0] : '',
    priority: latestAction?.priority || 'Normal',
    before: '7',
    notes: latestAction?.description || ''
  })

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

  const handleAddPackageToEdit = () => {
    const pkgName = isEditCustomPackage ? editCustomPackageName : selectedEditPackage
    if (!pkgName || !pkgName.trim()) return

    const newService = {
      id: `srv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: pkgName.trim(),
      category: selectedEditCategory,
      status: 'In progress',
      paymentStatus: 'Unpaid',
      price: '',
      targetCompletion: '',
      notes: ''
    }

    setServices([...services, newService])
    if (isEditCustomPackage) {
      setIsEditCustomPackage(false)
      setEditCustomPackageName('')
    }
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
      clientData,
      companyData: clientData.clientType === 'Company Representative' ? companyData : {},
      members,
      vehicles,
      drivers,
      services,
      documents,
      payment,
      reminder
    }

    const res = await updateClientComprehensive(client.id, payload)
    
    if (res.success) {
      setSuccessMessage('Client and company details successfully updated!')
      setTimeout(() => {
        router.push(`/clients/${client.id}`)
        router.refresh()
      }, 500)
    } else {
      setError(res.error || 'Failed to update client.')
      setIsSubmitting(false)
    }
  }

  const progressPercent = Math.round((currentStep / (WIZARD_STEPS.length - 1)) * 100)

  return (
    <div className="wizard-page">
      <div className="wizard-topline">
        <div className="wizard-header">
          <p className="eyebrow">Update record</p>
          <h1>Edit client: {client.fullName}</h1>
          <p>Update any client details, company information, services, fleet, or reminders.</p>
        </div>
        <div className="header-actions">
          <Link href={`/clients/${client.id}`} className="wizard-btn wizard-btn-secondary">Close</Link>
        </div>
      </div>

      <div className="wizard-shell">
        {/* WIZARD PROGRESS RAIL */}
        <aside className="wizard-rail">
          <div className="wizard-progress-copy">
            <span>Edit progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="wizard-steps">
            {WIZARD_STEPS.map(([name, desc], index) => (
              <button 
                key={name}
                type="button"
                className={`wizard-step ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'done' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <span className="wizard-step-number">{index + 1}</span>
                <div>
                  <strong>{name}</strong>
                  <span>{desc}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* WIZARD CONTENT AREA */}
        <div className="wizard-content">
          {error && (
            <div className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 0: CLIENT DETAILS */}
          {currentStep === 0 && (
            <section className="form-step active">
              <div className="step-heading">
                <div className="step-heading-row">
                  <div>
                    <h2>Client details</h2>
                    <p>Edit client identity, legal representation, and contact channels.</p>
                  </div>
                  <span className="required-note"><strong>*</strong> Required fields</span>
                </div>
              </div>

              <div className="form-grid three">
                <div className="field span-2">
                  <label>Full legal name <span className="required">*</span></label>
                  <input name="fullName" value={clientData.fullName || ''} onChange={updateClient} placeholder="e.g. Mohammed Ali" required />
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
                  <label>Mobile number <span className="required">*</span></label>
                  <input type="tel" name="mobileNumber" value={clientData.mobileNumber || ''} onChange={updateClient} placeholder="+971 50 000 0000" required />
                </div>
                <div className="field">
                  <label>WhatsApp number</label>
                  <input type="tel" name="whatsappNumber" value={clientData.whatsappNumber || ''} onChange={updateClient} placeholder="+971 50 000 0000" />
                </div>
                <div className="field">
                  <label>Email address <span className="required">*</span></label>
                  <input type="email" name="email" value={clientData.email || ''} onChange={updateClient} placeholder="client@example.com" required />
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
                    <p>Connect the client to a registered business, or manage as an individual.</p>
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
                    <label>Establishment card number</label>
                    <input name="estCardNumber" value={companyData.estCardNumber || ''} onChange={updateCompany} placeholder="Est card number" />
                  </div>
                  <div className="field">
                    <label>Est card expiry date</label>
                    <input type="date" name="estCardExpiryDate" value={companyData.estCardExpiryDate || ''} onChange={updateCompany} />
                  </div>
                  <div className="field">
                    <label>VAT TRN</label>
                    <input name="vatTrn" value={companyData.vatTrn || ''} onChange={updateCompany} placeholder="Tax registration number" />
                  </div>
                  <div className="field">
                    <label>Corporate tax number</label>
                    <input name="corporateTaxRegNumber" value={companyData.corporateTaxRegNumber || ''} onChange={updateCompany} placeholder="CT registration" />
                  </div>
                  <div className="field">
                    <label>Official company email</label>
                    <input type="email" name="companyEmail" value={companyData.companyEmail || ''} onChange={updateCompany} placeholder="info@company.com" />
                  </div>
                  <div className="field">
                    <label>Official company phone</label>
                    <input type="tel" name="companyMobile" value={companyData.companyMobile || ''} onChange={updateCompany} placeholder="+971 4 000 0000" />
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><User /></div>
                    <h3>Individual client</h3>
                    <p>This record is saved without a connected business profile.</p>
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
                    <p>Manage employees, partners or members for this client/company.</p>
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
                    <h2>Vehicles & Fleet</h2>
                    <p>Track registered vehicles, registration cards and insurance expiry.</p>
                  </div>
                  <button onClick={() => setVehicles([...vehicles, {}])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add vehicle</button>
                </div>
              </div>

              {vehicles.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><Car /></div>
                    <h3>No vehicles added</h3>
                    <p>Track fleet, registration cards and insurance expiry.</p>
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
                    <h2>Services &amp; packages</h2>
                    <p>Manage assigned business setup, visa, accounting, PRO, or legal packages with manual price agreement.</p>
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
                      value={selectedEditCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ServiceCategoryType
                        setSelectedEditCategory(cat)
                        setSelectedEditPackage(SERVICE_PACKAGES_BY_CATEGORY[cat][0])
                        setIsEditCustomPackage(false)
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
                      value={isEditCustomPackage ? '__CUSTOM__' : selectedEditPackage}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsEditCustomPackage(true)
                        } else {
                          setIsEditCustomPackage(false)
                          setSelectedEditPackage(e.target.value)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {SERVICE_PACKAGES_BY_CATEGORY[selectedEditCategory]?.map(pkg => (
                        <option key={pkg} value={pkg}>{pkg}</option>
                      ))}
                      <option value="__CUSTOM__">✍️ Custom Package Name...</option>
                    </select>
                  </div>

                  {isEditCustomPackage && (
                    <div className="field">
                      <label>Custom Package Name</label>
                      <input 
                        type="text" 
                        value={editCustomPackageName}
                        onChange={(e) => setEditCustomPackageName(e.target.value)}
                        placeholder="Enter package name..." 
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={handleAddPackageToEdit}
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
                    <h3>No packages assigned yet</h3>
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
                    <p>Register or update the files associated with this client.</p>
                  </div>
                  <button onClick={() => setDocuments([...documents, {}])} className="wizard-btn wizard-btn-primary" style={{ minHeight: '32px', fontSize: '13px' }}>+ Add document</button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <div className="empty-icon"><FileText /></div>
                    <h3>No documents attached</h3>
                    <p>Register the files associated with this client.</p>
                    <button onClick={() => setDocuments([...documents, {}])} className="wizard-btn wizard-btn-secondary">Click here to add one</button>
                  </div>
                </div>
              ) : (
                <div className="service-list">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="service-card">
                      <div className="service-card-header">
                        <div className="service-card-title">
                          <span className="service-index">{idx + 1}</span>
                          <strong>Document Details</strong>
                        </div>
                        <button onClick={() => setDocuments(documents.filter((_, i) => i !== idx))} className="remove-service">Remove</button>
                      </div>
                      <div className="service-fields form-grid">
                        <div className="field">
                          <label>Document Title</label>
                          <input value={doc.title || ''} onChange={e => { const nd = [...documents]; nd[idx].title = e.target.value; setDocuments(nd); }} placeholder="e.g. Trade Licence Copy" />
                        </div>
                        <div className="field">
                          <label>Document Type</label>
                          <select value={doc.documentType || 'Other'} onChange={e => { const nd = [...documents]; nd[idx].documentType = e.target.value; setDocuments(nd); }}>
                            <option value="Trade License">Trade License</option>
                            <option value="Establishment Card">Establishment Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Emirates ID">Emirates ID</option>
                            <option value="Visa">Visa</option>
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
                    <h2>Payment details</h2>
                    <p>Record fees, received amounts and the transaction method.</p>
                  </div>
                </div>
              </div>

              <div className="form-grid three">
                <div className="field">
                  <label>Government fee (AED)</label>
                  <input type="number" name="government" value={payment.government || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Service fee (AED)</label>
                  <input type="number" name="service" value={payment.service || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Other charges (AED)</label>
                  <input type="number" name="other" value={payment.other || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Amount received (AED)</label>
                  <input type="number" name="received" value={payment.received || ''} onChange={updatePayment} placeholder="0.00" />
                </div>
                <div className="field">
                  <label>Payment method</label>
                  <select name="method" value={payment.method || 'Bank Transfer'} onChange={updatePayment}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select name="status" value={payment.status || 'Unpaid'} onChange={updatePayment}>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Credit">Credit</option>
                  </select>
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
                    <h2>Reminder & Follow-up</h2>
                    <p>Set the main due date so the record appears on your reminder board.</p>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Due / expiry date</label>
                  <input type="date" name="dueDate" value={reminder.dueDate || ''} onChange={updateReminder} />
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
                  <label>Internal follow-up notes</label>
                  <textarea name="notes" value={reminder.notes || ''} onChange={updateReminder} placeholder="Add context for the next follow-up…" />
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
                    <h2>Review and save changes</h2>
                    <p>Confirm the updated client information before saving.</p>
                  </div>
                </div>
              </div>

              <div className="review-grid">
                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Client Information</h3>
                    <button type="button" onClick={() => setCurrentStep(0)} className="remove-service" style={{ color: '#6d5dfc' }}>Edit</button>
                  </div>
                  <div className="review-row"><span>Name:</span><strong>{clientData.fullName || '—'}</strong></div>
                  <div className="review-row"><span>Phone:</span><strong>{clientData.mobileNumber || '—'}</strong></div>
                  <div className="review-row"><span>Email:</span><strong>{clientData.email || '—'}</strong></div>
                  <div className="review-row"><span>Passport:</span><strong>{clientData.passportNumber || '—'}</strong></div>
                  <div className="review-row"><span>Emirates ID:</span><strong>{clientData.emiratesIdNumber || '—'}</strong></div>
                </div>

                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Company Information</h3>
                    <button type="button" onClick={() => setCurrentStep(1)} className="remove-service" style={{ color: '#6d5dfc' }}>Edit</button>
                  </div>
                  <div className="review-row"><span>Type:</span><strong>{clientData.clientType}</strong></div>
                  <div className="review-row"><span>Company Name:</span><strong>{companyData.legalName || 'Individual'}</strong></div>
                  <div className="review-row"><span>Licence Number:</span><strong>{companyData.tradeLicenceNumber || '—'}</strong></div>
                  <div className="review-row"><span>Licence Expiry:</span><strong>{companyData.licenceExpiryDate || '—'}</strong></div>
                  <div className="review-row"><span>VAT TRN:</span><strong>{companyData.vatTrn || '—'}</strong></div>
                </div>

                <div className="review-card full">
                  <div className="review-card-header">
                    <h3>Services ({services.length})</h3>
                    <button type="button" onClick={() => setCurrentStep(5)} className="remove-service" style={{ color: '#6d5dfc' }}>Edit</button>
                  </div>
                  {services.length === 0 ? (
                    <div className="review-row"><span>No services configured</span></div>
                  ) : (
                    services.map((s, idx) => (
                      <div key={idx} className="review-row">
                        <span>{s.name}</span>
                        <strong>{s.status} {s.price ? `· AED ${s.price}` : ''}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Operations summary</h3>
                  </div>
                  <div className="review-row"><span>Members / Employees:</span><strong>{members.length}</strong></div>
                  <div className="review-row"><span>Vehicles:</span><strong>{vehicles.length}</strong></div>
                  <div className="review-row"><span>Drivers:</span><strong>{drivers.length}</strong></div>
                  <div className="review-row"><span>Documents:</span><strong>{documents.length}</strong></div>
                </div>

                <div className="review-card">
                  <div className="review-card-header">
                    <h3>Follow-up & Reminder</h3>
                    <button type="button" onClick={() => setCurrentStep(8)} className="remove-service" style={{ color: '#6d5dfc' }}>Edit</button>
                  </div>
                  <div className="review-row"><span>Due Date:</span><strong>{reminder.dueDate || '—'}</strong></div>
                  <div className="review-row"><span>Priority:</span><strong>{reminder.priority}</strong></div>
                  <div className="review-row"><span>Notes:</span><strong>{reminder.notes || '—'}</strong></div>
                </div>
              </div>
            </section>
          )}

          {/* WIZARD FOOTER */}
          <footer className="wizard-footer">
            <div className="wizard-footer-left">
              {currentStep > 0 && (
                <button type="button" onClick={prevStep} className="wizard-btn wizard-btn-secondary">← Back</button>
              )}
            </div>
            <div className="wizard-footer-right">
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="wizard-btn wizard-btn-primary">Save & continue →</button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={isSubmitting} 
                  className="wizard-btn wizard-btn-primary"
                >
                  {isSubmitting ? 'Saving changes...' : 'Save changes ✓'}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
