'use client'

import React, { useState } from 'react'
import { Building2, Users, Car, Contact, UserSquare2, Plus, Trash2, Edit2, X, Loader2 } from 'lucide-react'
import { 
  addVehicleToCompany, addDriverToCompany, addEmployeeToCompany,
  deleteCompany, deleteEmployee, deleteVehicle, deleteDriver,
  editEmployee, editVehicle, editDriver 
} from '../actions'
import { formatDate } from '@/lib/formatDate'

export default function CompanyDetailsCard({ company }: { company: any }) {
  // Add States
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddDriver, setShowAddDriver] = useState(false)
  
  // Edit States
  const [editingMember, setEditingMember] = useState<any>(null)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [editingDriver, setEditingDriver] = useState<any>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // -- ADD HANDLERS --
  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await addVehicleToCompany(company.id, formData)
    if (res.success) setShowAddVehicle(false)
    else alert(res.error)
    setIsSubmitting(false)
  }

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await addEmployeeToCompany(company.id, formData)
    if (res.success) setShowAddMember(false)
    else alert(res.error)
    setIsSubmitting(false)
  }

  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await addDriverToCompany(company.id, formData)
    if (res.success) setShowAddDriver(false)
    else alert(res.error)
    setIsSubmitting(false)
  }

  // -- EDIT HANDLERS --
  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await editEmployee(editingMember.id, formData)
    if (res.success) setEditingMember(null)
    else alert(res.error)
    setIsSubmitting(false)
  }

  const handleEditVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await editVehicle(editingVehicle.id, formData)
    if (res.success) setEditingVehicle(null)
    else alert(res.error)
    setIsSubmitting(false)
  }

  const handleEditDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await editDriver(editingDriver.id, formData)
    if (res.success) setEditingDriver(null)
    else alert(res.error)
    setIsSubmitting(false)
  }

  // -- DELETE HANDLERS --
  const handleDeleteCompany = async () => {
    if(confirm("Are you sure you want to delete this company? All its members and vehicles will be lost.")) {
      await deleteCompany(company.id)
    }
  }

  const vehicles = company.vehicles || []
  const members = company.employees || []
  const drivers = company.drivers || []

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden mb-8 relative">
      
      {/* COMPANY HEADER */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
            {company.legalName.substring(0,2)}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">{company.legalName}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{company.companyType || 'Company'}</p>
          </div>
        </div>
        <button onClick={handleDeleteCompany} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Company">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-10">
        
        {/* OVERVIEW SECTION */}
        <div className="space-y-4">
          <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-indigo-500" /> Overview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Trade Licence No.</p>
                <p className="text-base font-black text-slate-900">{company.tradeLicenceNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Licence Expiry</p>
                <p className="text-base font-black text-slate-900">{company.licenceExpiryDate ? formatDate(company.licenceExpiryDate) : '-'}</p>
              </div>
            </div>
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Establishment Card</p>
                <p className="text-base font-black text-slate-900">{company.estCardNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">EC Expiry Date</p>
                <p className="text-base font-black text-slate-900">{company.estCardExpiryDate ? formatDate(company.estCardExpiryDate) : '-'}</p>
              </div>
            </div>
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
               <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">VAT TRN</p>
                <p className="text-base font-black text-slate-900">{company.vatTrn || '-'}</p>
              </div>
               <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Corporate Tax Reg</p>
                <p className="text-base font-black text-slate-900">{company.corporateTaxRegNumber || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MEMBERS SECTION */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-500" /> Members 
              <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{members.length}</span>
            </h4>
            <button onClick={() => setShowAddMember(!showAddMember)} className="bg-slate-900 hover:bg-slate-800 transition-colors text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Add Member
            </button>
          </div>
          
          {showAddMember && (
            <form onSubmit={handleAddMember} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Role / Member Type</label>
                  <select name="memberType" className="text-sm px-3 py-2 border rounded-md bg-white">
                    <option value="Partner">Partner</option>
                    <option value="Employee/Staff">Employee/Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Full Legal Name *</label>
                  <input required name="fullName" placeholder="Full Name" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Emirates ID</label>
                  <input name="emiratesId" placeholder="784-YYYY-XXXXXXX-X" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">EID Expiry</label>
                  <input type="date" name="eidExpiryDate" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Passport Number</label>
                  <input name="passportNumber" placeholder="e.g. A1234567" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Passport Issue Date</label>
                  <input type="date" name="passportIssueDate" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Passport Expiry Date</label>
                  <input type="date" name="passportExpiry" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">E-Visa Issue Date</label>
                  <input type="date" name="eVisaIssueDate" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">E-Visa Expiry Date</label>
                  <input type="date" name="eVisaExpiryDate" className="text-sm px-3 py-2 border rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Health Ins Expiry</label>
                  <input type="date" name="healthInsExpiry" className="text-sm px-3 py-2 border rounded-md" />
                </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">{isSubmitting ? 'Saving...' : 'Save Member'}</button>
            </form>
          )}

          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((m: any) => {
                const memberRole = m.designation || m.visaType || 'Partner'
                const isPassportExp = m.passportExpiry && new Date(m.passportExpiry).getTime() < new Date().getTime()
                return (
                  <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-100 transition-all relative group flex flex-col justify-between">
                    
                    <div>
                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingMember(m)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={async () => { if(confirm('Delete member?')) await deleteEmployee(m.id) }} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-4 pr-16">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black shadow-xs">
                          {m.fullName.substring(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-sm leading-tight truncate mb-1">{m.fullName}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                            {memberRole}
                          </span>
                        </div>
                      </div>

                      {/* Grid Data */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Passport No</p>
                          <p className="font-bold text-slate-800 font-mono">{m.passportNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Passport Exp</p>
                          <p className={`font-bold ${isPassportExp ? 'text-red-600 font-black' : 'text-slate-800'}`}>
                            {m.passportExpiry ? formatDate(m.passportExpiry) : '-'}
                          </p>
                        </div>
                        {m.passportIssueDate && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Passport Issued</p>
                            <p className="font-bold text-slate-700">{formatDate(m.passportIssueDate)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">EID Expiry</p>
                          <p className="font-bold text-slate-700">{m.eidExpiryDate ? formatDate(m.eidExpiryDate) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">E-Visa Expiry</p>
                          <p className="font-bold text-slate-700">{m.eVisaExpiryDate ? formatDate(m.eVisaExpiryDate) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Health Ins Exp</p>
                          <p className="font-bold text-orange-600">{m.healthInsExpiry ? formatDate(m.healthInsExpiry) : '-'}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
               <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
               <p className="text-sm font-bold text-slate-500">No members found</p>
            </div>
          )}
        </div>

        {/* VEHICLES SECTION */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center">
              <Car className="w-4 h-4 mr-2 text-indigo-500" /> Vehicles 
              <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{vehicles.length}</span>
            </h4>
            <button onClick={() => setShowAddVehicle(!showAddVehicle)} className="bg-slate-900 hover:bg-slate-800 transition-colors text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Add Vehicle
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input required name="regNo" placeholder="Reg No." className="text-sm px-3 py-2 border rounded-md" />
                <input name="tcNo" placeholder="T C No." className="text-sm px-3 py-2 border rounded-md" />
                <input name="policyNo" placeholder="Policy No" className="text-sm px-3 py-2 border rounded-md" />
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">Reg Date</label><input type="date" name="regDate" className="text-sm px-3 py-2 border rounded-md" /></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">Exp Date</label><input type="date" name="expDate" className="text-sm px-3 py-2 border rounded-md" /></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">Insurance Issue</label><input type="date" name="insuranceIssueDate" className="text-sm px-3 py-2 border rounded-md" /></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">Insurance Exp</label><input type="date" name="insuranceExpDate" className="text-sm px-3 py-2 border rounded-md" /></div>
              </div>
              <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">{isSubmitting ? 'Saving...' : 'Save Vehicle'}</button>
            </form>
          )}

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles.map((v: any) => (
                <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-emerald-100 transition-all relative group flex flex-col">
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingVehicle(v)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => { if(confirm('Delete vehicle?')) await deleteVehicle(v.id) }} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-5 pr-16">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black shadow-sm">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-[15px] leading-tight mb-0.5">{v.regNo}</h5>
                      <p className="text-xs font-bold text-slate-500">Policy: {v.policyNo || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Grid Data */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-auto p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reg Issue</p>
                      <p className="font-bold text-slate-700 text-xs">{v.regDate ? formatDate(v.regDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reg Expiry</p>
                      <p className="font-bold text-orange-600 text-xs">{v.expDate ? formatDate(v.expDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Ins Issue</p>
                      <p className="font-bold text-slate-700 text-xs">{v.insuranceIssueDate ? formatDate(v.insuranceIssueDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Ins Expiry</p>
                      <p className="font-bold text-orange-600 text-xs">{v.insuranceExpDate ? formatDate(v.insuranceExpDate) : '-'}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
               <Car className="w-8 h-8 mx-auto text-slate-300 mb-2" />
               <p className="text-sm font-bold text-slate-500">No vehicles found</p>
            </div>
          )}
        </div>

        {/* DRIVERS SECTION */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center">
              <Contact className="w-4 h-4 mr-2 text-indigo-500" /> Drivers 
              <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{drivers.length}</span>
            </h4>
            <button onClick={() => setShowAddDriver(!showAddDriver)} className="bg-slate-900 hover:bg-slate-800 transition-colors text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Add Driver
            </button>
          </div>

          {showAddDriver && (
            <form onSubmit={handleAddDriver} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input required name="fullName" placeholder="Driver Name" className="text-sm px-3 py-2 border rounded-md" />
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">License Issue Date</label><input type="date" name="licenseIssueDate" className="text-sm px-3 py-2 border rounded-md" /></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 font-bold">License Exp Date</label><input type="date" name="licenseExpDate" className="text-sm px-3 py-2 border rounded-md" /></div>
              </div>
              <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">{isSubmitting ? 'Saving...' : 'Save Driver'}</button>
            </form>
          )}

          {drivers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {drivers.map((d: any) => (
                <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-100 transition-all relative group flex flex-col">
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingDriver(d)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => { if(confirm('Delete driver?')) await deleteDriver(d.id) }} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-5 pr-16">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-black shadow-sm">
                      <Contact className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-[15px] leading-tight">{d.fullName}</h5>
                    </div>
                  </div>

                  {/* Grid Data */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-auto p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">License Issue</p>
                      <p className="font-bold text-slate-700 text-xs">{d.licenseIssueDate ? formatDate(d.licenseIssueDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">License Expiry</p>
                      <p className="font-bold text-orange-600 text-xs">{d.licenseExpDate ? formatDate(d.licenseExpDate) : '-'}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
               <Contact className="w-8 h-8 mx-auto text-slate-300 mb-2" />
               <p className="text-sm font-bold text-slate-500">No drivers found</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black">Edit Member</h2>
              <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleEditMember} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold mb-1">Role / Member Type</label>
                  <select name="memberType" defaultValue={editingMember.designation || editingMember.visaType || 'Partner'} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="Partner">Partner</option>
                    <option value="Employee/Staff">Employee/Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold mb-1">Full Legal Name *</label><input required name="fullName" defaultValue={editingMember.fullName} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Emirates ID</label><input name="emiratesId" defaultValue={editingMember.emiratesId} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">EID Expiry</label><input type="date" name="eidExpiryDate" defaultValue={editingMember.eidExpiryDate ? new Date(editingMember.eidExpiryDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Passport Number</label><input name="passportNumber" defaultValue={editingMember.passportNumber} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Passport Issue Date</label><input type="date" name="passportIssueDate" defaultValue={editingMember.passportIssueDate ? new Date(editingMember.passportIssueDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Passport Expiry Date</label><input type="date" name="passportExpiry" defaultValue={editingMember.passportExpiry ? new Date(editingMember.passportExpiry).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">E-Visa Issue Date</label><input type="date" name="eVisaIssueDate" defaultValue={editingMember.eVisaIssueDate ? new Date(editingMember.eVisaIssueDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">E-Visa Expiry Date</label><input type="date" name="eVisaExpiryDate" defaultValue={editingMember.eVisaExpiryDate ? new Date(editingMember.eVisaExpiryDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Health Ins Expiry</label><input type="date" name="healthInsExpiry" defaultValue={editingMember.healthInsExpiry ? new Date(editingMember.healthInsExpiry).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black">Edit Vehicle</h2>
              <button onClick={() => setEditingVehicle(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleEditVehicle} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-xs font-bold mb-1">Reg No</label><input required name="regNo" defaultValue={editingVehicle.regNo} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">T.C. No</label><input name="tcNo" defaultValue={editingVehicle.tcNo} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Policy No</label><input name="policyNo" defaultValue={editingVehicle.policyNo} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Reg Date</label><input type="date" name="regDate" defaultValue={editingVehicle.regDate ? new Date(editingVehicle.regDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Reg Exp Date</label><input type="date" name="expDate" defaultValue={editingVehicle.expDate ? new Date(editingVehicle.expDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Insurance Issue Date</label><input type="date" name="insuranceIssueDate" defaultValue={editingVehicle.insuranceIssueDate ? new Date(editingVehicle.insuranceIssueDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Insurance Exp Date</label><input type="date" name="insuranceExpDate" defaultValue={editingVehicle.insuranceExpDate ? new Date(editingVehicle.insuranceExpDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {editingDriver && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-black">Edit Driver</h2>
              <button onClick={() => setEditingDriver(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleEditDriver} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold mb-1">Driver Name</label><input required name="fullName" defaultValue={editingDriver.fullName} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">License Issue Date</label><input type="date" name="licenseIssueDate" defaultValue={editingDriver.licenseIssueDate ? new Date(editingDriver.licenseIssueDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">License Exp Date</label><input type="date" name="licenseExpDate" defaultValue={editingDriver.licenseExpDate ? new Date(editingDriver.licenseExpDate).toISOString().split('T')[0] : ''} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl mt-4">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
