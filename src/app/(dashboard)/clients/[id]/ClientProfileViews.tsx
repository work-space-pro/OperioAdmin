'use client'

import { formatDate } from '@/lib/formatDate'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, CreditCard, Users, FileText, 
  Briefcase, Edit2, UserSquare2, ArrowRight, UploadCloud, 
  CalendarDays, BadgeAlert, Activity as ActivityIcon, CheckCircle2, Download, 
  Trash2, Calendar, Phone, Mail, Flag, MoreVertical, MessageSquare, Save,
  Plus, CheckSquare, Square, Archive, RefreshCw, Landmark, Copy, Check, ShieldCheck, ChevronDown, ChevronRight
} from 'lucide-react'
import { 
  addDocumentToClient, 
  addServiceToClient, 
  updateClientNotes,
  archiveClient,
  restoreClient,
  toggleClientActionStatus,
  addBankAccountToClient,
  deleteBankAccount
} from '../actions'
import CompanyDetailsCard from './CompanyDetailsCard'
import DeleteClientButton from './DeleteClientButton'
import CreateActionModal from '@/components/dashboard/CreateActionModal'
import RenewalDetailModal from '@/components/renewals/RenewalDetailModal'
import { cn } from '@/lib/utils'
import { SERVICE_CATEGORIES, SERVICE_PACKAGES_BY_CATEGORY, ServiceCategoryType } from '@/lib/servicePackages'
import PortalAccessTab from './PortalAccessTab'

type ClientData = any 

export default function ClientProfileViews({ client }: { client: ClientData }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [isSubmittingService, setIsSubmittingService] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false)
  const [closedClientActionsOpen, setClosedClientActionsOpen] = useState(false)
  
  // Service Package state
  const [serviceCategory, setServiceCategory] = useState<ServiceCategoryType>('Business Setup')
  const [servicePackage, setServicePackage] = useState<string>(SERVICE_PACKAGES_BY_CATEGORY['Business Setup'][0])
  const [isCustomService, setIsCustomService] = useState(false)
  const [customServiceName, setCustomServiceName] = useState('')

  // Bank Account Modal state
  const [showAddBank, setShowAddBank] = useState(false)
  const [isSubmittingBank, setIsSubmittingBank] = useState(false)

  // Copy Feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    if (!text || text === 'N/A') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => {
      setCopiedField(null)
    }, 1800)
  }

  const [notes, setNotes] = useState(client.notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const isArchived = client.status === 'Archived'

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    const res = await updateClientNotes(client.id, notes)
    if (!res.success) {
      alert(res.error || 'Failed to update notes')
    }
    setIsSavingNotes(false)
  }

  const handleToggleArchive = async () => {
    if (isArchived) {
      if (window.confirm('Restore this client to active status?')) {
        setIsArchiving(true)
        await restoreClient(client.id)
        setIsArchiving(false)
      }
    } else {
      if (window.confirm('Are you sure you want to archive this client? They will be hidden from the default client list.')) {
        setIsArchiving(true)
        await archiveClient(client.id)
        setIsArchiving(false)
      }
    }
  }

  const handleToggleAction = async (actionId: string, currentStatus: string) => {
    await toggleClientActionStatus(actionId, currentStatus, client.id)
  }

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingService(true)
    const formData = new FormData(e.currentTarget)
    
    const finalName = isCustomService ? customServiceName : (formData.get('name') as string || servicePackage)

    const data = {
      name: finalName,
      category: serviceCategory,
      companyId: (formData.get('companyId') as string) || null,
      status: (formData.get('status') as string) || 'In Progress',
      paymentStatus: (formData.get('paymentStatus') as string) || 'Unpaid',
      price: formData.get('price'),
      startDate: formData.get('startDate'),
      targetCompletion: formData.get('targetCompletion'),
      notes: formData.get('notes'),
    }

    const res = await addServiceToClient(client.id, data)
    if (res.success) {
      setShowAddService(false)
      setIsCustomService(false)
      setCustomServiceName('')
    } else {
      alert(res.error || 'Failed to add service')
    }
    setIsSubmittingService(false)
  }

  const handleAddDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      title: formData.get('title'),
      documentType: formData.get('documentType'),
      issueDate: formData.get('issueDate'),
      expiryDate: formData.get('expiryDate'),
      fileUrl: '/mock-upload.pdf' 
    }

    const res = await addDocumentToClient(client.id, data)
    if (res.success) {
      setShowAddDoc(false)
    } else {
      alert(res.error || 'Failed to add document')
    }
    setIsSubmitting(false)
  }

  const handleAddBankAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingBank(true)
    const formData = new FormData(e.currentTarget)

    const data = {
      bankName: formData.get('bankName') as string,
      accountName: formData.get('accountName') as string,
      accountNumber: formData.get('accountNumber') as string,
      iban: formData.get('iban') as string,
      swiftCode: formData.get('swiftCode') as string,
      currency: (formData.get('currency') as string) || 'AED',
      branch: formData.get('branch') as string,
      companyId: (formData.get('companyId') as string) || undefined,
    }

    const res = await addBankAccountToClient(client.id, data)
    if (res.success) {
      setShowAddBank(false)
    } else {
      alert(res.error || 'Failed to add bank account')
    }
    setIsSubmittingBank(false)
  }

  const handleDeleteBank = async (bankId: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      await deleteBankAccount(bankId, client.id)
    }
  }

  const companies = client.companies || []
  
  // Aggregate services from both client level and all company levels
  const clientDirectServices = client.services || []
  const companyServices = companies.flatMap((c: any) => (c.services || []).map((s: any) => ({
    ...s,
    companyName: c.legalName
  })))
  const servicesMap = new Map()
  clientDirectServices.forEach((s: any) => servicesMap.set(s.id, s))
  companyServices.forEach((s: any) => {
    if (!servicesMap.has(s.id)) {
      servicesMap.set(s.id, s)
    } else {
      const existing = servicesMap.get(s.id)
      if (!existing.companyName && s.companyName) {
        servicesMap.set(s.id, { ...existing, companyName: s.companyName })
      }
    }
  })
  const services = Array.from(servicesMap.values())

  // Aggregate documents similarly
  const clientDirectDocs = client.documents || []
  const companyDocs = companies.flatMap((c: any) => (c.documents || []).map((d: any) => ({
    ...d,
    companyName: c.legalName
  })))
  const docsMap = new Map()
  clientDirectDocs.forEach((d: any) => docsMap.set(d.id, d))
  companyDocs.forEach((d: any) => {
    if (!docsMap.has(d.id)) {
      docsMap.set(d.id, d)
    } else {
      const existing = docsMap.get(d.id)
      if (!existing.companyName && d.companyName) {
        docsMap.set(d.id, { ...existing, companyName: d.companyName })
      }
    }
  })
  const documents = Array.from(docsMap.values())

  const actions = client.actions || []
  
  // Aggregate bank accounts across client and companies
  const clientDirectBanks = client.bankAccounts || []
  const companyBanks = companies.flatMap((c: any) => (c.bankAccounts || []).map((b: any) => ({
    ...b,
    companyName: c.legalName
  })))
  const bankMap = new Map()
  clientDirectBanks.forEach((b: any) => bankMap.set(b.id, b))
  companyBanks.forEach((b: any) => {
    if (!bankMap.has(b.id)) {
      bankMap.set(b.id, b)
    }
  })
  const bankAccounts = Array.from(bankMap.values())

  // UNIFIED RENEWALS AGGREGATOR ACROSS ALL ENTITIES
  const allRenewals: any[] = []
  const now = new Date()

  const safeToISO = (d: any) => {
    if (!d) return ''
    if (typeof d === 'string') return d
    try {
      return new Date(d).toISOString()
    } catch {
      return String(d)
    }
  }

  // 0. Owner / Client Expiries (Passport, Emirates ID, Visa, Health Insurance)
  if (client.passportExpiryDate) {
    const days = (new Date(client.passportExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    allRenewals.push({
      id: `client-pass-${client.id}`,
      entityType: 'Client',
      entityId: client.id,
      field: 'passportExpiryDate',
      numberField: 'passportNumber',
      identifier: client.passportNumber || '—',
      title: `Owner Passport (${client.fullName})`,
      category: 'Passport',
      entityName: `${client.fullName} (Owner)`,
      clientName: client.fullName,
      clientId: client.id,
      expiryDate: safeToISO(client.passportExpiryDate),
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  if (client.eidExpiryDate) {
    const days = (new Date(client.eidExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    allRenewals.push({
      id: `client-eid-${client.id}`,
      entityType: 'Client',
      entityId: client.id,
      field: 'eidExpiryDate',
      numberField: 'emiratesIdNumber',
      identifier: client.emiratesIdNumber || '—',
      title: `Owner Emirates ID (${client.fullName})`,
      category: 'Emirates ID',
      entityName: `${client.fullName} (Owner)`,
      clientName: client.fullName,
      clientId: client.id,
      expiryDate: safeToISO(client.eidExpiryDate),
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  if (client.visaExpiryDate) {
    const days = (new Date(client.visaExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    allRenewals.push({
      id: `client-visa-${client.id}`,
      entityType: 'Client',
      entityId: client.id,
      field: 'visaExpiryDate',
      numberField: 'visaNumber',
      identifier: client.visaNumber || '—',
      title: `Owner Visa / Residency (${client.fullName})`,
      category: 'Visa',
      entityName: `${client.fullName} (Owner)`,
      clientName: client.fullName,
      clientId: client.id,
      expiryDate: safeToISO(client.visaExpiryDate),
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  if (client.healthInsExpiryDate) {
    const days = (new Date(client.healthInsExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
    allRenewals.push({
      id: `client-ins-${client.id}`,
      entityType: 'Client',
      entityId: client.id,
      field: 'healthInsExpiryDate',
      numberField: 'healthInsNumber',
      identifier: client.healthInsNumber || '—',
      title: `Owner Health Insurance (${client.fullName})`,
      category: 'Insurance',
      entityName: `${client.fullName} (Owner)`,
      clientName: client.fullName,
      clientId: client.id,
      expiryDate: safeToISO(client.healthInsExpiryDate),
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  // A. Company Expiries (Trade Licences, Est Cards)
  companies.forEach((comp: any) => {
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
        clientName: client.fullName,
        clientId: client.id,
        companyId: comp.id,
        companyName: comp.legalName,
        expiryDate: safeToISO(comp.licenceExpiryDate),
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
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
        clientName: client.fullName,
        clientId: client.id,
        companyId: comp.id,
        companyName: comp.legalName,
        expiryDate: safeToISO(comp.estCardExpiryDate),
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      });
    }

    // B. Employee / Member Expiries (E-Visa, Emirates ID, Passport, Health Insurance)
    const empList = Array.isArray(comp.employees) ? comp.employees : [];
    empList.forEach((emp: any) => {
      if (emp.eVisaExpiryDate) {
        const days = (new Date(emp.eVisaExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        allRenewals.push({
          id: `emp-visa-${emp.id}`,
          entityType: 'Employee',
          entityId: emp.id,
          field: 'eVisaExpiryDate',
          numberField: 'visaNumber',
          identifier: emp.visaNumber || '—',
          title: `E-Visa (${emp.fullName})`,
          category: 'E-Visa',
          entityName: `${emp.fullName} • ${comp.legalName}`,
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(emp.eVisaExpiryDate),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
      if (emp.eidExpiryDate) {
        const days = (new Date(emp.eidExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
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
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(emp.eidExpiryDate),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
      if (emp.passportExpiry) {
        const days = (new Date(emp.passportExpiry).getTime() - now.getTime()) / (1000 * 3600 * 24);
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
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(emp.passportExpiry),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
      if (emp.healthInsExpiry) {
        const days = (new Date(emp.healthInsExpiry).getTime() - now.getTime()) / (1000 * 3600 * 24);
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
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(emp.healthInsExpiry),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
    });

    // C. Vehicle Expiries (Registration Mulkiya, Insurance)
    const vehList = Array.isArray(comp.vehicles) ? comp.vehicles : [];
    vehList.forEach((veh: any) => {
      if (veh.expDate) {
        const days = (new Date(veh.expDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        allRenewals.push({
          id: `veh-reg-${veh.id}`,
          entityType: 'Vehicle',
          entityId: veh.id,
          field: 'expDate',
          numberField: 'regNo',
          identifier: veh.regNo || '—',
          title: `Vehicle Registration (${veh.regNo})`,
          category: 'Vehicle Registration',
          entityName: `Plate ${veh.regNo} • ${comp.legalName}`,
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(veh.expDate),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
      if (veh.insuranceExpDate) {
        const days = (new Date(veh.insuranceExpDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
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
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(veh.insuranceExpDate),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
    });

    // D. Driver Expiries (Driving Licence)
    const drvList = Array.isArray(comp.drivers) ? comp.drivers : [];
    drvList.forEach((drv: any) => {
      if (drv.licenseExpDate) {
        const days = (new Date(drv.licenseExpDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        allRenewals.push({
          id: `drv-lic-${drv.id}`,
          entityType: 'Driver',
          entityId: drv.id,
          field: 'licenseExpDate',
          numberField: 'fullName',
          identifier: drv.fullName || '—',
          title: `Driving Licence (${drv.fullName})`,
          category: 'Driving Licence',
          entityName: `${drv.fullName} • ${comp.legalName}`,
          clientName: client.fullName,
          clientId: client.id,
          companyId: comp.id,
          companyName: comp.legalName,
          expiryDate: safeToISO(drv.licenseExpDate),
          daysUntil: Math.ceil(days),
          isExpired: days < 0,
          isExpiringSoon: days >= 0 && days <= 60
        });
      }
    });
  });

  // E. Documents Expiries
  documents.forEach((doc: any) => {
    if (doc.expiryDate) {
      const days = (new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
      allRenewals.push({
        id: `doc-${doc.id}`,
        entityType: 'Document',
        entityId: doc.id,
        field: 'expiryDate',
        numberField: 'title',
        identifier: doc.title || '—',
        title: doc.title,
        category: doc.documentType || 'Document',
        entityName: doc.companyName || client.fullName,
        clientName: client.fullName,
        clientId: client.id,
        expiryDate: safeToISO(doc.expiryDate),
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
  })

  // Sort renewals: earliest expiry date first
  allRenewals.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  // Overview metrics
  const activeServices = services.filter((s: any) => s.status === 'Active' || s.status === 'In Progress').length
  const pendingActions = actions.filter((a: any) => a.status !== 'Completed').length
  const upcomingRenewalsCount = allRenewals.filter(r => r.isExpired || r.isExpiringSoon).length

  const nameParts = client.fullName.split(' ')
  const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}` : nameParts[0].substring(0, 2).toUpperCase()
  const displayTags = client.tags ? client.tags.split(',') : []

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start animate-fade-in-up delay-0">
      
      {/* LEFT SIDEBAR - PROFILE SNAPSHOT */}
      <div className="w-full lg:w-[310px] shrink-0 dash-panel bg-white rounded-3xl p-6 sticky top-6 border border-[#EAE5F2]">
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] shadow-xs flex items-center justify-center text-white text-2xl font-bold mb-3.5">
            {initials}
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight mb-2">{client.fullName}</h1>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
              client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              client.status === 'Prospect' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
              client.status === 'Archived' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-slate-50 text-slate-700 border-slate-200'
            )}>
              {client.status}
            </span>
            
            {/* Client ID with Copy */}
            <button
              type="button"
              onClick={() => handleCopy(`CLT-${client.id.substring(0,6).toUpperCase()}`, 'clientId')}
              className="bg-slate-50 hover:bg-[#EDE9FE] text-slate-500 hover:text-[#5B21B6] border border-slate-200 hover:border-[#DDD6FE] px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Click to copy Client ID"
            >
              <span>ID: CLT-{client.id.substring(0,6).toUpperCase()}</span>
              {copiedField === 'clientId' ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 opacity-60 shrink-0" />
              )}
            </button>
          </div>

          <p className="text-[11px] font-semibold text-slate-400 mt-2.5">
            Client Since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Contact Info List with Copy Actions */}
        <div className="py-5 space-y-4 border-b border-slate-100">
          
          {/* Mobile Phone */}
          <div className="flex items-center justify-between group">
            <div className="flex items-start min-w-0">
              <Phone className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile Phone</p>
                <p className="text-xs font-bold text-slate-800">{client.mobileNumber || 'N/A'}</p>
              </div>
            </div>
            {client.mobileNumber && (
              <button
                type="button"
                onClick={() => handleCopy(client.mobileNumber, 'mobile')}
                className="p-1.5 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded-lg transition-all ml-2 shrink-0 cursor-pointer"
                title="Copy Mobile Number"
              >
                {copiedField === 'mobile' ? (
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* WhatsApp */}
          {client.whatsappNumber && (
            <div className="flex items-center justify-between group">
              <div className="flex items-start min-w-0">
                <MessageSquare className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">WhatsApp</p>
                  <a 
                    href={`https://wa.me/${client.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {client.whatsappNumber}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(client.whatsappNumber, 'whatsapp')}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all ml-2 shrink-0 cursor-pointer"
                title="Copy WhatsApp Number"
              >
                {copiedField === 'whatsapp' ? (
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center justify-between group">
            <div className="flex items-start min-w-0">
              <Mail className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-xs font-bold text-slate-800 break-all">{client.email || 'N/A'}</p>
              </div>
            </div>
            {client.email && (
              <button
                type="button"
                onClick={() => handleCopy(client.email, 'email')}
                className="p-1.5 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded-lg transition-all ml-2 shrink-0 cursor-pointer"
                title="Copy Email Address"
              >
                {copiedField === 'email' ? (
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Nationality */}
          <div className="flex items-start">
            <Flag className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nationality</p>
              <p className="text-xs font-bold text-slate-800">{client.nationality || 'N/A'}</p>
            </div>
          </div>

          {/* Emirates ID */}
          {client.emiratesIdNumber && (
            <div className="flex items-center justify-between group">
              <div className="flex items-start min-w-0">
                <CreditCard className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Emirates ID</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">{client.emiratesIdNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(client.emiratesIdNumber, 'eid')}
                className="p-1.5 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded-lg transition-all ml-2 shrink-0 cursor-pointer"
                title="Copy Emirates ID"
              >
                {copiedField === 'eid' ? (
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Passport */}
          {client.passportNumber && (
            <div className="flex items-center justify-between group">
              <div className="flex items-start min-w-0">
                <FileText className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Passport</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">{client.passportNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(client.passportNumber, 'passport')}
                className="p-1.5 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded-lg transition-all ml-2 shrink-0 cursor-pointer"
                title="Copy Passport Number"
              >
                {copiedField === 'passport' ? (
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {displayTags.length > 0 && (
            <div className="flex items-start">
              <MoreVertical className="w-4 h-4 text-slate-400 mr-3 mt-0.5 shrink-0" />
              <div className="text-left w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {displayTags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-[#F3E8FF] text-[#5B21B6] rounded-md text-[10px] font-bold border border-[#DDD6FE]">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Action Buttons */}
        <div className="pt-5 flex flex-col space-y-2.5">
          <Link 
            href={`/clients/${client.id}/edit`} 
            className="w-full flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Profile
          </Link>

          <button
            onClick={handleToggleArchive}
            disabled={isArchiving}
            className={cn(
              "w-full flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-colors border",
              isArchived 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            )}
          >
            {isArchived ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Restore Client
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 mr-2" />
                Archive Client
              </>
            )}
          </button>

          <div className="w-full">
            <DeleteClientButton clientId={client.id} clientName={client.fullName} />
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 w-full min-w-0">
        
        {/* Modern Compact Tabs Bar */}
        <div className="dash-panel bg-white p-1 rounded-2xl overflow-x-auto max-w-full mb-5 flex space-x-1 border border-[#EAE5F2] no-scrollbar scroll-smooth">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Companies', label: 'Companies', count: companies.length },
            { id: 'Actions', label: 'Tasks & Actions', count: actions.length },
            { id: 'Services', label: 'Services', count: services.length },
            { id: 'Documents', label: 'Documents', count: documents.length },
            { id: 'Renewals', label: 'Renewals', count: allRenewals.length },
            { id: 'BankAccounts', label: 'Bank Accounts', count: bankAccounts.length },
            { id: 'PortalAccess', label: 'Portal Access' },
            { id: 'Notes', label: 'Notes' },
            { id: 'Activity', label: 'Activity' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold flex items-center whitespace-nowrap rounded-xl transition-all cursor-pointer",
                activeTab === tab.id 
                  ? "bg-[#4C1D95] text-white shadow-xs" 
                  : "text-slate-600 hover:text-[#5B21B6] hover:bg-[#F5F3FF]"
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' && (
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#EDE9FE] text-[#5B21B6]"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="dash-card bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Companies')}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Companies</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{companies.length}</p>
                  <div className="text-[11px] font-semibold text-blue-600 flex items-center mt-2">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>

                <div className="dash-card bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Actions')}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Tasks</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pendingActions}</p>
                  <div className="text-[11px] font-semibold text-purple-600 flex items-center mt-2">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>

                <div className="dash-card bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Services')}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Services</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeServices}</p>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center mt-2">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>

                <div className="dash-card bg-white rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Renewals')}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Due Soon</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{upcomingRenewalsCount}</p>
                  <div className="text-[11px] font-semibold text-red-600 flex items-center mt-2">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>

              {/* Identity & Compliance Details Card */}
              <div className="dash-panel bg-white rounded-2xl p-6 border border-[#EAE5F2]">
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <UserSquare2 className="w-4 h-4 text-[#5B21B6] mr-2" />
                    Client Information &amp; Identity
                  </h3>
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className="text-[11px] font-bold text-[#5B21B6] hover:text-[#4C1D95] flex items-center hover:underline"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit Details
                  </Link>
                </div>
                
                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-6">
                  <div>
                    <span className="text-slate-400 font-medium block">Full Legal Name</span>
                    <p className="font-bold text-slate-800 mt-0.5">{client.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Client Type</span>
                    <p className="font-bold text-slate-800 mt-0.5">{client.clientType || 'Individual'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Nationality</span>
                    <p className="font-bold text-slate-800 mt-0.5">{client.nationality || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Gender</span>
                    <p className="font-bold text-slate-800 mt-0.5">{client.gender || 'Not specified'}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <span className="text-slate-400 font-medium block">Physical Address</span>
                    <p className="font-bold text-slate-800 mt-0.5">{client.address || 'No registered address'}</p>
                  </div>
                </div>

                {/* 4 Compliance & Identity Cards (Emirates ID, Passport, Visa, Health Insurance) */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-extrabold text-[#701A75] uppercase tracking-wider mb-3">
                    Owner Identity Documents &amp; Compliance Radar
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Card 1: Emirates ID */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                            Emirates ID (EID)
                          </span>
                          {client.eidExpiryDate && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              new Date(client.eidExpiryDate).getTime() < new Date().getTime()
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : (new Date(client.eidExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 60
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {new Date(client.eidExpiryDate).getTime() < new Date().getTime()
                                ? 'Expired'
                                : `${Math.ceil((new Date(client.eidExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d remaining`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 mb-2.5">
                          <span>{client.emiratesIdNumber || 'Not registered'}</span>
                          {client.emiratesIdNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(client.emiratesIdNumber, 'eid')}
                              className="text-slate-400 hover:text-[#5B21B6] p-0.5"
                              title="Copy EID"
                            >
                              {copiedField === 'eid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Issue Date</span>
                          <span className="font-bold text-slate-700">{client.eidIssueDate ? formatDate(client.eidIssueDate) : '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Expiry Date</span>
                          <span className={`font-bold ${client.eidExpiryDate && new Date(client.eidExpiryDate).getTime() < new Date().getTime() ? 'text-red-600' : 'text-slate-800'}`}>
                            {client.eidExpiryDate ? formatDate(client.eidExpiryDate) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Passport */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center">
                            <FileText className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                            Passport
                          </span>
                          {client.passportExpiryDate && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              new Date(client.passportExpiryDate).getTime() < new Date().getTime()
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : (new Date(client.passportExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 60
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {new Date(client.passportExpiryDate).getTime() < new Date().getTime()
                                ? 'Expired'
                                : `${Math.ceil((new Date(client.passportExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d remaining`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 mb-2.5">
                          <span>{client.passportNumber || 'Not registered'}</span>
                          {client.passportNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(client.passportNumber, 'passport')}
                              className="text-slate-400 hover:text-[#5B21B6] p-0.5"
                              title="Copy Passport"
                            >
                              {copiedField === 'passport' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Issue Date</span>
                          <span className="font-bold text-slate-700">{client.passportIssueDate ? formatDate(client.passportIssueDate) : '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Expiry Date</span>
                          <span className={`font-bold ${client.passportExpiryDate && new Date(client.passportExpiryDate).getTime() < new Date().getTime() ? 'text-red-600' : 'text-slate-800'}`}>
                            {client.passportExpiryDate ? formatDate(client.passportExpiryDate) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Visa / Residency */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center">
                            <BadgeAlert className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                            Visa / Residency Permit
                          </span>
                          {client.visaExpiryDate && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              new Date(client.visaExpiryDate).getTime() < new Date().getTime()
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : (new Date(client.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 60
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {new Date(client.visaExpiryDate).getTime() < new Date().getTime()
                                ? 'Expired'
                                : `${Math.ceil((new Date(client.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d remaining`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 mb-2.5">
                          <span>{client.visaNumber || 'Not registered'}</span>
                          {client.visaNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(client.visaNumber, 'visa')}
                              className="text-slate-400 hover:text-[#5B21B6] p-0.5"
                              title="Copy Visa Number"
                            >
                              {copiedField === 'visa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Issue Date</span>
                          <span className="font-bold text-slate-700">{client.visaIssueDate ? formatDate(client.visaIssueDate) : '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Expiry Date</span>
                          <span className={`font-bold ${client.visaExpiryDate && new Date(client.visaExpiryDate).getTime() < new Date().getTime() ? 'text-red-600' : 'text-slate-800'}`}>
                            {client.visaExpiryDate ? formatDate(client.visaExpiryDate) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Health / Medical Insurance */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                            Health / Medical Insurance
                          </span>
                          {client.healthInsExpiryDate && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              new Date(client.healthInsExpiryDate).getTime() < new Date().getTime()
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : (new Date(client.healthInsExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 60
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {new Date(client.healthInsExpiryDate).getTime() < new Date().getTime()
                                ? 'Expired'
                                : `${Math.ceil((new Date(client.healthInsExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d remaining`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 mb-2.5">
                          <span>{client.healthInsNumber || 'Not registered'}</span>
                          {client.healthInsNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(client.healthInsNumber, 'insurance')}
                              className="text-slate-400 hover:text-[#5B21B6] p-0.5"
                              title="Copy Policy Number"
                            >
                              {copiedField === 'insurance' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Issue Date</span>
                          <span className="font-bold text-slate-700">{client.healthInsIssueDate ? formatDate(client.healthInsIssueDate) : '—'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium">Expiry Date</span>
                          <span className={`font-bold ${client.healthInsExpiryDate && new Date(client.healthInsExpiryDate).getTime() < new Date().getTime() ? 'text-red-600' : 'text-slate-800'}`}>
                            {client.healthInsExpiryDate ? formatDate(client.healthInsExpiryDate) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Activity Snapshot */}
            <div className="space-y-5">
              <div className="dash-panel bg-white rounded-2xl overflow-hidden flex flex-col h-[380px]">
                <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center">
                    <ActivityIcon className="w-3.5 h-3.5 text-blue-600 mr-2" />
                    Recent Activity
                  </h3>
                  <button onClick={() => setActiveTab('Activity')} className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>
                <div className="p-0 flex-1 overflow-y-auto">
                  {client.activityLogs && client.activityLogs.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {client.activityLogs.slice(0, 6).map((log: any) => (
                        <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-bold text-slate-800">{log.eventType}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{log.description}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                      <ActivityIcon className="w-6 h-6 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-500">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANIES */}
        {activeTab === 'Companies' && (
          <div className="space-y-5">
            {companies.map((company: any) => (
              <CompanyDetailsCard key={company.id} company={company} />
            ))}
            {companies.length === 0 && (
              <div className="dash-panel bg-white rounded-2xl p-12 text-center">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No connected companies</p>
                <p className="text-xs text-slate-500 mt-1">This client does not have any registered company profiles yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIONS & TASKS */}
        {activeTab === 'Actions' && (
          <div className="space-y-4">
            <div className="dash-panel bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
              <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
                  <Calendar className="w-4 h-4 text-[#5B21B6] mr-2" />
                  Active Open Tasks ({actions.filter((a: any) => a.status !== 'Completed').length})
                </h3>
                <button 
                  onClick={() => setIsActionModalOpen(true)}
                  className="inline-flex items-center px-3.5 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Action
                </button>
              </div>

              <div className="p-0">
                {actions.filter((a: any) => a.status !== 'Completed').length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">All client tasks are completed!</p>
                    <p className="text-slate-400 mt-0.5">Click "Add Action" to schedule new follow-ups or reminders.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {actions.filter((a: any) => a.status !== 'Completed').map((act: any) => (
                      <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <button 
                            onClick={() => handleToggleAction(act.id, act.status)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                            title="Mark Completed"
                          >
                            <Square className="w-5 h-5 text-slate-300" />
                          </button>
                          
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate text-slate-900">
                              {act.title}
                            </p>
                            {act.description && (
                              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{act.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 ml-4">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {formatDate(act.dueDate)} {act.dueTime && `at ${act.dueTime}`}
                          </span>

                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-md border",
                            act.priority === 'High' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            act.priority === 'Low' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-blue-50 text-blue-700 border-blue-200"
                          )}>
                            {act.priority || 'Normal'}
                          </span>

                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {act.actionType || 'Task'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Closed / Completed Tasks (Collapsible Accordion) */}
            {actions.filter((a: any) => a.status === 'Completed').length > 0 && (
              <div className="dash-panel bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setClosedClientActionsOpen(!closedClientActionsOpen)}
                  className="w-full px-5 py-3 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Closed / Completed Actions ({actions.filter((a: any) => a.status === 'Completed').length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <span>{closedClientActionsOpen ? 'Collapse' : 'Expand'}</span>
                    {closedClientActionsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {closedClientActionsOpen && (
                  <div className="divide-y divide-slate-100">
                    {actions.filter((a: any) => a.status === 'Completed').map((act: any) => (
                      <div key={act.id} className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <button 
                            onClick={() => handleToggleAction(act.id, act.status)}
                            className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0 cursor-pointer"
                            title="Reopen Task"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </button>
                          
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate text-slate-400 line-through">
                              {act.title}
                            </p>
                            {act.description && (
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{act.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 ml-4">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {formatDate(act.dueDate)}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-500">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DOCUMENTS */}
        {activeTab === 'Documents' && (
          <div className="dash-panel bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FileText className="w-4 h-4 text-blue-600 mr-2" />
                Client Documents
              </h3>
              <button 
                onClick={() => setShowAddDoc(!showAddDoc)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                {showAddDoc ? 'Cancel' : '+ Add Document'}
              </button>
            </div>
            
            {showAddDoc && (
              <form onSubmit={handleAddDocument} className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Document Title</label>
                    <input required name="title" type="text" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500" placeholder="e.g. Passport Copy" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Document Type</label>
                    <select required name="documentType" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500">
                      <option value="Passport">Passport</option>
                      <option value="Visa">Visa</option>
                      <option value="Emirates ID">Emirates ID</option>
                      <option value="Trade License">Trade License</option>
                      <option value="Contract">Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Issue Date</label>
                    <input name="issueDate" type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Expiry Date</label>
                    <input name="expiryDate" type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button disabled={isSubmitting} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Document'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3.5">Document Name</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Issue Date</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                         <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                         <p className="text-xs font-bold text-slate-500">No documents uploaded yet.</p>
                      </td>
                    </tr>
                  ) : documents.map((doc: any) => {
                    const isExpiringSoon = doc.expiryDate && (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 30
                    const isExpired = doc.expiryDate && (new Date(doc.expiryDate).getTime() < new Date().getTime())
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-blue-600 mr-2.5 shrink-0" />
                            <span className="font-bold text-slate-900">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md text-slate-600 bg-slate-100">
                            {doc.documentType}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {doc.issueDate ? formatDate(doc.issueDate) : '—'}
                        </td>
                        <td className="px-6 py-3.5 font-bold">
                          <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-slate-800'}>
                            {doc.expiryDate ? formatDate(doc.expiryDate) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                           <span className={cn(
                             "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                             isExpired ? 'bg-red-50 text-red-700 border-red-200' :
                             isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                             'bg-emerald-50 text-emerald-700 border-emerald-200'
                           )}>
                             {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                           </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SERVICES & PACKAGES */}
        {activeTab === 'Services' && (
          <div className="space-y-5">
            <div className="dash-panel bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 shadow-xs">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#5B21B6]" />
                  Client Services &amp; Operational Packages
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Assigned business setup, visas, accounting, PRO, and legal packages for this client.
                </p>
              </div>
              <button 
                onClick={() => setShowAddService(!showAddService)}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                {showAddService ? '✕ Close Form' : '+ Add Package / Service'}
              </button>
            </div>
            
            {showAddService && (
              <form onSubmit={handleAddService} className="dash-panel bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider">
                    Add New Service Package
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Manual price entry enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Category *
                    </label>
                    <select 
                      required 
                      value={serviceCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ServiceCategoryType
                        setServiceCategory(cat)
                        setServicePackage(SERVICE_PACKAGES_BY_CATEGORY[cat][0])
                        setIsCustomService(false)
                      }}
                      className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 text-[#4C1D95] rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer"
                    >
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Package Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Package / Service Template *
                    </label>
                    <select 
                      value={isCustomService ? '__CUSTOM__' : servicePackage}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomService(true)
                        } else {
                          setIsCustomService(false)
                          setServicePackage(e.target.value)
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer"
                    >
                      {SERVICE_PACKAGES_BY_CATEGORY[serviceCategory]?.map(pkg => (
                        <option key={pkg} value={pkg}>{pkg}</option>
                      ))}
                      <option value="__CUSTOM__">✍️ Custom Package Name...</option>
                    </select>
                  </div>

                  {/* Final Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Final Service / Package Name *
                    </label>
                    <input 
                      required 
                      name="name" 
                      type="text" 
                      value={isCustomService ? customServiceName : servicePackage}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                      placeholder="e.g. Mainland LLC Formation Package" 
                    />
                  </div>

                  {/* Link to Client Company if available */}
                  {client.companies && client.companies.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Link to Company (Optional)
                      </label>
                      <select 
                        name="companyId" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                      >
                        <option value="">None (Link directly to client)</option>
                        {client.companies.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.legalName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Manual Price */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Agreed Package Price (AED)
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs font-bold text-slate-500">AED</span>
                      </div>
                      <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                        placeholder="0.00 (Enter price)" 
                      />
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Operational Status
                    </label>
                    <select 
                      name="status" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                      defaultValue="In Progress"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Payment Status
                    </label>
                    <select 
                      name="paymentStatus" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                      defaultValue="Unpaid"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  {/* Target Completion */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Target Completion Date
                    </label>
                    <input 
                      name="targetCompletion" 
                      type="date" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B21B6] focus:bg-white cursor-pointer" 
                    />
                  </div>

                  {/* Scope / Notes */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Scope / Package Deliverables Notes
                    </label>
                    <textarea 
                      name="notes" 
                      rows={2} 
                      placeholder="Add any specific deliverables, payment terms, or requirements for this package..." 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#5B21B6] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowAddService(false)} 
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmittingService} 
                    type="submit" 
                    className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmittingService ? 'Saving Package...' : 'Save Package'}
                  </button>
                </div>
              </form>
            )}
            
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc: any) => {
                  const getBadge = (cat: string) => {
                    if (cat === 'Business Setup') return 'bg-purple-50 text-[#5B21B6] border-purple-200'
                    if (cat === 'Visa & Immigration') return 'bg-blue-50 text-blue-700 border-blue-200'
                    if (cat === 'Tax & Accounting') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    if (cat === 'PRO Services') return 'bg-amber-50 text-amber-700 border-amber-200'
                    if (cat === 'Legal & Advisory') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    return 'bg-slate-100 text-slate-700 border-slate-200'
                  }

                  return (
                    <div key={svc.id} className="dash-card bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold shrink-0 mt-0.5">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-snug">{svc.name}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                getBadge(svc.category)
                              )}>
                                {svc.category}
                              </span>
                              {svc.companyName && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                  {svc.companyName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                          svc.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          svc.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          svc.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        )}>
                          {svc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs mt-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Date</p>
                          <p className="font-bold text-slate-700 mt-0.5">{svc.targetCompletion ? formatDate(svc.targetCompletion) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Agreed Price &amp; Status</p>
                          <p className="font-extrabold text-slate-900 mt-0.5">
                            {svc.price ? `${Number(svc.price).toLocaleString()} AED` : 'Manual Price Unset'} 
                            <span className={cn(
                              "text-[10px] font-bold ml-1.5 px-1.5 py-0.5 rounded border",
                              svc.paymentStatus === 'Paid' ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200' :
                              svc.paymentStatus === 'Partial' ? 'bg-amber-100/60 text-amber-800 border-amber-200' :
                              'bg-slate-200/60 text-slate-700 border-slate-300'
                            )}>
                              {svc.paymentStatus}
                            </span>
                          </p>
                        </div>
                      </div>

                      {svc.notes && (
                        <p className="text-xs text-slate-500 font-medium mt-2.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          {svc.notes}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="dash-panel bg-white rounded-2xl p-12 text-center border border-slate-100">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No services or packages assigned yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click "+ Add Package / Service" above to assign packages to this client.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: RENEWALS */}
        {activeTab === 'Renewals' && (
          <div className="space-y-4">
            {allRenewals.length > 0 ? (
              <div className="dash-panel bg-white rounded-2xl overflow-hidden border border-[#EAE5F2]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="table-header-tint border-b border-[#EAE5F2]">
                      <tr>
                        <th className="px-5 py-3">Item / Licence / Document</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Entity / Holder</th>
                        <th className="px-5 py-3">Expiry Date</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {allRenewals.map((item) => {
                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => {
                              setSelectedRenewal(item)
                              setIsRenewalModalOpen(true)
                            }}
                            className="hover:bg-[#FAF9FC] transition-colors cursor-pointer group"
                          >
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors">{item.title}</span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={cn(
                                "px-2 py-0.5 text-[10px] font-bold rounded-md border",
                                item.category === 'Trade Licence' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                item.category === 'Establishment Card' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                item.category === 'E-Visa' || item.category === 'Visa' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                item.category === 'Emirates ID' ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                                item.category === 'Vehicle Registration' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                item.category === 'Vehicle Insurance' || item.category === 'Insurance' || item.category === 'Health Insurance' ? "bg-teal-50 text-teal-700 border-teal-200" :
                                item.category === 'Passport' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                {item.category}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 font-medium">
                              {item.entityName}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center text-xs font-bold">
                                <span className={item.isExpired ? 'text-red-600' : item.isExpiringSoon ? 'text-orange-600' : 'text-slate-800'}>
                                  {formatDate(item.expiryDate)}
                                </span>
                                {item.isExpired && (
                                  <span className="ml-2 text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                                    EXPIRED
                                  </span>
                                )}
                                {!item.isExpired && item.isExpiringSoon && (
                                  <span className="ml-2 text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded">
                                    IN {item.daysUntil} DAYS
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={cn(
                                "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                                item.isExpired ? 'bg-red-50 text-red-700 border-red-200' :
                                item.isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              )}>
                                {item.isExpired ? 'Action Required' : item.isExpiringSoon ? 'Due Soon' : 'Valid'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setSelectedRenewal(item)
                                  setIsRenewalModalOpen(true)
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE] rounded-lg transition-all"
                              >
                                View &amp; Update
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="dash-panel bg-white rounded-2xl p-12 text-center border border-[#EAE5F2]">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No expiring items found for this client.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: BANK ACCOUNTS */}
        {activeTab === 'BankAccounts' && (
          <div className="space-y-4">
            
            {/* Header & Add Button */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#EAE5F2] shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Landmark className="w-4 h-4 text-[#5B21B6] mr-2" />
                  Corporate &amp; Personal Bank Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage banking records, IBANs, and settlement details.</p>
              </div>

              <button
                onClick={() => setShowAddBank(true)}
                className="px-3.5 py-1.5 bg-[#4C1D95] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Bank Account
              </button>
            </div>

            {bankAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map((acc: any) => (
                  <div key={acc.id} className="dash-card bg-white rounded-2xl p-5 border border-[#EAE5F2] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{acc.bankName}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {acc.companyName || acc.accountName || 'Primary Account'}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBank(acc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Bank Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        
                        {/* Account Number */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Account No:</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 font-mono">{acc.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.accountNumber, `acc-${acc.id}`)}
                              className="p-1 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded transition-all cursor-pointer"
                              title="Copy Account Number"
                            >
                              {copiedField === `acc-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* IBAN */}
                        {acc.iban && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">IBAN:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 font-mono text-[11px] break-all">{acc.iban}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(acc.iban, `iban-${acc.id}`)}
                                className="p-1 text-slate-400 hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded transition-all cursor-pointer"
                                title="Copy IBAN"
                              >
                                {copiedField === `iban-${acc.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Swift */}
                        {acc.swiftCode && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Swift / BIC:</span>
                            <span className="font-bold text-slate-800 font-mono">{acc.swiftCode}</span>
                          </div>
                        )}

                        {/* Branch */}
                        {acc.branch && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Branch:</span>
                            <span className="font-bold text-slate-800">{acc.branch}</span>
                          </div>
                        )}

                        {/* Currency */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Currency:</span>
                          <span className="font-bold text-slate-900">{acc.currency || 'AED'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-panel bg-white rounded-2xl p-12 text-center border border-[#EAE5F2]">
                <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No bank accounts added</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Add corporate or individual bank accounts directly to this client.</p>
                <button
                  onClick={() => setShowAddBank(true)}
                  className="px-4 py-2 bg-[#4C1D95] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Bank Account Now
                </button>
              </div>
            )}

            {/* ADD BANK ACCOUNT MODAL */}
            {showAddBank && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Add Bank Account</h3>
                        <p className="text-xs text-slate-400">Save banking credentials &amp; IBAN for {client.fullName}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowAddBank(false)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddBankAccount} className="space-y-4">
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        name="bankName" 
                        required 
                        placeholder="e.g. Emirates NBD, ADCB, FAB, Mashreq, DIB"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Account Holder / Name
                        </label>
                        <input 
                          name="accountName" 
                          defaultValue={client.fullName}
                          placeholder="e.g. Company Legal Name or Client Name"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Account Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="accountNumber" 
                          required 
                          placeholder="e.g. 1012345678901"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        IBAN Number (UAE)
                      </label>
                      <input 
                        name="iban" 
                        placeholder="e.g. AE240330000000000000000"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Currency
                        </label>
                        <select 
                          name="currency" 
                          defaultValue="AED"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#5B21B6] focus:outline-none bg-white"
                        >
                          <option value="AED">AED (Dirham)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="SAR">SAR (Riyal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Swift / BIC
                        </label>
                        <input 
                          name="swiftCode" 
                          placeholder="e.g. EBILAEAD"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Branch Name
                        </label>
                        <input 
                          name="branch" 
                          placeholder="e.g. Dubai Main"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#5B21B6] focus:outline-none"
                        />
                      </div>
                    </div>

                    {companies.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Associated Entity / Company
                        </label>
                        <select 
                          name="companyId" 
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#5B21B6] focus:outline-none bg-white"
                        >
                          <option value="">Personal / Individual Client Account</option>
                          {companies.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.legalName} ({c.tradeLicenceNumber || 'Company'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddBank(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingBank}
                        className="px-5 py-2 bg-[#4C1D95] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingBank ? 'Saving...' : 'Save Bank Account'}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 8: NOTES */}
        {activeTab === 'Notes' && (
          <div className="dash-panel bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                Client Notes &amp; Special Context
              </h3>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, client preferences, or key background details..."
                className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 8: PORTAL ACCESS */}
        {activeTab === 'PortalAccess' && (
          <PortalAccessTab client={client} />
        )}

        {/* TAB 9: ACTIVITY */}
        {activeTab === 'Activity' && (
          <div className="dash-panel bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <ActivityIcon className="w-4 h-4 text-blue-600 mr-2" />
                Activity Log &amp; Audit Trail
              </h3>
            </div>
            <div className="p-0">
              {client.activityLogs && client.activityLogs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {client.activityLogs.map((log: any) => (
                    <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mr-3.5 mt-0.5">
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900">{log.eventType}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{log.description}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">
                          {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <ActivityIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">No activity recorded for this client yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Action Creation Modal */}
      <CreateActionModal 
        isOpen={isActionModalOpen} 
        onClose={() => setIsActionModalOpen(false)} 
        clients={[{ id: client.id, fullName: client.fullName }]}
        defaultClientId={client.id}
      />

      {/* Renewal Detail Modal */}
      <RenewalDetailModal 
        item={selectedRenewal}
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
      />

    </div>
  )
}
