// src\app\api\notifications\broadcast\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { broadcastNotification } from '@/lib/sse'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        // Only allow authenticated users to broadcast notifications
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get optional parameters from request
        let forceUpdate = false;
        try {
            const body = await request.json();
            forceUpdate = !!body?.forceUpdate;
        } catch (e) {
            // Ignore JSON parse errors
        }

        // Broadcast directly using the SSE library
        broadcastNotification('update');

        // Force revalidation of notification-related paths to ensure UI updates
        if (forceUpdate) {
            revalidatePath('/api/notifications');

            // For Next.js edge cases, we can also revalidate related paths
            try {
                revalidatePath('/api/users/*/notifications');
            } catch (e) {
                // Ignore errors from wildcard revalidation
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error broadcasting notification:', error)
        return NextResponse.json(
            { error: 'Failed to broadcast notification' },
            { status: 500 }
        )
    }
}