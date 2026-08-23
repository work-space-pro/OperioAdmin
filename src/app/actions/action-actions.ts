'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const actionType = formData.get('actionType') as string
  const priority = formData.get('priority') as string
  const dueDateStr = formData.get('dueDate') as string
  const dueTime = formData.get('dueTime') as string | null
  const clientId = formData.get('clientId') as string | null

  if (!title || !actionType || !priority || !dueDateStr) {
    return { error: 'Missing required fields' }
  }

  const dueDate = new Date(dueDateStr)

  try {
    await prisma.action.create({
      data: {
        title,
        description,
        actionType,
        priority,
        status: 'Pending',
        dueDate,
        dueTime,
        clientId: clientId || null,
        // Since there is no auth yet, we'll hardcode or skip assignedToId
        // In a real app we'd use the logged in user's ID.
      }
    })

    revalidatePath('/')
    revalidatePath('/actions')
    
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create action:', error)
    return { error: 'Failed to create action' }
  }
}
