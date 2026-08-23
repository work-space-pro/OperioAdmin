'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Upload,
  User,
  ShieldCheck,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { submitNewApplicationAction } from './actions'

const SERVICE_CATEGORIES = [
  {
    id: 'Business Setup',
    title: 'Business Setup & Licensing',
    desc: 'Mainland, Freezone LLC formation, trade licence amendments & branch office.',
    services: [
      'New Mainland LLC Formation',
      'Free Zone Company Setup',
      'Trade Licence Renewal',
      'Add / Change Business Activity',
      'Change of Partner / Share Transfer',
      'Establishment Card Renewal',
    ],
  },
  {
    id: 'Visa & Immigration',
    title: 'Visa & Emirates ID Services',
    desc: 'Investor, partner, employee & family residence visas and Emirates ID typing.',
    services: [
      'Investor / Golden Visa (10 Years)',
      'Partner / Owner Residence Visa',
      'New Employment Visa & Work Permit',
      'Visa Renewal & Stamping',
      'Dependent / Family Residence Visa',
      'Visa Cancellation & UID Clearance',
    ],
  },
  {
    id: 'Tax & Accounting',
    title: 'VAT & Corporate Tax',
    desc: 'Federal Tax Authority VAT registration, quarterly return filings & corporate tax.',
    services: [
      'VAT Registration & TRN Issuance',
      'Quarterly VAT Return Filing',
      'Corporate Tax Registration',
      'Corporate Tax Filing & Assessment',
      'Bookkeeping & Financial Statements',
      'Tax Deregistration / Amendment',
    ],
  },
  {
    id: 'PRO Services',
    title: 'Government PRO Services',
    desc: 'Ministry of Labour, Immigration, Chamber of Commerce & attestation.',
    services: [
      'Ministry of Economy Approvals',
      'Document Legalization & Attestation',
      'Trade Mark & Brand Registration',
      'Ejari & Tenancy Contract Attestation',
      'Customs Code Registration',
      'General PRO Clearance Support',
    ],
  },
  {
    id: 'Insurance & Compliance',
    title: 'Insurance & Compliance',
    desc: 'Mandatory employee health insurance, ILOE insurance & AML compliance.',
    services: [
      'Corporate Health Insurance Scheme',
      'Individual & Family Health Insurance',
      'ILOE Unemployment Insurance Support',
      'AML / CFT Compliance Verification',
      'Commercial Vehicle Insurance / Fleet',
    ],
  },
  {
    id: 'Other',
    title: 'Custom Advisory Request',
    desc: 'Customized business consulting or specialized legal requirement.',
    services: [
      'Custom Business Consultancy Request',
      'Legal Contract Drafting / Review',
      'Bank Account Opening Assistance',
      'Other Customized Service',
    ],
  },
]

export default function NewApplicationWizard({
  client,
  companies,
}: {
  client: any
  companies: any[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '')
  const [isIndividual, setIsIndividual] = useState(companies.length === 0)
  const [selectedCategory, setSelectedCategory] = useState(SERVICE_CATEGORIES[0].id)
  const [selectedService, setSelectedService] = useState(SERVICE_CATEGORIES[0].services[0])
  const [customTitle, setCustomTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contactPerson, setContactPerson] = useState(client.fullName || '')
  const [contactNumber, setContactNumber] = useState(client.mobileNumber || '')
  const [preferredContact, setPreferredContact] = useState('Email')
  const [clientNotes, setClientNotes] = useState('')

  // Mock document items to upload
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ title: string; documentType: string; fileUrl: string }>>([])
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocType, setNewDocType] = useState('Passport')

  const handleAddDoc = () => {
    if (!newDocTitle) return
    setUploadedDocs([
      ...uploadedDocs,
      {
        title: newDocTitle,
        documentType: newDocType,
        fileUrl: `/uploads/${encodeURIComponent(newDocTitle)}.pdf`,
      },
    ])
    setNewDocTitle('')
  }

  const handleRemoveDoc = (index: number) => {
    setUploadedDocs(uploadedDocs.filter((_, i) => i !== index))
  }

  const categoryObj = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory) || SERVICE_CATEGORIES[0]
  const currentCompany = companies.find((c) => c.id === selectedCompanyId)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const payload = {
      companyId: isIndividual ? undefined : selectedCompanyId,
      serviceCategory: selectedCategory,
      serviceType: selectedService,
      title: customTitle || selectedService,
      description,
      contactPerson,
      contactNumber,
      preferredContact,
      clientNotes,
      uploadedDocs,
    }

    const res = await submitNewApplicationAction(payload)

    if (res.success) {
      router.push(`/portal/applications/${res.applicationId}`)
    } else {
      setError(res.error || 'Failed to submit application.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/portal/applications"
            className="text-xs font-bold text-slate-500 hover:text-[#5B21B6] inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to applications</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900">Start New Service Application</h1>
          <p className="text-xs text-slate-500 font-medium">
            Step {step} of 5: {step === 1 ? 'Select Entity' : step === 2 ? 'Category & Service' : step === 3 ? 'Application Details' : step === 4 ? 'Supporting Documents' : 'Review & Submit'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-8 h-2 rounded-full transition-all ${
                s === step
                  ? 'bg-[#5B21B6]'
                  : s < step
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* STEP 1: SELECT ENTITY */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Who is this application for?
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Select whether this service applies to one of your registered companies or your personal individual profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {companies.map((co) => (
              <button
                key={co.id}
                type="button"
                onClick={() => {
                  setSelectedCompanyId(co.id)
                  setIsIndividual(false)
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  !isIndividual && selectedCompanyId === co.id
                    ? 'border-[#5B21B6] bg-purple-50/70 ring-2 ring-[#5B21B6]/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{co.legalName}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {co.tradeLicenceNumber ? `TL: ${co.tradeLicenceNumber}` : 'Company Profile'}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsIndividual(true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isIndividual
                  ? 'border-[#5B21B6] bg-purple-50/70 ring-2 ring-[#5B21B6]/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Personal Individual Profile</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{client.fullName}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all shadow-xs"
            >
              <span>Next: Select Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CATEGORY & SERVICE */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Choose Service Category
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pick the operational sector for this request.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedService(cat.services[0])
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedCategory === cat.id
                    ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6] font-bold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <p className="text-xs font-bold">{cat.title}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              Select Specific Service Package
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryObj.services.map((srv) => (
                <label
                  key={srv}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedService === srv
                      ? 'border-[#5B21B6] bg-purple-50/50 ring-1 ring-[#5B21B6]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedService"
                    checked={selectedService === srv}
                    onChange={() => setSelectedService(srv)}
                    className="text-[#5B21B6] focus:ring-[#5B21B6]"
                  />
                  <span className="text-xs font-bold text-slate-900">{srv}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all shadow-xs"
            >
              <span>Next: Details & Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: APPLICATION DETAILS */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Application Details & Contact Channel
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Application Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={selectedService}
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mohammed Ali"
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Update Method
              </label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
              >
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone">Phone Call</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Specific Requirements
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your requirements, preferred timelines, or any special considerations..."
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all shadow-xs"
            >
              <span>Next: Attach Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUPPORTING DOCUMENTS */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Upload Supporting Documents
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Attach any relevant passport copies, trade licenses, or forms required to process this request.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document Title / File Description
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Passport Copy - John Doe"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20"
                >
                  <option value="Passport">Passport</option>
                  <option value="Visa">Visa</option>
                  <option value="Emirates ID">Emirates ID</option>
                  <option value="Trade Licence">Trade Licence</option>
                  <option value="Ejari">Ejari / Tenancy</option>
                  <option value="Other">Other Supporting File</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddDoc}
              disabled={!newDocTitle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B21B6] text-white text-xs font-bold disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Add Document to Application</span>
            </button>
          </div>

          {/* Uploaded List */}
          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700">Attached Files ({uploadedDocs.length})</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {uploadedDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#5B21B6]" />
                      <span className="font-bold text-slate-800">{doc.title}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {doc.documentType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all shadow-xs"
            >
              <span>Next: Review & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Review & Confirm Submission
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Entity</span>
              <span className="font-bold text-slate-900">
                {isIndividual ? 'Individual Client' : currentCompany?.legalName || 'Company'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Service Category</span>
              <span className="font-bold text-slate-900">{selectedCategory}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Service Package</span>
              <span className="font-bold text-[#5B21B6]">{selectedService}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Contact Person</span>
              <span className="font-bold text-slate-900">{contactPerson} ({contactNumber})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Attached Documents</span>
              <span className="font-bold text-slate-900">{uploadedDocs.length} files</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-md shadow-purple-900/10 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Application</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
