'use client'

import React from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Feedback } from '@prisma/client'

interface DeleteFeedbackDialogProps {
    open: boolean
    onOpenChangeAction: (open: boolean) => void
    feedback: Feedback
    onDeleteSuccessAction: () => void
}

export function DeleteFeedbackDialog({
    open,
    onOpenChangeAction,
    feedback,
    onDeleteSuccessAction,
}: DeleteFeedbackDialogProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const response = await fetch(`/api/feedback/${feedback.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete feedback')
            }

            toast.success('Feedback deleted successfully!')
            onOpenChangeAction(false)
            onDeleteSuccessAction()
        } catch (error) {
            console.error('Error deleting feedback:', error)
            toast.error(
                error instanceof Error ? error.message : 'Failed to delete feedback'
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-w-sm p-4">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Are you sure you want to delete this feedback? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChangeAction(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
