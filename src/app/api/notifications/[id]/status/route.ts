// src\app\api\notifications\[id]\status\route.ts

import { NextResponse } from 'next/server'
import { PrismaClient, NotificationStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { status } = await request.json()

        // Validate that status is an array of valid NotificationStatus values
        if (!Array.isArray(status)) {
            return NextResponse.json(
                { error: 'Status must be an array' },
                { status: 400 }
            )
        }

        // Validate each status value
        const validStatuses = Object.values(NotificationStatus)
        const allStatusesValid = status.every(s => validStatuses.includes(s))

        if (!allStatusesValid) {
            return NextResponse.json(
                { error: 'Invalid status values provided' },
                { status: 400 }
            )
        }

        // Update the notification
        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json(updatedNotification)
    } catch (error) {
        console.error('Error updating notification status:', error)
        return NextResponse.json(
            { error: 'Failed to update notification status' },
            { status: 500 }
        )
    }
}