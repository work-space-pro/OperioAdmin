import { notFound } from 'next/navigation'
import { getClientById } from '../../actions'
import EditClientForm from './EditClientForm'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const client = await getClientById(resolvedParams.id)

  if (!client) {
    notFound()
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-4">
      <EditClientForm client={client} />
    </div>
  )
}
