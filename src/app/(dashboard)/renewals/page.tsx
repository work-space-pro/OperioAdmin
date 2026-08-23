import React from 'react'
import RenewalsClientView from './RenewalsClientView'
import { getAllRenewals } from './actions'

export const dynamic = 'force-dynamic'

export default async function RenewalsPage() {
  const allRenewals = await getAllRenewals()
  return <RenewalsClientView initialRenewals={allRenewals} />
}
