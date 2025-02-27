// src\app\api\notifications\trigger\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notifyUser } from '@/lib/sse'

// This API endpoint is used to trigger SSE updates for specific users
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        // Only allow authenticated users to trigger notifications
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the userId from request body
        const body = await request.json().catch(() => ({}))
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        // Trigger notification update via SSE
        try {
            notifyUser(userId)
            return NextResponse.json({ success: true })
        } catch (error) {
            console.error(`Error notifying user ${userId}:`, error)
            return NextResponse.json(
                { error: 'Failed to trigger notification', details: String(error) },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error processing notification trigger:', error)
        return NextResponse.json(
            { error: 'Failed to process notification trigger' },
            { status: 500 }
        )
    }
}