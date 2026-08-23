import React from 'react'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import NewApplicationWizard from './NewApplicationWizard'

export const dynamic = 'force-dynamic'

export default async function NewApplicationPage() {
  const { client, companies } = await getAuthenticatedPortalUser()

  return (
    <NewApplicationWizard
      client={client}
      companies={companies}
    />
  )
}
