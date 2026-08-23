'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function createEmployee(prevState: any, formData: FormData) {
  const companyId = formData.get('companyId') as string
  const fullName = formData.get('fullName') as string
  
  if (!companyId || !fullName) {
    return { error: 'Company and Full Name are required.' }
  }

  try {
    const data: any = {
      companyId,
      fullName,
      designation: formData.get('designation') as string,
      nationality: formData.get('nationality') as string,
      passportNumber: formData.get('passportNumber') as string,
      visaType: formData.get('visaType') as string,
      emiratesId: formData.get('emiratesId') as string,
      status: 'Active'
    }

    const visaExpiryDate = formData.get('visaExpiryDate') as string
    if (visaExpiryDate) {
      data.visaExpiryDate = new Date(visaExpiryDate)
    }

    const employee = await prisma.employee.create({ data })

    await prisma.activityLog.create({
      data: {
        eventType: 'Employee Added',
        entityType: 'Employee',
        entityId: employee.id,
        description: `Added employee: ${fullName}`,
      }
    })

    if (visaExpiryDate) {
      const dueDate = new Date(visaExpiryDate)
      const reminderDate = new Date(dueDate)
      reminderDate.setDate(reminderDate.getDate() - 30)

      await prisma.action.create({
        data: {
          title: `Visa Expiry: ${fullName}`,
          description: `Visa for employee ${fullName} is expiring on ${dueDate.toLocaleDateString()}`,
          actionType: 'Renewal follow-up',
          entityType: 'Employee',
          entityId: employee.id,
          dueDate: dueDate,
          status: 'Pending'
        }
      })
    }

    revalidatePath('/employees')
    return { success: true }
  } catch (error) {
    console.error('Failed to create employee:', error)
    return { error: 'Failed to create employee. Please check the inputs.' }
  }
}
