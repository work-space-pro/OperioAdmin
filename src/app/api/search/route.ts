import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const [clients, companies, services] = await Promise.all([
      prisma.client.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { mobileNumber: { contains: q, mode: 'insensitive' } },
          ],
          archivedAt: null,
        },
        take: 5,
        select: { id: true, fullName: true, clientType: true }
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { legalName: { contains: q, mode: 'insensitive' } },
            { tradeName: { contains: q, mode: 'insensitive' } },
            { tradeLicenceNumber: { contains: q, mode: 'insensitive' } },
          ],
          archivedAt: null,
        },
        take: 5,
        select: { id: true, legalName: true, clientId: true }
      }),
      prisma.service.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' }
        },
        take: 5,
        select: { id: true, name: true, category: true, clientId: true }
      })
    ])

    const results = [
      ...clients.map(c => ({
        id: `client-${c.id}`,
        title: c.fullName,
        subtitle: c.clientType,
        type: 'client',
        href: `/clients/${c.id}`
      })),
      ...companies.map(c => ({
        id: `company-${c.id}`,
        title: c.legalName,
        subtitle: 'Company',
        type: 'company',
        href: `/clients/${c.clientId}`
      })),
      ...services.map(s => ({
        id: `service-${s.id}`,
        title: s.name,
        subtitle: s.category,
        type: 'service',
        href: `/clients/${s.clientId}`
      }))
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
