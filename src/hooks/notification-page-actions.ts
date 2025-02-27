'use client'

import { useCallback, useEffect, useState } from 'react'
import { Notification, NotificationStatus } from '@prisma/client'

type MarkAsReadInput = {
  id: string
  read: boolean
}

type MarkAsStatusInput = {
  id: string
  status: NotificationStatus[]
}

export function useNotificationPageActions(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all notifications for the given userId
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications/page?userId=${userId}`)

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Failed to fetch notifications')
      }

      if (response.status === 204) {
        setNotifications([])
        return
      }

      const contentType = response.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        setNotifications(data)
      } else {
        throw new Error('Expected JSON response but got something else')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Mark a notification as read with optimistic updates
  const markAsRead = async (input: MarkAsReadInput) => {
    try {
      // Optimistic update
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === input.id ? { ...notification, read: input.read } : notification
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
        // Revert optimistic update if API call fails
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === input.id
              ? { ...notification, read: !input.read }
              : notification
          )
        )
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark notification as read')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
      console.error(err)
    }
  }

  // Update the notification status (archive or favorite)
  const updateNotificationStatus = async (input: MarkAsStatusInput) => {
    try {
      // Find the original notification to save its state for potential rollback
      const originalNotification = notifications.find(n => n.id === input.id)
      if (!originalNotification) {
        throw new Error(`Notification with ID ${input.id} not found`)
      }

      const originalStatus = [...originalNotification.status] // Create a copy of the original status

      // Make sure we're working with a proper array of NotificationStatus
      const statusArray = Array.isArray(input.status) ? input.status : [input.status]

      // Optimistic update
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === input.id ? { ...notification, status: statusArray } : notification
        )
      )

      // Make the API call to the correct endpoint
      const response = await fetch(`/api/notifications/${input.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusArray }),
      })

      if (!response.ok) {
        // Revert the optimistic update if the API call fails
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === input.id ? { ...notification, status: originalStatus } : notification
          )
        )

        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update notification status')
      }

      // If successful, update with the response data
      const updatedNotification = await response.json()
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === input.id ? { ...notification, ...updatedNotification } : notification
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification status')
      console.error(err)
    }
  }

  // Toggle archive status for a notification
  const archiveNotification = (id: string) => {
    const notification = notifications.find((notif) => notif.id === id)
    if (!notification) return

    // Create a properly typed status array
    const currentStatus = notification.status as unknown as NotificationStatus[]
    let updatedStatus: NotificationStatus[]

    if (currentStatus.includes(NotificationStatus.archive)) {
      // Remove archive status if it exists
      updatedStatus = currentStatus.filter(status => status !== NotificationStatus.archive)
    } else {
      // Add archive status if it doesn't exist
      updatedStatus = [...currentStatus, NotificationStatus.archive]
    }

    // Call updateNotificationStatus with the new status array
    updateNotificationStatus({ id, status: updatedStatus })
  }

  // Toggle favorite status for a notification
  const favoriteNotification = (id: string) => {
    const notification = notifications.find((notif) => notif.id === id)
    if (!notification) return

    // Create a properly typed status array
    const currentStatus = notification.status as unknown as NotificationStatus[]
    let updatedStatus: NotificationStatus[]

    if (currentStatus.includes(NotificationStatus.favorite)) {
      // Remove favorite status if it exists
      updatedStatus = currentStatus.filter(status => status !== NotificationStatus.favorite)
    } else {
      // Add favorite status if it doesn't exist
      updatedStatus = [...currentStatus, NotificationStatus.favorite]
    }

    // Call updateNotificationStatus with the new status array
    updateNotificationStatus({ id, status: updatedStatus })
  }

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    fetchNotifications,
    archiveNotification,
    favoriteNotification,
  }
}