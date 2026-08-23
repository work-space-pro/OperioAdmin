'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Building2, HelpCircle } from 'lucide-react'
import { portalLoginAction } from './actions'

export default function PortalLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    setLoading(true)
    const result = await portalLoginAction(prevState, formData)
    setLoading(false)
    if (result?.success) {
      router.push('/portal')
      router.refresh()
    }
    return result
  }, null)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft Purple Ambient Glow Background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#5B21B6] flex items-center justify-center shadow-lg shadow-purple-900/20 mb-3">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">OPERIO</h1>
            <span className="bg-purple-100 text-[#5B21B6] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Client Portal
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500 max-w-sm">
            Access your company documents, service applications, licenses & renewal schedules securely.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-200/80 rounded-2xl">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#5B21B6] transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Portal Password
                </label>
                <Link
                  href="/portal/forgot-password"
                  className="text-[11px] font-bold text-[#5B21B6] hover:text-[#4C1D95] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#5B21B6] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded text-[#5B21B6] focus:ring-[#5B21B6] border-slate-300"
                />
                <span className="text-xs text-slate-600 font-semibold select-none">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#5B21B6] hover:bg-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B21B6] shadow-md shadow-purple-900/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending || loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted 256-Bit TLS Client Session</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Don't have an active portal invitation yet? Please contact your Operio account manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
