'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentStatus, Permission } from '@prisma/client'
import { updateFormStatus } from '@/hooks/update-status-action'
import { notifyUsersWithPermission } from '@/hooks/users-action'
import clsx from 'clsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/types/auth'
import { useNotifications } from '@/contexts/notification-context'
import { useUser } from '@/context/user-context'

export const statusVariants: Record<
  DocumentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive'; bgColor: string }
> = {
  PENDING: {
    label: 'Pending',
    variant: 'secondary',
    bgColor:
      'bg-yellow-500/30 dark:bg-yellow-500/50 dark:text-accent-foreground text-yellow-800',
  },
  VERIFIED: {
    label: 'Verified',
    variant: 'default',
    bgColor:
      'bg-blue-500/30 dark:bg-blue-500/50 dark:text-accent-foreground text-blue-800',
  },
  LATE_REGISTRATION: {
    label: 'Late Registration',
    variant: 'destructive',
    bgColor:
      'bg-red-500/30 dark:bg-red-500/50 dark:text-accent-foreground text-red-800',
  },
  READY_FOR_RELEASE: {
    label: 'Ready for Release',
    variant: 'default',
    bgColor:
      'bg-green-500/30 dark:bg-green-500/50 dark:text-accent-foreground text-green-800',
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
  const { fetchNotifications } = useNotifications()
  const { permissions } = useUser()
  const canVerify = hasPermission(permissions, Permission.DOCUMENT_VERIFY)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<DocumentStatus>(currentStatus)
  const [pendingStatus, setPendingStatus] = useState<DocumentStatus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
      const newStatus = pendingStatus
      setStatus(newStatus)
      await updateFormStatus(formId, newStatus)

      const statusLabel = statusVariants[newStatus].label
      const title = `Form Certificate Status Updated to ${statusLabel}`
      const message = `Form certificate (Book: ${bookNumber}, Page: ${pageNumber}, Registry Number: ${registryNumber}, Form Type: ${formType}) has been updated to ${statusLabel}.`

      await notifyUsersWithPermission(Permission.DOCUMENT_READ, title, message)
      await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceUpdate: true }),
      })
      await fetchNotifications()
      router.refresh()

      toast.success('Status updated successfully')
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
      setStatus(currentStatus)
    } finally {
      setLoading(false)
      setPendingStatus(null)
      setTimeout(() => router.refresh(), 500)
      setTimeout(() => fetchNotifications(), 1000)
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
          // prevent changing to VERIFIED if no permission
          if (newStatus === DocumentStatus.VERIFIED && !canVerify) return
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
          {Object.entries(statusVariants).map(([statusKey, statusInfo]) => {
            const isVerified = statusKey === DocumentStatus.VERIFIED
            const disabled = isVerified && !canVerify

            return (
              <SelectItem
                key={statusKey}
                value={statusKey}
                disabled={disabled}
                className={clsx(
                  'py-2 px-4 rounded-md',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {statusInfo.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!loading) setDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status to{' '}
              {pendingStatus ? statusVariants[pendingStatus].label : ''}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
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
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
