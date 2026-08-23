import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import PortalProfileView from './PortalProfileView'

export const dynamic = 'force-dynamic'

export default async function PortalProfilePage() {
  const { portalUser, client, companies } = await getAuthenticatedPortalUser()

  return (
    <PortalProfileView
      user={portalUser}
      client={client}
      companies={companies}
    />
  )
}
