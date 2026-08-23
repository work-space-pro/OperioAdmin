'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function logVATFiling(prevState: any, formData: FormData) {
  const companyId = formData.get('companyId') as string
  const periodStart = formData.get('periodStart') as string
  const periodEnd = formData.get('periodEnd') as string
  const dueDate = formData.get('dueDate') as string
  
  if (!companyId || !periodStart || !periodEnd || !dueDate) {
    return { error: 'Company, Period, and Due Date are required.' }
  }

  try {
    const data: any = {
      companyId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      dueDate: new Date(dueDate),
      status: formData.get('status') as string || 'Pending',
      notes: formData.get('notes') as string,
    }

    const amountDue = formData.get('amountDue') as string
    if (amountDue) data.amountDue = parseFloat(amountDue)

    const amountPaid = formData.get('amountPaid') as string
    if (amountPaid) data.amountPaid = parseFloat(amountPaid)

    const paymentDate = formData.get('paymentDate') as string
    if (paymentDate) data.paymentDate = new Date(paymentDate)

    const filing = await prisma.vATFiling.create({ data })

    await prisma.activityLog.create({
      data: {
        eventType: 'VAT Filing Logged',
        entityType: 'VATFiling',
        entityId: filing.id,
        description: `Logged VAT filing for period ending ${data.periodEnd.toLocaleDateString()}`,
      }
    })

    // Phase 5 automated reminder
    const reminderDate = new Date(data.dueDate)
    reminderDate.setDate(reminderDate.getDate() - 14) // Remind 14 days before due date

    await prisma.action.create({
      data: {
        title: `VAT Filing Due`,
        description: `VAT filing for period ending ${data.periodEnd.toLocaleDateString()} is due on ${data.dueDate.toLocaleDateString()}`,
        actionType: 'Tax Filing',
        entityType: 'VATFiling',
        entityId: filing.id,
        dueDate: data.dueDate,
        status: 'Pending'
      }
    })

    revalidatePath('/compliance')
    return { success: true }
  } catch (error) {
    console.error('Failed to log VAT filing:', error)
    return { error: 'Failed to log VAT filing. Please check the inputs.' }
  }
}
