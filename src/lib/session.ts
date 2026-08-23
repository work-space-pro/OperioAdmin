import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'operio_admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function createSession() {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.adminSession.create({
    data: {
      sessionId,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return false
  }

  const session = await prisma.adminSession.findUnique({
    where: { sessionId },
  })

  if (!session || session.expiresAt < new Date()) {
    // If expired, clean it up optionally
    if (session) {
      await prisma.adminSession.delete({ where: { sessionId } })
    }
    return false
  }

  // Extend session optionally or just return true
  return true
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await prisma.adminSession.delete({
      where: { sessionId },
    }).catch(() => {}) // Ignore if not found
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}
