// src/lib/sse.ts
// Using WeakMap to avoid memory leaks
const clientMap = new WeakMap<ReadableStreamDefaultController, {
    userId: string;
    lastActivity: number;
}>();

// A separate array for iteration (to avoid WeakMap enumeration limitations)
let clientControllers: ReadableStreamDefaultController[] = [];
const MAX_INACTIVE_TIME = 30000; // 30 seconds

/**
 * Add a new SSE client
 */
export function addClient({ userId, controller }: { userId: string, controller: ReadableStreamDefaultController }) {
    try {
        // Store client info
        clientMap.set(controller, {
            userId,
            lastActivity: Date.now()
        });

        // Add to our list of controllers
        clientControllers.push(controller);

        console.log(`Client added for user ${userId}, total clients: ${clientControllers.length}`);
    } catch (error) {
        console.error("Error adding client:", error);
    }
}

/**
 * Remove an SSE client
 */
export function removeClient(controller: ReadableStreamDefaultController) {
    try {
        // Remove from WeakMap (will be garbage collected automatically)
        clientMap.delete(controller);

        // Remove from our array
        clientControllers = clientControllers.filter(c => c !== controller);

        console.log(`Client removed, remaining clients: ${clientControllers.length}`);
    } catch (error) {
        console.error("Error removing client:", error);
    }
}

/**
 * Notify a specific user of an event
 */
export function notifyUser(userId: string, event = 'update') {
    if (!userId) {
        console.warn("Attempted to notify a user with no userId");
        return;
    }

    let notifiedCount = 0;

    // Create a safe copy of the controllers array to avoid concurrent modification issues
    const controllers = [...clientControllers];

    // Track controllers to remove
    const controllersToRemove: ReadableStreamDefaultController[] = [];

    // Send notifications to matching user's controllers
    for (const controller of controllers) {
        try {
            const clientInfo = clientMap.get(controller);

            // Skip if controller not in map or user doesn't match
            if (!clientInfo || clientInfo.userId !== userId) continue;

            // Try to send the message
            controller.enqueue(new TextEncoder().encode(`data: ${event}\n\n`));
            clientInfo.lastActivity = Date.now();
            notifiedCount++;
        } catch (error) {
            // If error, mark for removal
            console.error(`Error sending notification to user ${userId}:`, error);
            controllersToRemove.push(controller);
        }
    }

    // Clean up any controllers that failed
    controllersToRemove.forEach(controller => {
        removeClient(controller);
    });

    if (notifiedCount > 0) {
        console.log(`Notified ${notifiedCount} connections for user ${userId}`);
    }
}

/**
 * Broadcast to all connected clients
 */
export function broadcastNotification(event = 'update') {
    let successCount = 0;
    let failureCount = 0;

    // Create a safe copy of the controllers array
    const controllers = [...clientControllers];

    // Track controllers to remove
    const controllersToRemove: ReadableStreamDefaultController[] = [];

    // Send to all controllers
    for (const controller of controllers) {
        try {
            controller.enqueue(new TextEncoder().encode(`data: ${event}\n\n`));

            // Update last activity
            const clientInfo = clientMap.get(controller);
            if (clientInfo) {
                clientInfo.lastActivity = Date.now();
            }

            successCount++;
        } catch (error) {
            console.error("Error broadcasting:", error);
            controllersToRemove.push(controller);
            failureCount++;
        }
    }

    // Clean up any controllers that failed
    controllersToRemove.forEach(controller => {
        removeClient(controller);
    });

    if (successCount > 0 || failureCount > 0) {
        console.log(`SSE Broadcast: ${successCount} successful, ${failureCount} failed`);
    }
}

// We'll run cleanup periodically instead of on each operation
let cleanupInterval: NodeJS.Timeout | null = null;

// Set up cleanup interval, but only once
if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
        try {
            const now = Date.now();
            const controllers = [...clientControllers];

            // Track controllers to remove
            const controllersToRemove: ReadableStreamDefaultController[] = [];

            // Check each controller
            for (const controller of controllers) {
                const clientInfo = clientMap.get(controller);

                // If no info or inactive too long, mark for removal
                if (!clientInfo || now - clientInfo.lastActivity > MAX_INACTIVE_TIME) {
                    controllersToRemove.push(controller);
                }
            }

            // Remove inactive controllers
            if (controllersToRemove.length > 0) {
                console.log(`Cleaning up ${controllersToRemove.length} inactive SSE connections`);
                controllersToRemove.forEach(controller => removeClient(controller));
            }
        } catch (error) {
            console.error("Error in SSE cleanup:", error);
        }
    }, 60000); // Run every minute

    // Prevent the interval from keeping Node.js alive
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}