'use client'

import React, { useActionState, useState } from 'react'
import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Globe,
  MapPin,
} from 'lucide-react'
import { updatePortalPasswordAction } from './actions'

export default function PortalProfileView({
  user,
  client,
  companies,
}: {
  user: any
  client: any
  companies: any[]
}) {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await updatePortalPasswordAction(prevState, formData)
  }, null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Client Account & Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your contact preferences and portal security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Client Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#5B21B6] font-black text-xl flex items-center justify-center shadow-2xs">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">{client.fullName}</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {client.clientType || 'Individual Client'} • Status:{' '}
                  <span className="text-emerald-600 font-bold">{user.status}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Login Email</span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Mobile Phone</span>
                <span className="font-bold text-slate-900">{client.mobileNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">WhatsApp Channel</span>
                <span className="font-bold text-slate-900">{client.whatsappNumber || client.mobileNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Nationality</span>
                <span className="font-bold text-slate-900">{client.nationality || '—'}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                <span className="text-slate-400 font-semibold block text-[11px]">Registered Address</span>
                <span className="font-bold text-slate-900">{client.address || 'Dubai, United Arab Emirates'}</span>
              </div>
            </div>
          </div>

          {/* Authorized Companies List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Authorized Company Profiles ({companies.length})
            </h3>
            {companies.length === 0 ? (
              <p className="text-xs text-slate-400">No linked company entities.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#5B21B6]" />
                      <span className="font-bold text-slate-800">{c.legalName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {c.tradeLicenceNumber ? `TL: ${c.tradeLicenceNumber}` : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Change Password Card */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-[#5B21B6]" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Change Password
              </h2>
            </div>

            {state?.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            {state?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                ⚠️ {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    required
                    placeholder="••••••••"
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-8 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-8 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
