'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DocumentStatus } from '@prisma/client'

export async function updateFormStatus(formId: string, status: DocumentStatus) {
  const session = await auth()
  if (!session) {
    throw new Error('User not authenticated')
  }

  // Build the update data object with status
  const data: { status: DocumentStatus; verifiedBy?: any } = { status }

  if (status === DocumentStatus.VERIFIED) {
    data.verifiedBy = { connect: { id: session.user.id } }
  } else if (status === DocumentStatus.PENDING) {
    data.verifiedBy = { disconnect: true }
  }

  return await prisma.baseRegistryForm.update({
    where: { id: formId },
    data,
  })
}
