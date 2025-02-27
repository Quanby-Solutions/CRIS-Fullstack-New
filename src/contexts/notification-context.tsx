'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { NotificationStatus, Notification } from '@prisma/client'

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    markAsRead: (input: { id: string; read: boolean }) => Promise<any>
    archiveNotification: (id: string) => Promise<void>
    favoriteNotification: (id: string) => Promise<void>
    fetchNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}

interface NotificationProviderProps {
    userId: string
    children: React.ReactNode
}

export function NotificationProvider({ userId, children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Calculate unread count (all notifications are in state, regardless of read status)
    const unreadCount = notifications.filter(n => !n.read).length

    // Fetch notifications without filtering out any notifications
    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setNotifications([])
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        try {
            const response = await fetch(`/api/notifications?userId=${userId}`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch notifications')
            }
            const data = await response.json()
            setNotifications(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    const markAsRead = async (input: { id: string; read: boolean }) => {
        try {
            // Optimistically update the UI
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === input.id
                        ? { ...notification, read: input.read, readAt: input.read ? new Date() : null }
                        : notification
                )
            )
            const response = await fetch(`/api/notifications/${input.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ read: input.read }),
            })
            if (!response.ok) {
                const errorData = await response.json()
                // Revert optimistic update if API call fails
                setNotifications((prevNotifications) =>
                    prevNotifications.map((notification) =>
                        notification.id === input.id
                            ? { ...notification, read: !input.read, readAt: !input.read ? new Date() : null }
                            : notification
                    )
                )
                throw new Error(errorData.error || 'Failed to mark notification as read')
            }
            return await response.json()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
            console.error(err)
            throw err
        }
    }

    const archiveNotification = async (id: string) => {
        try {
            const notification = notifications.find(n => n.id === id)
            if (!notification) return
            const typedStatus = notification.status as unknown as NotificationStatus[]
            const isArchived = typedStatus.includes(NotificationStatus.archive)
            let newStatus: NotificationStatus[]
            if (isArchived) {
                newStatus = typedStatus.filter(s => s !== NotificationStatus.archive)
            } else {
                newStatus = [...typedStatus, NotificationStatus.archive]
            }
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, status: newStatus as any } : n)
            )
            const response = await fetch(`/api/notifications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, status: notification.status } : n)
                )
                throw new Error('Failed to update notification status')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to archive notification')
            console.error(err)
        }
    }

    const favoriteNotification = async (id: string) => {
        try {
            const notification = notifications.find(n => n.id === id)
            if (!notification) return
            const typedStatus = notification.status as unknown as NotificationStatus[]
            const isFavorite = typedStatus.includes(NotificationStatus.favorite)
            let newStatus: NotificationStatus[]
            if (isFavorite) {
                newStatus = typedStatus.filter(s => s !== NotificationStatus.favorite)
            } else {
                newStatus = [...typedStatus, NotificationStatus.favorite]
            }
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, status: newStatus as any } : n)
            )
            const response = await fetch(`/api/notifications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, status: notification.status } : n)
                )
                throw new Error('Failed to update notification status')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to favorite notification')
            console.error(err)
        }
    }

    // SSE setup for real-time updates
    useEffect(() => {
        let eventSource: EventSource | null = null
        let reconnectTimeout: NodeJS.Timeout | null = null

        const setupEventSource = () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
                reconnectTimeout = null
            }
            if (eventSource) {
                eventSource.close()
            }
            eventSource = new EventSource('/api/sse', { withCredentials: true })
            eventSource.onmessage = (e) => {
                if (e.data === 'update') {
                    fetchNotifications()
                }
            }
            eventSource.onerror = () => {
                if (eventSource) {
                    eventSource.close()
                    eventSource = null
                }
                reconnectTimeout = setTimeout(() => {
                    setupEventSource()
                }, 5000)
            }
        }

        if (userId) {
            setupEventSource()
        }

        return () => {
            if (eventSource) {
                eventSource.close()
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
            }
        }
    }, [fetchNotifications, userId])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        archiveNotification,
        favoriteNotification,
        fetchNotifications,
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}
