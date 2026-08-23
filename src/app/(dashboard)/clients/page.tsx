import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { getClients } from './actions'
import { ClientController } from './ClientController'

export const dynamic = 'force-dynamic'

export default async function ClientsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  
  const q = typeof searchParams?.q === 'string' ? searchParams.q : undefined
  const type = typeof searchParams?.type === 'string' ? searchParams.type : undefined
  const status = typeof searchParams?.status === 'string' ? searchParams.status : undefined
  const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : 'createdAt'
  const order = typeof searchParams?.order === 'string' ? searchParams.order : 'desc'
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1
  const pageSize = typeof searchParams?.pageSize === 'string' ? parseInt(searchParams.pageSize) : 24

  const { clients, totalCount } = await getClients({ q, type, status, sort, order, page, pageSize })

  return (
    <div className="w-full font-sans space-y-5 animate-fade-in-up delay-0">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2.5" />
            Clients
          </h1>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Manage your corporate representatives, individual clients, and service agreements.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            href="/clients/new" 
            className="inline-flex items-center justify-center px-4 py-2 bg-[#4C1D95] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Client
          </Link>
        </div>
      </div>

      {/* Main Client Content Controller */}
      <ClientController 
        clients={clients} 
        totalCount={totalCount} 
        currentPage={page} 
        pageSize={pageSize} 
      />
    </div>
  )
}
