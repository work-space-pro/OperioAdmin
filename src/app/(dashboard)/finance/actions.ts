'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

export async function recordExpenseAction(prevState: any, formData: FormData) {
  try {
    const title = (formData.get('title') as string)?.trim()
    const category = (formData.get('category') as string)?.trim() || 'Government Fees'
    const amountStr = (formData.get('amount') as string)?.trim()
    const expenseDateStr = (formData.get('expenseDate') as string)?.trim()
    const paymentMethod = (formData.get('paymentMethod') as string)?.trim() || 'Bank Transfer'
    const vendorName = (formData.get('vendorName') as string)?.trim() || null
    const receiptRef = (formData.get('receiptRef') as string)?.trim() || null
    const description = (formData.get('description') as string)?.trim() || null
    const status = (formData.get('status') as string)?.trim() || 'Paid'

    if (!title || !amountStr) {
      return { error: 'Expense title and amount (AED) are required.' }
    }

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      return { error: 'Please enter a valid positive expense amount.' }
    }

    const expenseDate = expenseDateStr ? new Date(expenseDateStr) : new Date()

    await prisma.expense.create({
      data: {
        title,
        category,
        amount,
        currency: 'AED',
        expenseDate,
        paymentMethod,
        vendorName,
        receiptRef,
        description,
        status
      }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Expense Recorded',
        entityType: 'Finance',
        description: `Recorded expense: ${title} (AED ${amount.toLocaleString()}) under ${category}`,
      }
    })

    revalidatePath('/finance')
    revalidatePath('/reports')
    return { success: true, message: `Expense "${title}" of AED ${amount.toLocaleString()} recorded successfully.` }
  } catch (error: any) {
    console.error('Failed to record expense:', error)
    return { error: 'Failed to record expense. Please try again.' }
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const exp = await prisma.expense.delete({
      where: { id }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Expense Deleted',
        entityType: 'Finance',
        entityId: id,
        description: `Deleted expense: ${exp.title} (AED ${exp.amount})`,
      }
    })

    revalidatePath('/finance')
    revalidatePath('/reports')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete expense:', error)
    return { error: 'Failed to delete expense.' }
  }
}

export async function updateServicePaymentAction(serviceId: string, paymentStatus: string) {
  try {
    const srv = await prisma.service.update({
      where: { id: serviceId },
      data: { paymentStatus }
    })

    await prisma.activityLog.create({
      data: {
        eventType: 'Payment Status Updated',
        entityType: 'Service',
        entityId: serviceId,
        description: `Updated fee payment status to ${paymentStatus} for package ${srv.name}`,
      }
    })

    revalidatePath('/finance')
    revalidatePath('/reports')
    revalidatePath('/clients')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update service payment status:', error)
    return { error: 'Failed to update payment status.' }
  }
}
