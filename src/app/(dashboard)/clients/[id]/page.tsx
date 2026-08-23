import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientById } from '../actions'
import ClientProfileViews from './ClientProfileViews'

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const client = await getClientById(resolvedParams.id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6 pb-12 font-sans px-4 sm:px-6 lg:px-8 pt-6 max-w-[1600px] mx-auto">
      {/* Breadcrumb / Nav */}
      <div className="flex items-center text-sm font-bold text-slate-500 space-x-2">
        <Link href="/clients" className="hover:text-indigo-600 transition-colors">Clients</Link>
        <span>/</span>
        <span className="text-slate-900">{client.fullName}</span>
      </div>

      <ClientProfileViews client={client} />
    </div>
  )
}
