import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params

  const { status } = await request.json()

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { status: { set: status } },
    })
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Failed to update notification status:', error)
    return NextResponse.json(
      { error: 'Failed to update notification status' },
      { status: 500 }
    )
  }
}
