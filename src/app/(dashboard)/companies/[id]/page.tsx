import { notFound } from 'next/navigation'
import { getCompanyById } from '../actions'
import CompanyProfileViews from './CompanyProfileViews'

export const dynamic = 'force-dynamic'

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const company = await getCompanyById(resolvedParams.id)

  if (!company) {
    notFound()
  }

  return <CompanyProfileViews company={company} />
}
