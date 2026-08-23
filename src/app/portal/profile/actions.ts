'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'

export async function updatePortalPasswordAction(prevState: any, formData: FormData) {
  try {
    const { portalUser } = await getAuthenticatedPortalUser()

    const currentPassword = (formData.get('currentPassword') as string)?.trim()
    const newPassword = (formData.get('newPassword') as string)?.trim()
    const confirmPassword = (formData.get('confirmPassword') as string)?.trim()

    if (!currentPassword || !newPassword) {
      return { error: 'Current password and new password are required.' }
    }

    if (newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' }
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match.' }
    }

    const userInDb = await prisma.portalUser.findUnique({
      where: { id: portalUser.id },
    })

    if (!userInDb) {
      return { error: 'User record not found.' }
    }

    const isMatch = await bcrypt.compare(currentPassword, userInDb.passwordHash)
    if (!isMatch) {
      return { error: 'Current password is incorrect.' }
    }

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: { passwordHash: newHash },
    })

    revalidatePath('/portal/profile')
    return { success: true, message: 'Password updated successfully!' }
  } catch (error: any) {
    return { error: error.message || 'Failed to update password.' }
  }
}
