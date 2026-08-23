import Link from 'next/link'
import { Building2, User, Phone, Mail, MessageSquare } from 'lucide-react'
import ClientRowActions from './ClientRowActions'
import { cn } from '@/lib/utils'

export function ClientCardGrid({ clients }: { clients: any[] }) {
  const getGradient = (name: string) => {
    const gradients = [
      'from-[#6D28D9] to-[#4C1D95]',
      'from-[#7C3AED] to-[#5B21B6]',
      'from-[#8B5CF6] to-[#6D28D9]',
      'from-[#5B21B6] to-[#4338CA]',
      'from-[#9333EA] to-[#6B21A8]',
    ]
    const charCode = (name || 'A').charCodeAt(0)
    return gradients[charCode % gradients.length]
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map((client) => {
        const companyCount = client._count?.companies || client.companies?.length || 0
        const docCount = client._count?.documents || client.documents?.length || 0
        const serviceCount = client._count?.services || client.services?.length || 0

        return (
          <div 
            key={client.id} 
            className="dash-card p-4 hover:border-[#DDD6FE] transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top Row: Avatar & Status */}
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className={cn(
                  "flex-shrink-0 h-10 w-10 bg-gradient-to-br rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs",
                  getGradient(client.fullName)
                )}>
                  {getInitials(client.fullName)}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border",
                    client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    client.status === 'Prospect' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    client.status === 'Archived' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      client.status === 'Active' ? 'bg-emerald-500' :
                      client.status === 'Prospect' ? 'bg-blue-500' : 
                      client.status === 'Archived' ? 'bg-amber-500' :
                      'bg-slate-400'
                    )}></span>
                    {client.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <Link 
                  href={`/clients/${client.id}`} 
                  className="text-xs font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors leading-tight line-clamp-1"
                >
                  {client.fullName}
                </Link>

                <div className="flex items-center text-[11px] font-semibold text-slate-500 mt-1">
                  {client.clientType === 'Individual' ? (
                    <User className="w-3 h-3 mr-1 text-slate-400" />
                  ) : (
                    <Building2 className="w-3 h-3 mr-1 text-slate-400" />
                  )}
                  <span>{client.clientType || 'Individual'}</span>
                  {client.nationality && (
                    <span className="text-slate-400 ml-1.5">• {client.nationality}</span>
                  )}
                </div>

                {/* Company Tag if any */}
                {client.companies && client.companies.length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F3E8FF] text-[#5B21B6] border border-[#DDD6FE] max-w-full truncate">
                      <Building2 className="w-2.5 h-2.5 mr-1 shrink-0" />
                      <span className="truncate">{client.companies[0].legalName}</span>
                      {client.companies.length > 1 && (
                        <span className="text-[#5B21B6] ml-1">+{client.companies.length - 1}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="mt-3 pt-2.5 border-t border-[#EAE5F2]">
              <div className="grid grid-cols-3 gap-1 py-1 text-center bg-slate-50 rounded-xl border border-slate-100 mb-2.5">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Companies</p>
                  <p className="text-xs font-black text-slate-800">{companyCount}</p>
                </div>
                <div className="border-x border-slate-200/60">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Services</p>
                  <p className="text-xs font-black text-slate-800">{serviceCount}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Docs</p>
                  <p className="text-xs font-black text-slate-800">{docCount}</p>
                </div>
              </div>

              {/* Contact Links & Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1 text-slate-400">
                  {client.mobileNumber && (
                    <a 
                      href={`tel:${client.mobileNumber}`} 
                      className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title={client.mobileNumber}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {client.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${client.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title={`WhatsApp: ${client.whatsappNumber}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {client.email && (
                    <a 
                      href={`mailto:${client.email}`} 
                      className="p-1.5 hover:text-[#5B21B6] hover:bg-[#F5F3FF] rounded-lg transition-colors"
                      title={client.email}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <ClientRowActions id={client.id} name={client.fullName} status={client.status} />
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
