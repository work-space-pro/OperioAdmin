import Link from 'next/link'
import { Building2, User, Phone, Mail, MessageSquare } from 'lucide-react'
import ClientRowActions from './ClientRowActions'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/formatDate'

export function ClientTable({ clients }: { clients: any[] }) {
  const getGradient = (name: string) => {
    const gradients = [
      'from-[#6D28D9] to-[#4C1D95]',
      'from-[#7C3AED] to-[#5B21B6]',
      'from-[#8B5CF6] to-[#6D28D9]',
      'from-[#5B21B6] to-[#4338CA]',
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
    <div className="dash-panel bg-white rounded-2xl overflow-hidden border border-[#EAE5F2]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="table-header-tint border-b border-[#EAE5F2]">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Companies</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {clients.map((client) => {
              const companyCount = client._count?.companies || client.companies?.length || 0
              return (
                <tr key={client.id} className="hover:bg-[#FAF9FC] transition-colors group">
                  
                  {/* Client Name & Avatar */}
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 bg-gradient-to-br rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs",
                        getGradient(client.fullName)
                      )}>
                        {getInitials(client.fullName)}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          href={`/clients/${client.id}`} 
                          className="font-bold text-slate-900 group-hover:text-[#5B21B6] transition-colors text-xs line-clamp-1"
                        >
                          {client.fullName}
                        </Link>
                        {client.email && (
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{client.email}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center text-slate-600 font-semibold text-xs">
                      {client.clientType === 'Individual' ? (
                        <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      )}
                      <span>{client.clientType || 'Individual'}</span>
                    </div>
                  </td>

                  {/* Companies */}
                  <td className="px-5 py-3">
                    {companyCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F3E8FF] text-[#5B21B6] border border-[#DDD6FE]">
                        {companyCount} {companyCount === 1 ? 'Company' : 'Companies'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-700 font-medium text-xs">
                        {client.mobileNumber || client.whatsappNumber || '—'}
                      </span>
                      {client.whatsappNumber && (
                        <a 
                          href={`https://wa.me/${client.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3 whitespace-nowrap">
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
                  </td>

                  {/* Created Date */}
                  <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">
                    {client.createdAt ? formatDate(client.createdAt) : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <ClientRowActions id={client.id} name={client.fullName} status={client.status} />
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
