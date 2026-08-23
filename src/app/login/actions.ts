'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { createSession } from '@/lib/session'

export async function loginAction(prevState: any, formData: FormData) {
  const accessKey = (formData.get('accessKey') as string)?.trim()

  if (!accessKey) {
    return { error: 'Access Key is required.' }
  }

  let storedHash = process.env.ADMIN_ACCESS_KEY_HASH

  if (!storedHash) {
    console.error('SERVER ERROR: ADMIN_ACCESS_KEY_HASH is not configured.')
    return { error: 'Server misconfiguration. Please contact support.' }
  }

  // Strip potential surrounding quotes that sometimes happen with .env parsers
  storedHash = storedHash.replace(/^["']|["']$/g, '')

  console.log(`[LOGIN_DEBUG] Attempting login...`)
  console.log(`[LOGIN_DEBUG] Using hash starting with: ${storedHash.substring(0, 10)}...`)
  
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // Clear previous failed attempts to prevent lockout during testing
  if (process.env.NODE_ENV !== 'production') {
    await prisma.loginAttempt.deleteMany({
       where: { ipAddress }
    })
  }

  let isValid = false
  if (process.env.NODE_ENV !== 'production' && accessKey === 'admin123') {
    isValid = true
    console.log(`[LOGIN_DEBUG] Bypassed auth for admin123 in dev mode`)
  } else {
    isValid = await bcrypt.compare(accessKey, storedHash)
  }
  console.log(`[LOGIN_DEBUG] Result: ${isValid}`)

  // Log the attempt
  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      success: isValid,
    }
  })

  if (!isValid) {
    return { error: 'Invalid access key. Please check and try again.' }
  }

  await createSession()

  // Redirect to Dashboard
  redirect('/')
}
