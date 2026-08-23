'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  FileText, 
  Users, 
  Car, 
  Briefcase, 
  CreditCard, 
  CalendarDays, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Plus
} from 'lucide-react'
import { formatDate } from '@/lib/formatDate'
import RenewalDetailModal from '@/components/renewals/RenewalDetailModal'
import { cn } from '@/lib/utils'

export default function CompanyProfileViews({ company }: { company: any }) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Members' | 'Vehicles' | 'Drivers' | 'Services' | 'Documents' | 'Renewals'>('Overview')
  const [selectedRenewal, setSelectedRenewal] = useState<any | null>(null)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false)

  const client = company.client || {}
  const employees = company.employees || []
  const vehicles = company.vehicles || []
  const drivers = company.drivers || []
  const services = company.services || []
  const documents = company.documents || []

  // Contact fallbacks
  const displayEmail = company.companyEmail || client.email || '—'
  const displayMobile = company.companyMobile || client.mobileNumber || '—'
  const displayAddress = company.registeredAddress || client.address || '—'

  // Unified Company Renewals
  const companyRenewals: any[] = []

  if (company.licenceExpiryDate) {
    const days = (new Date(company.licenceExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    companyRenewals.push({
      id: 'comp-lic',
      entityType: 'Company',
      entityId: company.id,
      field: 'licenceExpiryDate',
      numberField: 'tradeLicenceNumber',
      identifier: company.tradeLicenceNumber || '—',
      title: `Trade Licence (${company.tradeLicenceNumber || company.legalName})`,
      category: 'Trade Licence',
      companyId: company.id,
      companyName: company.legalName,
      clientId: client.id,
      clientName: client.fullName,
      expiryDate: company.licenceExpiryDate.toISOString ? company.licenceExpiryDate.toISOString() : company.licenceExpiryDate,
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  if (company.estCardExpiryDate) {
    const days = (new Date(company.estCardExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    companyRenewals.push({
      id: 'comp-est',
      entityType: 'Company',
      entityId: company.id,
      field: 'estCardExpiryDate',
      numberField: 'estCardNumber',
      identifier: company.estCardNumber || '—',
      title: `Establishment Card (${company.estCardNumber || company.legalName})`,
      category: 'Establishment Card',
      companyId: company.id,
      companyName: company.legalName,
      clientId: client.id,
      clientName: client.fullName,
      expiryDate: company.estCardExpiryDate.toISOString ? company.estCardExpiryDate.toISOString() : company.estCardExpiryDate,
      daysUntil: Math.ceil(days),
      isExpired: days < 0,
      isExpiringSoon: days >= 0 && days <= 60
    })
  }

  employees.forEach((emp: any) => {
    if (emp.eVisaExpiryDate) {
      const days = (new Date(emp.eVisaExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      companyRenewals.push({
        id: `emp-visa-${emp.id}`,
        entityType: 'Employee',
        entityId: emp.id,
        field: 'eVisaExpiryDate',
        numberField: 'visaNumber',
        identifier: emp.visaNumber || '—',
        title: `E-Visa (${emp.fullName})`,
        category: 'E-Visa',
        companyId: company.id,
        companyName: company.legalName,
        clientId: client.id,
        clientName: client.fullName,
        expiryDate: emp.eVisaExpiryDate.toISOString ? emp.eVisaExpiryDate.toISOString() : emp.eVisaExpiryDate,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
  })

  vehicles.forEach((veh: any) => {
    if (veh.expDate) {
      const days = (new Date(veh.expDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      companyRenewals.push({
        id: `veh-reg-${veh.id}`,
        entityType: 'Vehicle',
        entityId: veh.id,
        field: 'expDate',
        numberField: 'regNo',
        identifier: veh.regNo,
        title: `Mulkiya Registration (Plate ${veh.regNo})`,
        category: 'Vehicle Registration',
        companyId: company.id,
        companyName: company.legalName,
        clientId: client.id,
        clientName: client.fullName,
        expiryDate: veh.expDate.toISOString ? veh.expDate.toISOString() : veh.expDate,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
  })

  drivers.forEach((drv: any) => {
    if (drv.licenseExpDate) {
      const days = (new Date(drv.licenseExpDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      companyRenewals.push({
        id: `drv-lic-${drv.id}`,
        entityType: 'Driver',
        entityId: drv.id,
        field: 'licenseExpDate',
        identifier: '—',
        title: `Driving Licence (${drv.fullName})`,
        category: 'Driving Licence',
        companyId: company.id,
        companyName: company.legalName,
        clientId: client.id,
        clientName: client.fullName,
        expiryDate: drv.licenseExpDate.toISOString ? drv.licenseExpDate.toISOString() : drv.licenseExpDate,
        daysUntil: Math.ceil(days),
        isExpired: days < 0,
        isExpiringSoon: days >= 0 && days <= 60
      })
    }
  })

  companyRenewals.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  return (
    <div className="space-y-6 font-sans pb-12 animate-fade-in">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <Link 
            href="/companies" 
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            title="Back to Companies"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {company.legalName}
            </h1>
            <div className="flex flex-wrap items-center text-xs text-slate-500 mt-1 gap-x-2.5 gap-y-1">
              <span>Primary Client:</span>
              <Link href={`/clients/${client.id}`} className="font-bold text-[#5B21B6] hover:underline flex items-center">
                {client.fullName}
                <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
              </Link>
              <span>•</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                company.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              )}>
                {company.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href={`/companies/${company.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-[#4C1D95] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Company
          </Link>
        </div>
      </div>

      {/* 2. TOP 4 KEY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Trade Licence */}
        <div className="dash-card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Trade Licence</p>
          <p className="text-base font-black text-slate-900 mt-0.5">{company.tradeLicenceNumber || '—'}</p>
          <div className="flex items-center text-[11px] font-semibold text-slate-500 mt-2">
            <CalendarDays className="w-3 h-3 text-purple-600 mr-1" />
            Exp: {company.licenceExpiryDate ? formatDate(company.licenceExpiryDate) : 'Not Set'}
          </div>
        </div>

        {/* Establishment Card */}
        <div className="dash-card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Establishment Card</p>
          <p className="text-base font-black text-slate-900 mt-0.5">{company.estCardNumber || '—'}</p>
          <div className="flex items-center text-[11px] font-semibold text-slate-500 mt-2">
            <CalendarDays className="w-3 h-3 text-indigo-600 mr-1" />
            Exp: {company.estCardExpiryDate ? formatDate(company.estCardExpiryDate) : 'Not Set'}
          </div>
        </div>

        {/* VAT TRN */}
        <div className="dash-card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">VAT TRN</p>
          <p className="text-base font-black text-slate-900 mt-0.5 font-mono">{company.vatTrn || 'Not Registered'}</p>
          <p className="text-[11px] font-semibold text-slate-500 mt-2">
            Status: {company.vatTrn ? 'Registered' : 'Exempt / None'}
          </p>
        </div>

        {/* Tracked Expiries */}
        <div className="dash-card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tracked Renewals</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{companyRenewals.length}</p>
          <p className="text-[11px] font-semibold text-purple-700 mt-1 cursor-pointer hover:underline" onClick={() => setActiveTab('Renewals')}>
            View Compliance &rarr;
          </p>
        </div>

      </div>

      {/* 3. MODERN TAB NAVIGATION BAR */}
      <div className="dash-panel bg-white p-1.5 rounded-2xl overflow-x-auto max-w-full flex space-x-1 border border-[#EAE5F2] no-scrollbar scroll-smooth">
        {[
          { id: 'Overview', label: 'Overview' },
          { id: 'Members', label: 'Members & Employees', count: employees.length },
          { id: 'Vehicles', label: 'Vehicles & Fleet', count: vehicles.length },
          { id: 'Drivers', label: 'Drivers', count: drivers.length },
          { id: 'Services', label: 'Services', count: services.length },
          { id: 'Documents', label: 'Documents', count: documents.length },
          { id: 'Renewals', label: 'Renewals', count: companyRenewals.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-xs font-bold flex items-center whitespace-nowrap rounded-xl transition-all cursor-pointer",
              activeTab === tab.id 
                ? "bg-[#4C1D95] text-white shadow-xs" 
                : "text-slate-600 hover:text-[#5B21B6] hover:bg-[#F5F3FF]"
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#EDE9FE] text-[#5B21B6]"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Corporate Details */}
          <div className="dash-panel bg-white p-5 rounded-2xl border border-[#EAE5F2] lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Building2 className="w-4 h-4 text-[#5B21B6] mr-2" />
              Corporate &amp; Licensing Information
            </h3>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Legal Name</dt>
                <dd className="font-bold text-slate-900 mt-1">{company.legalName}</dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Trade Licence No</dt>
                <dd className="font-bold text-slate-900 mt-1 font-mono">{company.tradeLicenceNumber || '—'}</dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Licence Expiry</dt>
                <dd className="font-bold text-slate-900 mt-1">
                  {company.licenceExpiryDate ? formatDate(company.licenceExpiryDate) : '—'}
                </dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Establishment Card</dt>
                <dd className="font-bold text-slate-900 mt-1 font-mono">{company.estCardNumber || '—'}</dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">EC Expiry Date</dt>
                <dd className="font-bold text-slate-900 mt-1">
                  {company.estCardExpiryDate ? formatDate(company.estCardExpiryDate) : '—'}
                </dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">VAT TRN</dt>
                <dd className="font-bold text-slate-900 mt-1 font-mono">{company.vatTrn || '—'}</dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Jurisdiction</dt>
                <dd className="font-bold text-slate-900 mt-1">{company.zoneType || 'Mainland (Default)'}</dd>
              </div>

              <div>
                <dt className="font-bold text-slate-400 uppercase text-[10px]">Emirate</dt>
                <dd className="font-bold text-slate-900 mt-1">{company.registeredEmirate || 'Abu Dhabi / Dubai'}</dd>
              </div>
            </dl>
          </div>

          {/* Contact Information */}
          <div className="dash-panel bg-white p-5 rounded-2xl border border-[#EAE5F2]">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Phone className="w-4 h-4 text-[#5B21B6] mr-2" />
              Contact Information
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                <p className="font-bold text-slate-800 break-all mt-0.5">{displayEmail}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{displayMobile}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Address</p>
                <p className="font-medium text-slate-700 mt-0.5">{displayAddress}</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MEMBERS & EMPLOYEES */}
      {activeTab === 'Members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Registered Members &amp; Staff ({employees.length})
            </h3>
          </div>

          {employees.length === 0 ? (
            <div className="dash-panel bg-white p-10 rounded-2xl text-center border border-[#EAE5F2]">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No members or employees registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp: any) => (
                <div key={emp.id} className="dash-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{emp.fullName}</h4>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        {emp.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600 mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Emirates ID:</span>
                        <span className="font-mono font-bold text-slate-800">{emp.emiratesId || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Passport:</span>
                        <span className="font-mono font-bold text-slate-800">{emp.passportNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">E-Visa Expiry:</span>
                        <span className="font-bold text-slate-800">
                          {emp.eVisaExpiryDate ? formatDate(emp.eVisaExpiryDate) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VEHICLES & FLEET */}
      {activeTab === 'Vehicles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Company Fleet &amp; Vehicles ({vehicles.length})
            </h3>
          </div>

          {vehicles.length === 0 ? (
            <div className="dash-panel bg-white p-10 rounded-2xl text-center border border-[#EAE5F2]">
              <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No vehicles registered for this company.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((veh: any) => (
                <div key={veh.id} className="dash-card p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Plate: {veh.regNo}</p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">TC: {veh.tcNo || '—'}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Mulkiya Expiry:</span>
                      <span className="font-bold text-slate-800">{veh.expDate ? formatDate(veh.expDate) : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Policy No:</span>
                      <span className="font-bold text-slate-800">{veh.policyNo || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DRIVERS */}
      {activeTab === 'Drivers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Drivers ({drivers.length})
            </h3>
          </div>

          {drivers.length === 0 ? (
            <div className="dash-panel bg-white p-10 rounded-2xl text-center border border-[#EAE5F2]">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No drivers registered for this company.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((drv: any) => (
                <div key={drv.id} className="dash-card p-4">
                  <p className="text-xs font-bold text-slate-900">{drv.fullName}</p>
                  <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
                    <span className="text-slate-400 font-medium">Licence Expiry:</span>
                    <span className="font-bold text-slate-800">{drv.licenseExpDate ? formatDate(drv.licenseExpDate) : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SERVICES */}
      {activeTab === 'Services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Subscribed Services ({services.length})
            </h3>
          </div>

          {services.length === 0 ? (
            <div className="dash-panel bg-white p-10 rounded-2xl text-center border border-[#EAE5F2]">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No services active for this company.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc: any) => (
                <div key={svc.id} className="dash-card p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F3E8FF] text-[#5B21B6] border border-[#DDD6FE] rounded-md">
                        {svc.category || 'General'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{svc.name}</h4>
                    </div>
                    {svc.description && (
                      <p className="text-[11px] text-slate-500 mt-1">{svc.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                      svc.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {svc.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Company Documents ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="dash-panel bg-white p-10 rounded-2xl text-center border border-[#EAE5F2]">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No uploaded documents found for this company.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <div key={doc.id} className="dash-card p-4">
                  <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.documentType}</p>
                  {doc.expiryDate && (
                    <p className="text-[11px] font-bold text-slate-700 mt-2">
                      Expiry: {formatDate(doc.expiryDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: RENEWALS */}
      {activeTab === 'Renewals' && (
        <div className="space-y-4">
          <div className="dash-panel bg-white rounded-2xl overflow-hidden border border-[#EAE5F2]">
            <table className="w-full text-left text-xs">
              <thead className="table-header-tint border-b border-[#EAE5F2]">
                <tr>
                  <th className="px-5 py-3">Item / Licence</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Expiry Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {companyRenewals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No renewals recorded.
                    </td>
                  </tr>
                ) : (
                  companyRenewals.map((r) => (
                    <tr 
                      key={r.id} 
                      onClick={() => {
                        setSelectedRenewal(r)
                        setIsRenewalModalOpen(true)
                      }}
                      className="hover:bg-[#FAF9FC] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors">{r.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        {formatDate(r.expiryDate)}
                        {r.isExpired && <span className="ml-2 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">EXPIRED</span>}
                        {!r.isExpired && r.isExpiringSoon && <span className="ml-2 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded">IN {r.daysUntil} DAYS</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                          r.isExpired ? 'bg-red-50 text-red-700 border-red-200' :
                          r.isExpiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}>
                          {r.isExpired ? 'Action Required' : r.isExpiringSoon ? 'Due Soon' : 'Valid'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedRenewal(r)
                            setIsRenewalModalOpen(true)
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE] rounded-lg transition-all"
                        >
                          View &amp; Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renewal Detail Modal */}
      <RenewalDetailModal 
        item={selectedRenewal}
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
      />

    </div>
  )
}
