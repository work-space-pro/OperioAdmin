import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function authenticatePortalUser(email: string, passwordPlain: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      client: {
        include: {
          companies: true,
        },
      },
    },
  })

  if (!user || user.status !== 'Active') {
    return { error: 'Invalid credentials or inactive portal account' }
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash)
  if (!isPasswordValid) {
    return { error: 'Invalid email or password' }
  }

  // Update last login
  await prisma.portalUser.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      clientId: user.clientId,
      authorizedCompanyIds: user.client.companies.map((c) => c.id),
    },
    client: user.client,
  }
}

export async function getPortalUserProfile(userId: string) {
  return prisma.portalUser.findUnique({
    where: { id: userId },
    include: {
      client: {
        include: {
          companies: true,
          documents: true,
          clientRequests: true,
        },
      },
    },
  })
}
