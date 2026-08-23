'use client'

import React, { useState, useActionState } from 'react'
import { 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Image as ImageIcon, 
  Save, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Globe,
  Clock,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react'
import { saveGeneralSettings, updateAccessKeyAction, saveCompliancePreferences } from './actions'
import { cn } from '@/lib/utils'

export default function SettingsClientView() {
  const [activeTab, setActiveTab] = useState<'General' | 'Security' | 'Notifications' | 'System'>('General')

  const [genState, genFormAction, isGenPending] = useActionState(saveGeneralSettings, null)
  const [secState, secFormAction, isSecPending] = useActionState(updateAccessKeyAction, null)
  const [notifState, notifFormAction, isNotifPending] = useActionState(saveCompliancePreferences, null)

  const [companyName, setCompanyName] = useState('OPERIO CRM & Compliance Suite')
  const [tagline, setTagline] = useState('Your Business Operations, One Platform. Clients. Renewals. Compliance. Documents. All connected.')
  const [thresholdDays, setThresholdDays] = useState('30')

  return (
    <div className="flex flex-col font-sans space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#5B21B6]" />
            System Settings &amp; Configuration
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Manage branding, administration security access, compliance rules, and platform preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#5B21B6] text-xs font-bold uppercase tracking-wider">
            Administration Management
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('General')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'General'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          General &amp; Branding
        </button>

        <button 
          onClick={() => setActiveTab('Security')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'Security'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Shield className="w-4 h-4" />
          Security &amp; Master Key
        </button>

        <button 
          onClick={() => setActiveTab('Notifications')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'Notifications'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Bell className="w-4 h-4" />
          Compliance &amp; Alert Rules
        </button>

        <button 
          onClick={() => setActiveTab('System')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'System'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Server className="w-4 h-4" />
          System Health &amp; Info
        </button>
      </div>

      {/* ================= TAB 1: GENERAL & BRANDING ================= */}
      {activeTab === 'General' && (
        <form action={genFormAction} className="space-y-6">
          
          {genState?.success && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{genState.message}</span>
            </div>
          )}

          {genState?.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{genState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Branding Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#5B21B6]" />
                  Branding &amp; Identity
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Suite Theme</span>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Platform Suite Name
                  </label>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Platform Tagline &amp; Mission
                  </label>
                  <textarea 
                    name="tagline" 
                    rows={2}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Administration Role Title
                  </label>
                  <input 
                    type="text" 
                    disabled
                    value="Administration Management" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#5B21B6] cursor-not-allowed" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Standard system role for high-tier operations.</p>
                </div>
              </div>
            </div>

            {/* Official Logo & Regional Settings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Official Logo &amp; Regional Localization
                </h3>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Current Active Logo
                  </label>
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                      <img 
                        src="/logo.jpg" 
                        alt="Operio Official Logo" 
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => { e.currentTarget.src = '/logo.png' }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Official Operio Emblem</div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> High-Res Vector SVG / JPG Active
                      </div>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">Stored in /public/logo.jpg &amp; /public/logo.png</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Default Currency
                    </label>
                    <select 
                      name="currency" 
                      defaultValue="AED"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Timezone
                    </label>
                    <select 
                      name="timezone" 
                      defaultValue="Asia/Dubai"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Asia/Dubai">Asia/Dubai (GST UTC+4)</option>
                      <option value="Asia/Riyadh">Asia/Riyadh (AST UTC+3)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isGenPending}
              className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isGenPending ? 'Saving Settings...' : 'Save General Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: SECURITY & ACCESS KEY ================= */}
      {activeTab === 'Security' && (
        <form action={secFormAction} className="space-y-6 max-w-3xl">
          
          {secState?.success && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{secState.message}</span>
            </div>
          )}

          {secState?.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{secState.error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#5B21B6]" />
                Master Access Key Management
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Encrypted &amp; Protected
              </span>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-2xl">
                <p className="text-xs font-black text-[#5B21B6] uppercase tracking-wider">
                  Administration Management Mode Active
                </p>
                <p className="text-xs font-medium text-purple-950/80 mt-1 leading-relaxed">
                  Operio CRM uses high-entropy Master Access Key encryption for single-tenant operations. Updating your master access key will update login credentials for future sessions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Current Master Access Key *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    name="currentKey" 
                    required 
                    placeholder="Enter your current access key (e.g. admin123)" 
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    New Master Access Key *
                  </label>
                  <input 
                    type="password" 
                    name="newKey" 
                    required 
                    placeholder="Enter new strong access key" 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Confirm New Access Key *
                  </label>
                  <input 
                    type="password" 
                    name="confirmKey" 
                    required 
                    placeholder="Re-enter new access key" 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6] focus:bg-white" 
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end border-t border-slate-100">
              <button 
                type="submit" 
                disabled={isSecPending}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                {isSecPending ? 'Updating...' : 'Update Master Access Key'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 3: COMPLIANCE & ALERT RULES ================= */}
      {activeTab === 'Notifications' && (
        <form action={notifFormAction} className="space-y-6 max-w-3xl">
          
          {notifState?.success && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{notifState.message}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Compliance Radar &amp; Expiry Notification Thresholds
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Renewals Due Soon Warning Window
                </label>
                <select 
                  name="thresholdDays"
                  value={thresholdDays}
                  onChange={(e) => setThresholdDays(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="30">30 Days Before Expiry</option>
                  <option value="60">60 Days Before Expiry (Recommended)</option>
                  <option value="90">90 Days Before Expiry</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Documents expiring within this window will appear under "Expiring Soon" in the Compliance Radar.</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  Active Compliance Tracking Modules
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Trade Licences &amp; Establishment Cards</div>
                      <div className="text-[11px] text-slate-400">Track company corporate renewals &amp; labour cards</div>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Client &amp; Owner Identity Expiries</div>
                      <div className="text-[11px] text-slate-400">Track Emirates ID, Visa, Passport, and Health Insurance</div>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Fleet Vehicles &amp; Driver Licences</div>
                      <div className="text-[11px] text-slate-400">Track Mulkiya registration, vehicle insurance, and driver licenses</div>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end border-t border-slate-100">
              <button 
                type="submit" 
                disabled={isNotifPending}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isNotifPending ? 'Saving...' : 'Save Compliance Rules'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 4: SYSTEM HEALTH & INFO ================= */}
      {activeTab === 'System' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                System Health &amp; Infrastructure
              </h3>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Online (99.9%)</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Version Release</div>
                  <div className="text-sm font-black text-slate-900 mt-1">Operio CRM v3.2 Enterprise</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Turbopack Optimized App Router</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Database Engine</div>
                  <div className="text-sm font-black text-slate-900 mt-1">PostgreSQL on Prisma ORM</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Connected &amp; Synchronized</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Server Host</div>
                  <div className="text-sm font-black text-slate-900 mt-1">Main Server (Consultantcy)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Port 3000 Active</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Portal Role</div>
                  <div className="text-sm font-black text-[#5B21B6] mt-1">Administration Management</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Full System Access Granted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
