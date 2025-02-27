import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { addClient, removeClient } from '@/lib/sse'

export async function GET(req: NextRequest) {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }

    return new Response(
        new ReadableStream({
            start(controller) {
                // Keep-alive function
                const keepAlive = setInterval(() => {
                    try {
                        controller.enqueue(new TextEncoder().encode(':keep-alive\n\n'))
                    } catch (error) {
                        // If error in keep-alive, clean up
                        clearInterval(keepAlive)
                        try {
                            removeClient(controller)
                        } catch (cleanupError) {
                            console.error('Error removing client during keep-alive failure:', cleanupError)
                        }
                    }
                }, 25000)

                // Register client
                try {
                    addClient({ userId, controller })

                    // Send initial connection message
                    controller.enqueue(new TextEncoder().encode('data: connected\n\n'))
                } catch (error) {
                    console.error('Error during SSE client setup:', error)
                    clearInterval(keepAlive)
                    controller.close()
                    return
                }

                // Handle client disconnect
                req.signal.addEventListener('abort', () => {
                    clearInterval(keepAlive)
                    try {
                        removeClient(controller)
                        controller.close()
                    } catch (error) {
                        console.error('Error during SSE client cleanup:', error)
                    }
                })
            }
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive'
            }
        }
    )
}