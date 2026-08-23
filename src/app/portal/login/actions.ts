'use server'

import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '@/lib/db'
import { createPortalSession, deletePortalSession } from '@/lib/portalSession'

export async function portalLoginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = (formData.get('password') as string)?.trim()

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  const portalUser = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      client: true,
    },
  })

  if (!portalUser) {
    return { error: 'Invalid email or password.' }
  }

  if (portalUser.status === 'Suspended') {
    return { error: 'Your portal access is suspended. Please contact our support team.' }
  }

  if (portalUser.status === 'Inactive') {
    return { error: 'Your account is currently inactive. Please contact support.' }
  }

  // Check password
  const isMatch = await bcrypt.compare(password, portalUser.passwordHash)

  if (!isMatch) {
    return { error: 'Invalid email or password.' }
  }

  // Create Portal Session
  await createPortalSession(portalUser.id)

  return { success: true }
}

export async function portalForgotPasswordAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { error: 'Please enter your registered email address.' }
  }

  const portalUser = await prisma.portalUser.findUnique({
    where: { email },
  })

  if (!portalUser) {
    // For security reasons, still show a friendly message
    return { success: true, message: 'If an account exists with this email, password reset instructions have been generated.' }
  }

  const resetToken = crypto.randomBytes(24).toString('hex')
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.portalUser.update({
    where: { id: portalUser.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    },
  })

  return { 
    success: true, 
    message: `Password reset request created. (For testing/demo: token is ${resetToken})`,
    token: resetToken 
  }
}

export async function portalResetPasswordAction(prevState: any, formData: FormData) {
  const token = (formData.get('token') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const confirmPassword = (formData.get('confirmPassword') as string)?.trim()

  if (!token || !password) {
    return { error: 'Token and new password are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const portalUser = await prisma.portalUser.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  })

  if (!portalUser) {
    return { error: 'Invalid or expired reset token.' }
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  await prisma.portalUser.update({
    where: { id: portalUser.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      status: 'Active',
    },
  })

  return { success: true, message: 'Password has been reset successfully! You can now log in.' }
}

export async function portalLogoutAction() {
  await deletePortalSession()
}
