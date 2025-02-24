'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentStatus } from '@prisma/client'
import { updateFormStatus } from '@/hooks/update-status-action'
import clsx from 'clsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
  currentStatus: DocumentStatus
  onStatusChange?: (newStatus: DocumentStatus) => void
}

export default function StatusSelect({ formId, currentStatus, onStatusChange }: StatusSelectProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<DocumentStatus>(currentStatus)
  const [pendingStatus, setPendingStatus] = useState<DocumentStatus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleConfirm = async () => {
    if (!pendingStatus) return
    setDialogOpen(false)
    setLoading(true)
    try {
      // Update local state immediately for a responsive UI
      setStatus(pendingStatus)

      // Then update on the server
      await updateFormStatus(formId, pendingStatus)
      toast.success('Status updated successfully')

      // Notify parent component about the status change
      onStatusChange?.(pendingStatus)
    } catch (error: unknown) {
      console.error(error)
      toast.error('Failed to update status')

      // Revert to previous status on error
      setStatus(currentStatus)
    } finally {
      setLoading(false)
      setPendingStatus(null)
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
          if (newStatus === status) return
          setPendingStatus(newStatus as DocumentStatus)
          setDialogOpen(true)
        }}
      >
        <SelectTrigger
          disabled={loading}
          className={clsx(
            'w-[180px] rounded-md border shadow-sm px-4 py-2',
            statusVariants[status].bgColor
          )}
        >
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusVariants).map(([statusKey, statusInfo]) => (
            <SelectItem key={statusKey} value={statusKey} className="py-2 px-4 rounded-md">
              {statusInfo.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ShadCN‑style modal for confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
