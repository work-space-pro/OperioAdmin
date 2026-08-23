'use client'

import React, { useState } from 'react'
import {
  Building2,
  FileCheck2,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Users,
  Car,
  BadgeCheck,
  ShieldCheck,
  Briefcase,
  Layers,
  Landmark,
  UserCheck,
  Eye,
  Edit3,
  Plus,
  X,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  User,
  Shield,
  DollarSign,
} from 'lucide-react'
import { usePortal } from '@/components/portal/PortalContext'
import { submitStructuredEntityRequestAction } from './actions'

export default function PortalCompanyView({
  companiesData,
  client,
}: {
  companiesData: any[]
  client: any
}) {
  const { activeCompany, setActiveCompanyId } = usePortal()
  const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'employees' | 'vehicles' | 'bankAccounts'>('overview')

  // Detailed Modal State
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null)
  const [viewModalType, setViewModalType] = useState<'partner' | 'employee' | 'vehicle' | 'bank' | null>(null)

  // Structured Form Modal State
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'ADD_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'ADD_PARTNER' | 'UPDATE_PARTNER' | 'ADD_VEHICLE' | 'UPDATE_VEHICLE' | 'ADD_BANK' | 'UPDATE_BANK' | 'UPDATE_COMPANY'>('ADD_EMPLOYEE')
  const [targetEntity, setTargetEntity] = useState<any | null>(null)

  // Form Fields State
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [docTitle, setDocTitle] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const currentCompany = companiesData.find((c) => c.id === activeCompany?.id) || companiesData[0]

  if (!currentCompany) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Company Profile Found</h3>
        <p className="text-xs text-slate-500 mt-1">You are currently registered as an individual client.</p>
      </div>
    )
  }

  // Smart Separation of Partners/Signatories vs Regular Staff
  const isPartnerCheck = (e: any) => {
    const isPartnerVisa = e.visaType?.toLowerCase().includes('partner') || e.visaType?.toLowerCase().includes('investor')
    const isPartnerRole =
      e.designation?.toLowerCase().includes('partner') ||
      e.designation?.toLowerCase().includes('director') ||
      e.designation?.toLowerCase().includes('owner') ||
      e.designation?.toLowerCase().includes('shareholder') ||
      e.designation?.toLowerCase().includes('manager')
    return isPartnerVisa || isPartnerRole
  }

  // 1. Full Partners & Signatories List
  const partnersList = [
    ...currentCompany.personnel.map((p: any) => ({
      ...p,
      source: 'personnel',
    })),
    // Add primary owner (client) if not already listed
    ...(currentCompany.personnel.some((p: any) => p.fullName.toLowerCase() === client.fullName.toLowerCase())
      ? []
      : [
          {
            id: `client-owner-${client.id}`,
            fullName: client.fullName,
            designation: 'Owner / Primary Authorized Signatory',
            ownershipPercentage: 100,
            nationality: client.nationality || 'Indian',
            mobile: client.mobileNumber,
            email: client.email,
            passportNumber: client.passportNumber,
            passportExpiryDate: client.passportExpiryDate,
            emiratesIdNumber: client.emiratesIdNumber,
            emiratesIdExpiryDate: client.eidExpiryDate,
            visaNumber: client.visaNumber,
            visaExpiryDate: client.visaExpiryDate,
            isOwner: true,
            isSignatory: true,
            source: 'client',
          },
        ]),
    // Add employees who have partner/director designation or partner visa
    ...currentCompany.employees.filter(isPartnerCheck).map((e: any) => ({
      id: `emp-partner-${e.id}`,
      fullName: e.fullName,
      designation: e.designation || 'Partner / Signatory',
      ownershipPercentage: null,
      nationality: e.nationality,
      mobile: e.mobile,
      email: e.email,
      passportNumber: e.passportNumber,
      passportExpiryDate: e.passportExpiry,
      emiratesIdNumber: e.emiratesId,
      emiratesIdExpiryDate: e.eidExpiryDate,
      visaNumber: e.visaNumber,
      visaExpiryDate: e.visaExpiryDate,
      visaType: e.visaType,
      healthInsNumber: e.healthInsNumber,
      healthInsExpiry: e.healthInsExpiry,
      basicSalary: e.basicSalary,
      allowances: e.allowances,
      isOwner: false,
      isSignatory: true,
      source: 'employee',
    })),
  ]

  // 2. Regular Staff & Visas List (excludes partner roles)
  const staffList = currentCompany.employees.filter((e: any) => !isPartnerCheck(e))

  const formatDateForInput = (val: any): string => {
    if (!val) return ''
    if (typeof val === 'string') return val.split('T')[0]
    if (val instanceof Date) {
      try {
        return val.toISOString().split('T')[0]
      } catch {
        return ''
      }
    }
    return ''
  }

  const handleOpenForm = (
    mode: 'ADD_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'ADD_PARTNER' | 'UPDATE_PARTNER' | 'ADD_VEHICLE' | 'UPDATE_VEHICLE' | 'ADD_BANK' | 'UPDATE_BANK' | 'UPDATE_COMPANY',
    entity: any = null
  ) => {
    setFormMode(mode)
    setTargetEntity(entity)
    setFormNotes('')
    setDocTitle('')
    setSuccessMessage('')

    if (entity) {
      setFormData({
        fullName: entity.fullName || '',
        designation: entity.designation || '',
        nationality: entity.nationality || 'Indian',
        mobile: entity.mobile || '',
        email: entity.email || '',
        passportNumber: entity.passportNumber || '',
        passportExpiryDate: formatDateForInput(entity.passportExpiryDate || entity.passportExpiry),
        emiratesId: entity.emiratesIdNumber || entity.emiratesId || '',
        eidExpiryDate: formatDateForInput(entity.emiratesIdExpiryDate || entity.eidExpiryDate),
        visaType: entity.visaType || 'Employment',
        visaNumber: entity.visaNumber || '',
        visaExpiryDate: formatDateForInput(entity.visaExpiryDate),
        healthInsNumber: entity.healthInsNumber || '',
        basicSalary: entity.basicSalary || '',
        allowances: entity.allowances || '',
        ownershipPercentage: entity.ownershipPercentage || '',
        // Vehicle fields
        regNo: entity.regNo || '',
        tcNo: entity.tcNo || '',
        policyNo: entity.policyNo || '',
        expDate: formatDateForInput(entity.expDate),
        insuranceExpDate: formatDateForInput(entity.insuranceExpDate),
        // Bank fields
        bankName: entity.bankName || '',
        accountName: entity.accountName || '',
        accountNumber: entity.accountNumber || '',
        iban: entity.iban || '',
        swiftCode: entity.swiftCode || '',
        branch: entity.branch || '',
        currency: entity.currency || 'AED',
      })
    } else {
      setFormData({
        nationality: 'Indian',
        visaType: mode === 'ADD_PARTNER' ? 'Partner' : 'Employment',
        currency: 'AED',
      })
    }

    setShowFormModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    const res = await submitStructuredEntityRequestAction({
      companyId: currentCompany.id,
      requestType: formMode,
      targetEntityId: targetEntity?.id,
      targetEntityName: targetEntity?.fullName || targetEntity?.regNo || targetEntity?.bankName,
      formData,
      documentUrls: docTitle ? [`/uploads/${encodeURIComponent(docTitle)}.pdf`] : [],
      notes: formNotes,
    })

    if (res.success) {
      setSuccessMessage(`Request (${res.requestNumber}) queued successfully! Our team will review & approve it shortly.`)
      setTimeout(() => {
        setShowFormModal(false)
        setSuccessMessage('')
      }, 2500)
    }
    setSubmitting(false)
  }

  const getDaysLeftBadge = (dateStr: string | null | undefined) => {
    if (!dateStr) return <span className="text-slate-400 font-semibold">—</span>
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    if (days < 0) {
      return <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">EXPIRED ({Math.abs(days)}d ago)</span>
    }
    if (days <= 60) {
      return <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{days} DAYS LEFT</span>
    }
    return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{days} DAYS VALID</span>
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Company Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-black text-xl flex-shrink-0 shadow-xs">
              {currentCompany.legalName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{currentCompany.legalName}</h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  {currentCompany.status || 'Active'}
                </span>
                {currentCompany.zoneType && (
                  <span className="bg-purple-50 text-[#5B21B6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {currentCompany.zoneType} {currentCompany.freeZoneName && `(${currentCompany.freeZoneName})`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {currentCompany.tradeName ? `Trade Name: ${currentCompany.tradeName} • ` : ''}
                {currentCompany.legalForm || 'Commercial Entity'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenForm('UPDATE_COMPANY', currentCompany)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Company Update</span>
            </button>

            {companiesData.length > 1 && (
              <select
                value={currentCompany.id}
                onChange={(e) => setActiveCompanyId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#5B21B6]/20 focus:outline-none"
              >
                {companiesData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legalName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Registrations
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'personnel'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Partners & Signatories ({partnersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'employees'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff & Visas ({staffList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vehicles'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Company Fleet ({currentCompany.vehicles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bankAccounts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bankAccounts'
                ? 'bg-[#5B21B6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank Accounts ({currentCompany.bankAccounts.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Overview & Registrations */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Government Registrations Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#5B21B6]" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Government Registrations & Licenses
                </h2>
              </div>
              <button
                onClick={() => handleOpenForm('UPDATE_COMPANY', currentCompany)}
                className="text-[11px] font-bold text-[#5B21B6] hover:underline"
              >
                Request Update
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Trade Licence No.</span>
                <span className="font-bold text-slate-900">{currentCompany.tradeLicenceNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Licence Issue Date</span>
                <span className="font-bold text-slate-900">
                  {currentCompany.licenceIssueDate ? new Date(currentCompany.licenceIssueDate).toLocaleDateString('en-GB') : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
                <span className="text-slate-500 font-semibold">Licence Expiry Date</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {currentCompany.licenceExpiryDate ? new Date(currentCompany.licenceExpiryDate).toLocaleDateString('en-GB') : '—'}
                  </span>
                  {getDaysLeftBadge(currentCompany.licenceExpiryDate)}
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Establishment Card No.</span>
                <span className="font-bold text-slate-900">{currentCompany.estCardNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
                <span className="text-slate-500 font-semibold">Est. Card Expiry Date</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {currentCompany.estCardExpiryDate ? new Date(currentCompany.estCardExpiryDate).toLocaleDateString('en-GB') : '—'}
                  </span>
                  {getDaysLeftBadge(currentCompany.estCardExpiryDate)}
                </div>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Business Activity</span>
                <span className="font-bold text-slate-900 text-right max-w-[60%]">
                  {currentCompany.businessActivity || 'General Trading & Commercial'}
                </span>
              </div>
            </div>
          </div>

          {/* Tax & Financial Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#5B21B6]" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Tax & Contact Details
                </h2>
              </div>
              <button
                onClick={() => handleOpenForm('UPDATE_COMPANY', currentCompany)}
                className="text-[11px] font-bold text-[#5B21B6] hover:underline"
              >
                Request Update
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">VAT TRN (Federal Tax)</span>
                <span className="font-bold text-slate-900">{currentCompany.vatTrn || 'Not Registered / In Progress'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Corporate Tax TRN</span>
                <span className="font-bold text-slate-900">{currentCompany.corporateTaxRegNumber || 'In Progress'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Official Email</span>
                <span className="font-bold text-slate-900">{currentCompany.companyEmail || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Official Phone</span>
                <span className="font-bold text-slate-900">{currentCompany.companyMobile || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-semibold">Registered Address</span>
                <span className="font-bold text-slate-900 text-right max-w-[60%]">
                  {currentCompany.registeredAddress || 'Dubai, United Arab Emirates'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Partners & Signatories */}
      {activeTab === 'personnel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Partners & Authorized Signatories ({partnersList.length})
            </h2>
            <button
              onClick={() => handleOpenForm('ADD_PARTNER')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Request Add Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnersList.map((p: any) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{p.fullName}</h3>
                      <span className="inline-block mt-1 bg-purple-50 text-[#5B21B6] border border-purple-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {p.designation || 'Partner'}
                      </span>
                    </div>
                    {p.isSignatory && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                        Signatory
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold text-[11px]">Nationality</span>
                      <span className="font-bold text-slate-800">{p.nationality || 'Indian'}</span>
                    </div>
                    {p.ownershipPercentage && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Ownership Share</span>
                        <span className="font-bold text-purple-700">{p.ownershipPercentage}%</span>
                      </div>
                    )}
                    {p.passportNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Passport No.</span>
                        <span className="font-mono font-bold text-slate-800">{p.passportNumber}</span>
                      </div>
                    )}
                    {p.passportExpiryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold text-[11px]">Passport Exp.</span>
                        <span className="font-bold text-slate-700">
                          {new Date(p.passportExpiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {p.emiratesIdNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Emirates ID</span>
                        <span className="font-mono font-bold text-slate-800">{p.emiratesIdNumber}</span>
                      </div>
                    )}
                    {p.visaExpiryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold text-[11px]">Visa Status</span>
                        {getDaysLeftBadge(p.visaExpiryDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedEntity(p)
                      setViewModalType('partner')
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => handleOpenForm('UPDATE_PARTNER', p)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Request Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Staff & Visas */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Company Sponsored Staff & Employees ({staffList.length})
            </h2>
            <button
              onClick={() => handleOpenForm('ADD_EMPLOYEE')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Request New Visa / Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((e: any) => (
              <div
                key={e.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{e.fullName}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {e.designation || 'Staff'} • {e.nationality || 'Expatriate'}
                      </p>
                    </div>
                    <span className="bg-purple-50 text-[#5B21B6] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-purple-100">
                      {e.visaType || 'Employment'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold text-[11px]">Visa Expiry</span>
                      {getDaysLeftBadge(e.visaExpiryDate)}
                    </div>
                    {e.visaExpiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Expiry Date</span>
                        <span className="font-bold text-slate-800">
                          {new Date(e.visaExpiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {e.passportNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Passport No.</span>
                        <span className="font-mono font-bold text-slate-800">{e.passportNumber}</span>
                      </div>
                    )}
                    {e.passportExpiry && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Passport Exp.</span>
                        <span className="font-bold text-slate-700">
                          {new Date(e.passportExpiry).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {e.emiratesId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Emirates ID</span>
                        <span className="font-mono font-bold text-slate-800">{e.emiratesId}</span>
                      </div>
                    )}
                    {e.healthInsNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Health Insurance</span>
                        <span className="font-bold text-slate-800">{e.healthInsNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedEntity(e)
                      setViewModalType('employee')
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile & Expiries</span>
                  </button>

                  <button
                    onClick={() => handleOpenForm('UPDATE_EMPLOYEE', e)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Request Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Company Fleet / Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Company Fleet & Registered Vehicles ({currentCompany.vehicles.length})
            </h2>
            <button
              onClick={() => handleOpenForm('ADD_VEHICLE')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register New Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCompany.vehicles.map((v: any) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900">Plate: {v.regNo}</h3>
                        <p className="text-[10px] text-slate-400 font-medium">TC No: {v.tcNo || '—'}</p>
                      </div>
                    </div>
                    {getDaysLeftBadge(v.expDate)}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold text-[11px]">Mulkiya Expiry</span>
                      <span className="font-bold text-slate-800">
                        {v.expDate ? new Date(v.expDate).toLocaleDateString('en-GB') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold text-[11px]">Insurance Policy</span>
                      <span className="font-mono font-bold text-slate-800">{v.policyNo || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold text-[11px]">Insurance Expiry</span>
                      <span className="font-bold text-slate-800">
                        {v.insuranceExpDate ? new Date(v.insuranceExpDate).toLocaleDateString('en-GB') : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedEntity(v)
                      setViewModalType('vehicle')
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Mulkiya</span>
                  </button>

                  <button
                    onClick={() => handleOpenForm('UPDATE_VEHICLE', v)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Request Renewal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Bank Accounts */}
      {activeTab === 'bankAccounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Corporate Bank Accounts ({currentCompany.bankAccounts.length})
            </h2>
            <button
              onClick={() => handleOpenForm('ADD_BANK')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Link New Bank Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCompany.bankAccounts.map((b: any) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900">{b.bankName}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                      {b.accountStatus || 'Active'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50 font-medium">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Account Name</span>
                      <span className="font-bold text-slate-900">{b.accountName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Account Number</span>
                      <span className="font-mono font-bold text-slate-900">{b.accountNumber}</span>
                    </div>
                    {b.iban && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">IBAN</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] break-all">{b.iban}</span>
                      </div>
                    )}
                    {b.swiftCode && (
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400 text-[11px]">SWIFT Code</span>
                        <span className="font-mono font-bold text-slate-800">{b.swiftCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedEntity(b)
                      setViewModalType('bank')
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B21B6] hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleOpenForm('UPDATE_BANK', b)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Request Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL DETAILED VIEW PROFILE MODAL */}
      {selectedEntity && viewModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => {
              setSelectedEntity(null)
              setViewModalType(null)
            }}
          />
          <div className="relative bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-black">
                  {viewModalType === 'partner' ? <UserCheck className="w-5 h-5" /> : viewModalType === 'employee' ? <Users className="w-5 h-5" /> : viewModalType === 'vehicle' ? <Car className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">
                    {viewModalType === 'partner' ? 'Partner & Signatory Record' : viewModalType === 'employee' ? 'Staff Visa & Profile Record' : viewModalType === 'vehicle' ? 'Vehicle Mulkiya Record' : 'Corporate Bank Account'}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {selectedEntity.fullName || `Plate ${selectedEntity.regNo}` || selectedEntity.bankName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEntity(null)
                  setViewModalType(null)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Structured Grid Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Expiry Radar Pill Bar */}
              {(selectedEntity.visaExpiryDate || selectedEntity.passportExpiry || selectedEntity.passportExpiryDate || selectedEntity.expDate) && (
                <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5B21B6]" />
                    <span>Active Expiry Tracker:</span>
                  </span>
                  {selectedEntity.visaExpiryDate && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-semibold">Visa:</span>
                      {getDaysLeftBadge(selectedEntity.visaExpiryDate)}
                    </div>
                  )}
                  {(selectedEntity.passportExpiry || selectedEntity.passportExpiryDate) && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-semibold">Passport:</span>
                      {getDaysLeftBadge(selectedEntity.passportExpiry || selectedEntity.passportExpiryDate)}
                    </div>
                  )}
                  {selectedEntity.expDate && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-semibold">Mulkiya:</span>
                      {getDaysLeftBadge(selectedEntity.expDate)}
                    </div>
                  )}
                </div>
              )}

              {/* Section 1: Personal & Designation */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                  Basic & Role Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Full Name</span>
                    <span className="font-bold text-slate-900">{selectedEntity.fullName || selectedEntity.regNo || selectedEntity.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Designation / Category</span>
                    <span className="font-bold text-slate-900">{selectedEntity.designation || selectedEntity.visaType || 'Commercial'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Nationality</span>
                    <span className="font-bold text-slate-800">{selectedEntity.nationality || 'Indian'}</span>
                  </div>
                  {selectedEntity.ownershipPercentage && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Ownership Percentage</span>
                      <span className="font-bold text-purple-700">{selectedEntity.ownershipPercentage}%</span>
                    </div>
                  )}
                  {selectedEntity.mobile && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Mobile Phone</span>
                      <span className="font-bold text-slate-800">{selectedEntity.mobile}</span>
                    </div>
                  )}
                  {selectedEntity.email && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Email Address</span>
                      <span className="font-bold text-slate-800 break-all">{selectedEntity.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Passport, Visa & Emirates ID */}
              {(selectedEntity.passportNumber || selectedEntity.visaNumber || selectedEntity.emiratesId || selectedEntity.emiratesIdNumber) && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                    Passport, Visa & Emirates ID Record
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEntity.passportNumber && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Passport Number</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.passportNumber}</span>
                      </div>
                    )}
                    {(selectedEntity.passportExpiry || selectedEntity.passportExpiryDate) && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Passport Expiry Date</span>
                        <span className="font-bold text-slate-800">
                          {new Date(selectedEntity.passportExpiry || selectedEntity.passportExpiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {selectedEntity.visaNumber && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Visa File Number</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.visaNumber}</span>
                      </div>
                    )}
                    {selectedEntity.visaExpiryDate && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Visa Expiry Date</span>
                        <span className="font-bold text-slate-800">
                          {new Date(selectedEntity.visaExpiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {(selectedEntity.emiratesId || selectedEntity.emiratesIdNumber) && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Emirates ID (EID)</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.emiratesId || selectedEntity.emiratesIdNumber}</span>
                      </div>
                    )}
                    {(selectedEntity.eidExpiryDate || selectedEntity.emiratesIdExpiryDate) && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">EID Expiry Date</span>
                        <span className="font-bold text-slate-800">
                          {new Date(selectedEntity.eidExpiryDate || selectedEntity.emiratesIdExpiryDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                    {selectedEntity.healthInsNumber && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Health Insurance No</span>
                        <span className="font-bold text-slate-800">{selectedEntity.healthInsNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Salary & Compensation (If Staff) */}
              {(selectedEntity.basicSalary || selectedEntity.allowances) && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                    Compensation & Contract
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Basic Salary</span>
                      <span className="font-bold text-slate-900">{selectedEntity.currency || 'AED'} {selectedEntity.basicSalary}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Allowances</span>
                      <span className="font-bold text-slate-900">{selectedEntity.currency || 'AED'} {selectedEntity.allowances || '0'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Vehicle & Bank attributes */}
              {(selectedEntity.tcNo || selectedEntity.policyNo || selectedEntity.accountNumber || selectedEntity.iban) && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                    Registration & Financial Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEntity.tcNo && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Traffic Code No (TC)</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.tcNo}</span>
                      </div>
                    )}
                    {selectedEntity.policyNo && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Insurance Policy No</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.policyNo}</span>
                      </div>
                    )}
                    {selectedEntity.accountNumber && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Account Number</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEntity.accountNumber}</span>
                      </div>
                    )}
                    {selectedEntity.iban && (
                      <div className="col-span-2">
                        <span className="text-slate-400 font-semibold block text-[10px]">IBAN</span>
                        <span className="font-mono font-bold text-slate-900 break-all">{selectedEntity.iban}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedEntity(null)
                  setViewModalType(null)
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const ent = selectedEntity
                  const type = viewModalType === 'partner' ? 'UPDATE_PARTNER' : viewModalType === 'employee' ? 'UPDATE_EMPLOYEE' : viewModalType === 'vehicle' ? 'UPDATE_VEHICLE' : 'UPDATE_BANK'
                  setSelectedEntity(null)
                  setViewModalType(null)
                  handleOpenForm(type as any, ent)
                }}
                className="px-4 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Request Update / Change</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURED ADD / UPDATE REQUEST MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black text-[#5B21B6] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">
                  {formMode.startsWith('ADD') ? 'New Registration Request' : 'Information Update Request'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {formMode === 'ADD_EMPLOYEE'
                    ? 'Request New Staff Visa & Employee Addition'
                    : formMode === 'UPDATE_EMPLOYEE'
                    ? `Update Staff Information: ${targetEntity?.fullName}`
                    : formMode === 'ADD_PARTNER'
                    ? 'Request Partner / Signatory Addition'
                    : formMode === 'UPDATE_PARTNER'
                    ? `Update Partner: ${targetEntity?.fullName}`
                    : formMode === 'ADD_VEHICLE'
                    ? 'Register New Vehicle to Fleet'
                    : formMode === 'UPDATE_VEHICLE'
                    ? `Update Vehicle / Mulkiya: Plate ${targetEntity?.regNo}`
                    : formMode === 'ADD_BANK'
                    ? 'Link Corporate Bank Account'
                    : formMode === 'UPDATE_BANK'
                    ? `Update Bank Account: ${targetEntity?.bankName}`
                    : 'Request Company Information Update'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex flex-col items-center justify-center text-center space-y-2 my-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-1" />
                <span className="text-sm font-black">{successMessage}</span>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Your PRO team has been tasked with reviewing and verifying the government records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Notice Banner */}
                <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 text-purple-900 text-[11px] font-medium leading-relaxed">
                  🛡️ <span className="font-bold">Approval Notice: </span>
                  Submitted details will be sent directly to your Operio PRO team for compliance verification and authority filing before being activated in your company profile.
                </div>

                {/* FORM FIELDS FOR STAFF / PARTNER */}
                {(formMode.includes('EMPLOYEE') || formMode.includes('PARTNER')) && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Full Name (as per Passport) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName || ''}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation / Position</label>
                        <input
                          type="text"
                          value={formData.designation || ''}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          placeholder="e.g. Partner, Operations Manager, Driver"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nationality</label>
                        <input
                          type="text"
                          value={formData.nationality || ''}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          placeholder="e.g. Indian, Pakistani, British"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Passport Number</label>
                        <input
                          type="text"
                          value={formData.passportNumber || ''}
                          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                          placeholder="e.g. Z1234567"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Passport Expiry Date</label>
                        <input
                          type="date"
                          value={formData.passportExpiryDate || ''}
                          onChange={(e) => setFormData({ ...formData, passportExpiryDate: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Visa Type</label>
                        <select
                          value={formData.visaType || 'Employment'}
                          onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        >
                          <option value="Employment">Employment Visa</option>
                          <option value="Partner">Partner / Investor Visa</option>
                          <option value="Golden Visa">Golden Visa</option>
                          <option value="Dependent">Dependent Visa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Visa Expiry Date</label>
                        <input
                          type="date"
                          value={formData.visaExpiryDate || ''}
                          onChange={(e) => setFormData({ ...formData, visaExpiryDate: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Emirates ID (EID)</label>
                        <input
                          type="text"
                          value={formData.emiratesId || ''}
                          onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                          placeholder="784-XXXX-XXXXXXX-X"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">EID Expiry Date</label>
                        <input
                          type="date"
                          value={formData.eidExpiryDate || ''}
                          onChange={(e) => setFormData({ ...formData, eidExpiryDate: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone</label>
                        <input
                          type="tel"
                          value={formData.mobile || ''}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          placeholder="+971 50 XXX XXXX"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="staff@company.com"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      {formMode.includes('PARTNER') && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Ownership Share (%)</label>
                          <input
                            type="number"
                            value={formData.ownershipPercentage || ''}
                            onChange={(e) => setFormData({ ...formData, ownershipPercentage: e.target.value })}
                            placeholder="e.g. 25"
                            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                          />
                        </div>
                      )}

                      {formMode.includes('EMPLOYEE') && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Basic Salary (AED)</label>
                          <input
                            type="number"
                            value={formData.basicSalary || ''}
                            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                            placeholder="e.g. 3500"
                            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FORM FIELDS FOR VEHICLE */}
                {formMode.includes('VEHICLE') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Plate Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.regNo || ''}
                          onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                          placeholder="e.g. 48540 Dubai"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Traffic Code No (TC)</label>
                        <input
                          type="text"
                          value={formData.tcNo || ''}
                          onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                          placeholder="e.g. 1029384"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mulkiya Expiry Date</label>
                        <input
                          type="date"
                          value={formData.expDate || ''}
                          onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Insurance Policy No</label>
                        <input
                          type="text"
                          value={formData.policyNo || ''}
                          onChange={(e) => setFormData({ ...formData, policyNo: e.target.value })}
                          placeholder="e.g. POL-98471"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Insurance Expiry Date</label>
                        <input
                          type="date"
                          value={formData.insuranceExpDate || ''}
                          onChange={(e) => setFormData({ ...formData, insuranceExpDate: e.target.value })}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM FIELDS FOR BANK ACCOUNT */}
                {formMode.includes('BANK') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bankName || ''}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="e.g. Emirates NBD, ADCB, Wio Bank"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          value={formData.accountName || ''}
                          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          placeholder={currentCompany.legalName}
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={formData.accountNumber || ''}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="1029384756"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">IBAN</label>
                        <input
                          type="text"
                          value={formData.iban || ''}
                          onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                          placeholder="AE070330000000000000000"
                          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Document Upload Reference */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Upload Supporting Document (Passport Copy / Visa / Mulkiya / Certificate)
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Passport Copy - Rahul Sharma.pdf"
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Special Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Any specific requests for the PRO advisor..."
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{submitting ? 'Submitting Request...' : 'Submit for Admin Approval'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
