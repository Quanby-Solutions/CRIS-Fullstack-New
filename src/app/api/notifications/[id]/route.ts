// src/app/api/notifications/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { notifyUser } from '@/lib/sse'

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params
  const { read } = await request.json()

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read,
        readAt: read ? new Date() : null
      },
      include: { user: true }
    })

    if (notification.user?.id) {
      notifyUser(notification.user.id)
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}