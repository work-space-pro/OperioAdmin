import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import crypto from 'crypto'

export const PORTAL_SESSION_COOKIE_NAME = 'operio_portal_session'
const PORTAL_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createPortalSession(portalUserId: string) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + PORTAL_SESSION_DURATION_MS)

  await prisma.portalSession.create({
    data: {
      portalUserId,
      sessionId,
      expiresAt,
    },
  })

  // Update last login
  await prisma.portalUser.update({
    where: { id: portalUserId },
    data: { lastLogin: new Date() }
  }).catch(() => {})

  const cookieStore = await cookies()
  cookieStore.set(PORTAL_SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return sessionId
}

export async function verifyPortalSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const session = await prisma.portalSession.findUnique({
    where: { sessionId },
    include: {
      portalUser: {
        include: {
          client: {
            include: {
              companies: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.portalSession.delete({ where: { sessionId } }).catch(() => {})
    }
    return null
  }

  // Check if portal user is active
  if (session.portalUser.status !== 'Active') {
    return null
  }

  return session
}

export async function deletePortalSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await prisma.portalSession.delete({
      where: { sessionId },
    }).catch(() => {})
  }

  cookieStore.delete(PORTAL_SESSION_COOKIE_NAME)
}
