'use client'

import { useActionState, useState } from 'react'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  LockKeyhole
} from 'lucide-react'
import { loginAction } from './actions'
import ConnectedNetworkBg from '@/components/brand/ConnectedNetworkBg'

const initialState = {
  error: ''
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showKey, setShowKey] = useState(false)
  const [capsLockActive, setCapsLockActive] = useState(false)

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Connected Business Network Background Vector & Ambient Mesh */}
      <ConnectedNetworkBg />

      {/* Main Luxury Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(76,29,149,0.09)] border border-[#EAE5F2] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* LEFT PANEL (~38% width): BRAND HERO & CAPABILITIES */}
        <div className="w-full md:w-[38%] md:min-w-[330px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] p-7 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Radial Glow & Dot Grid Pattern */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#EDE9FE_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center mb-3">
                <img 
                  src="/logo.jpg" 
                  alt="Operio Logo" 
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.src = '/logo.png' }}
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-black tracking-wider leading-none text-white">OPERIO</div>
                <div className="text-[11px] text-[#DDD6FE] font-extrabold tracking-wider uppercase mt-1.5">CRM & Compliance Suite</div>
              </div>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight mb-2">
                Your Business Operations, One Platform.
              </h1>
              <p className="text-purple-100/75 text-xs leading-relaxed font-medium">
                Clients. Renewals. Compliance. Documents. All connected.
              </p>
            </div>

            {/* 3 Refined Compact Glass-style Feature Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight">Renewals Radar</h4>
                  <p className="text-[10.5px] text-purple-200/70 truncate">Upcoming renewals & alerts</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight">Entity Management</h4>
                  <p className="text-[10.5px] text-purple-200/70 truncate">Companies, employees & vehicles</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-sky-400/20 flex items-center justify-center text-sky-300 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight">Compliance Hub</h4>
                  <p className="text-[10.5px] text-purple-200/70 truncate">Trade license, VAT & visa tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white/90 text-[11px]">System Online</span>
            </div>
            <span className="text-[11px] text-purple-200/60 font-medium">v3.2</span>
          </div>

        </div>

        {/* RIGHT PANEL (~62% width): LOGIN FOCUS AREA */}
        <div className="w-full md:w-[62%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          
          <div className="max-w-sm w-full mx-auto">
            
            {/* Header / Clean Centered Hierarchy */}
            <div className="mb-7 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Welcome to Operio
              </h2>
              <div className="inline-block px-3 py-1 rounded-md bg-[#F3E8FF] border border-[#DDD6FE] text-[#5B21B6] text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Administration Management
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs mx-auto">
                Sign in securely to access your management dashboard.
              </p>
            </div>

            {/* Login Form */}
            <form action={formAction} className="space-y-4">
              
              <div>
                <label htmlFor="accessKey" className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  MASTER ACCESS KEY
                </label>
                
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  
                  <input
                    id="accessKey"
                    name="accessKey"
                    type={showKey ? 'text' : 'password'}
                    required
                    autoFocus
                    onKeyUp={handleKeyUp}
                    onKeyDown={handleKeyDown}
                    className="block w-full h-[52px] pl-10 pr-11 bg-white hover:bg-slate-50/50 focus:bg-white border border-slate-300 focus:border-[#7C3AED] rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/15 transition-all"
                    placeholder="Enter access key"
                  />

                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#5B21B6] focus:outline-none transition-colors cursor-pointer"
                    title={showKey ? "Hide access key" : "Show access key"}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Caps Lock Indicator */}
              {capsLockActive && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2 rounded-xl text-[11px] font-bold flex items-center space-x-2 animate-fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Caps Lock is ON</span>
                </div>
              )}

              {/* Error Message */}
              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                  <p>⚠ {state.error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[52px] flex items-center justify-center space-x-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#4C1D95] hover:from-[#4C1D95] hover:to-[#3B0764] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying access...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-400 font-medium space-x-1.5">
              <LockKeyhole className="w-3.5 h-3.5 text-slate-400" />
              <span>Secure Session</span>
              <span>•</span>
              <span>Authorized Access Only</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
