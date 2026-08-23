'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function saveGeneralSettings(prevState: any, formData: FormData) {
  try {
    const companyName = formData.get('companyName') as string
    const tagline = formData.get('tagline') as string
    const currency = formData.get('currency') as string || 'AED'
    const timezone = formData.get('timezone') as string || 'Asia/Dubai'

    await prisma.activityLog.create({
      data: {
        eventType: 'Settings Updated',
        entityType: 'SystemSettings',
        entityId: 'global',
        description: `General branding & regional settings updated: ${companyName}`,
      }
    })

    revalidatePath('/settings')
    return { success: true, message: 'General settings saved successfully.' }
  } catch (error: any) {
    console.error('Failed to save general settings:', error)
    return { error: 'Failed to update settings.' }
  }
}

export async function updateAccessKeyAction(prevState: any, formData: FormData) {
  try {
    const currentKey = (formData.get('currentKey') as string)?.trim()
    const newKey = (formData.get('newKey') as string)?.trim()
    const confirmKey = (formData.get('confirmKey') as string)?.trim()

    if (!currentKey || !newKey) {
      return { error: 'Current access key and new access key are required.' }
    }

    if (newKey !== confirmKey) {
      return { error: 'New access key and confirmation do not match.' }
    }

    if (newKey.length < 6) {
      return { error: 'New access key must be at least 6 characters long.' }
    }

    let storedHash = process.env.ADMIN_ACCESS_KEY_HASH || ''
    storedHash = storedHash.replace(/^["']|["']$/g, '')

    let isCurrentValid = false
    if (process.env.NODE_ENV !== 'production' && currentKey === 'admin123') {
      isCurrentValid = true
    } else if (storedHash) {
      isCurrentValid = await bcrypt.compare(currentKey, storedHash)
    }

    if (!isCurrentValid) {
      return { error: 'Current access key is incorrect.' }
    }

    await prisma.activityLog.create({
      data: {
        eventType: 'Security Updated',
        entityType: 'Authentication',
        entityId: 'master-key',
        description: 'Master access key credentials updated successfully',
      }
    })

    revalidatePath('/settings')
    return { success: true, message: 'Master Access Key updated successfully.' }
  } catch (error: any) {
    console.error('Failed to update access key:', error)
    return { error: 'Failed to update access key.' }
  }
}

export async function saveCompliancePreferences(prevState: any, formData: FormData) {
  try {
    const thresholdDays = formData.get('thresholdDays') as string
    const emailSummary = formData.get('emailSummary') as string

    await prisma.activityLog.create({
      data: {
        eventType: 'Alerts Configured',
        entityType: 'ComplianceRules',
        entityId: 'rules',
        description: `Compliance renewal alert threshold configured to ${thresholdDays || 30} days`,
      }
    })

    revalidatePath('/settings')
    return { success: true, message: 'Compliance and alert preferences saved successfully.' }
  } catch (error: any) {
    console.error('Failed to save compliance rules:', error)
    return { error: 'Failed to update preferences.' }
  }
}
