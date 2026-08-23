import { NextResponse } from 'next/server'
import { deletePortalSession } from '@/lib/portalSession'

export async function GET(request: Request) {
  await deletePortalSession()
  return NextResponse.redirect(new URL('/portal/login', request.url))
}

export async function POST(request: Request) {
  await deletePortalSession()
  return NextResponse.redirect(new URL('/portal/login', request.url))
}
