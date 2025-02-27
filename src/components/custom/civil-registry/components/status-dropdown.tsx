'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentStatus, Permission } from '@prisma/client'
import { updateFormStatus } from '@/hooks/update-status-action'
import { notifyUsersWithPermission } from '@/hooks/users-action'
import clsx from 'clsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/contexts/notification-context' // Import the notification context

export const statusVariants: Record<
  DocumentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive'; bgColor: string }
> = {
  PENDING: {
    label: 'Pending',
    variant: 'secondary',
    bgColor: 'bg-yellow-500/30 dark:bg-yellow-500/50 dark:text-accent-foreground text-yellow-800',
  },
  VERIFIED: {
    label: 'Verified',
    variant: 'default',
    bgColor: 'bg-blue-500/30 dark:bg-blue-500/50 dark:text-accent-foreground text-blue-800',
  },
  LATE_REGISTRATION: {
    label: 'Late Registration',
    variant: 'destructive',
    bgColor: 'bg-red-500/30 dark:bg-red-500/50 dark:text-accent-foreground text-red-800',
  },
  READY_FOR_RELEASE: {
    label: 'Ready for Release',
    variant: 'default',
    bgColor: 'bg-green-500/30 dark:bg-green-500/50 dark:text-accent-foreground text-green-800',
  },
  RELEASED: {
    label: 'Released',
    variant: 'default',
    bgColor: 'bg-muted/50 text-accent-foreground',
  },
}

interface StatusSelectProps {
  formId: string
  registryNumber: string
  bookNumber: string
  pageNumber: string
  formType: string
  currentStatus: DocumentStatus
  onStatusChange?: (newStatus: DocumentStatus) => void
}

export default function StatusSelect({
  formId,
  registryNumber,
  bookNumber,
  pageNumber,
  formType,
  currentStatus,
  onStatusChange,
}: StatusSelectProps) {
  const router = useRouter()
  const { fetchNotifications } = useNotifications() // Get fetchNotifications from the context
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<DocumentStatus>(currentStatus)
  const [pendingStatus, setPendingStatus] = useState<DocumentStatus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Update local state if props change (e.g., from a parent component refresh)
  useEffect(() => {
    if (currentStatus !== status && !loading) {
      setStatus(currentStatus)
    }
  }, [currentStatus, loading, status])

  const handleConfirm = async () => {
    if (!pendingStatus) return
    setDialogOpen(false)
    setLoading(true)

    try {
      // Update local state immediately for optimistic UI
      const newStatus = pendingStatus
      setStatus(newStatus)

      // Update the form status in the database
      await updateFormStatus(formId, newStatus)

      // Create notification message content
      const statusLabel = statusVariants[newStatus].label
      const title = `Form Certificate Status Updated to ${statusLabel}`
      const message = `Form certificate with (Book: ${bookNumber}, Page: ${pageNumber}, Registry Number: ${registryNumber}, Form Type: ${formType}) has been updated to ${statusLabel}.`

      // Send notifications to users with DOCUMENT_READ permission
      await notifyUsersWithPermission(Permission.DOCUMENT_READ, title, message)

      // Client-side notification refresh
      try {
        // Call broadcast API to update all clients
        await fetch('/api/notifications/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceUpdate: true }),
        })

        // Manually refresh notifications in the current client
        await fetchNotifications()

        // Force refresh client-side data
        router.refresh()
      } catch (broadcastError) {
        console.error('Failed to broadcast notification update:', broadcastError)
      }

      // Show success message
      toast.success('Status updated successfully')

      // Notify parent component if callback provided
      onStatusChange?.(newStatus)
    } catch (error: unknown) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
      // Revert to the original status on error
      setStatus(currentStatus)
    } finally {
      setLoading(false)
      setPendingStatus(null)

      // Final router refresh to ensure everything is up to date
      setTimeout(() => {
        router.refresh()
      }, 500)

      // Refresh notifications one more time after a delay
      setTimeout(() => {
        fetchNotifications()
      }, 1000)
    }
  }

  const handleCancel = () => {
    setPendingStatus(null)
    setDialogOpen(false)
  }

  return (
    <>
      <Select
        value={status}
        onValueChange={(newStatus) => {
          if (newStatus === status || loading) return
          setPendingStatus(newStatus as DocumentStatus)
          setDialogOpen(true)
        }}
        disabled={loading}
      >
        <SelectTrigger
          className={clsx(
            'w-[180px] rounded-md border shadow-sm px-4 py-2',
            statusVariants[status].bgColor,
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Updating...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select status" />
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusVariants).map(([statusKey, statusInfo]) => (
            <SelectItem key={statusKey} value={statusKey} className="py-2 px-4 rounded-md">
              {statusInfo.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!loading) setDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status to{' '}
              {pendingStatus ? statusVariants[pendingStatus].label : ''}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : 'Confirm'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}