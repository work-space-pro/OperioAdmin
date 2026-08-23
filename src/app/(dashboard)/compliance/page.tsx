import React from 'react'
import prisma from '@/lib/db'
import ComplianceClientView from './ComplianceClientView'

export const dynamic = 'force-dynamic'

export default async function CompliancePage() {
  const filings = await prisma.vATFiling.findMany({
    include: {
      company: {
        select: {
          id: true,
          legalName: true,
          vatTrn: true,
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  })

  return <ComplianceClientView filings={filings} />
}
