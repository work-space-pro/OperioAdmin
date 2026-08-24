'use server'

import { revalidatePath } from 'next/cache'
import { getAuthenticatedPortalUser } from '@/lib/portalAuth'
import { createRenewalRequest } from '@/services'

export async function requestRenewalAction(renewalItem: {
  title: string
  type: string
  companyId?: string
  expiryDate?: string
}) {
  try {
    const { client, portalUser } = await getAuthenticatedPortalUser()

    const result = await createRenewalRequest({
      title: renewalItem.title,
      type: renewalItem.type,
      companyId: renewalItem.companyId,
      expiryDate: renewalItem.expiryDate,
      clientId: client.id,
      portalUserId: portalUser.id,
    })

    revalidatePath('/portal/renewals')
    revalidatePath('/portal')
    revalidatePath('/actions')
    return { success: true, requestNumber: result.requestNumber }
  } catch (error: any) {
    return { error: error.message || 'Failed to submit renewal request' }
  }
}
