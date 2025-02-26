'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Feedback } from '@prisma/client'

interface FeedbackDetailsDialogProps {
    open: boolean
    onOpenChangeAction: (open: boolean) => void
    feedback: Feedback & {
        user: {
            name: string
            email: string
            image: string | null
        } | null
    }
}

export function FeedbackDetailsDialog({
    open,
    onOpenChangeAction,
    feedback,
}: FeedbackDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-w-lg p-4">
                <DialogHeader className="text-center space-y-2">
                    <DialogTitle className="text-lg font-bold">
                        Feedback Details
                    </DialogTitle>
                    <Badge variant="secondary">
                        {feedback.user ? 'User Feedback' : 'Anonymous Feedback'}
                    </Badge>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Detailed information about the feedback submission.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                    <div>
                        <h4 className="text-sm font-medium">Feedback</h4>
                        <p className="text-sm text-gray-600">{feedback.feedback}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Submitted By</h4>
                        <p className="text-sm text-gray-600">
                            {feedback.user ? feedback.user.name : 'Anonymous'}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Email</h4>
                        <p className="text-sm text-gray-600">
                            {feedback.user ? feedback.user.email : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Submitted At</h4>
                        <p className="text-sm text-gray-600">
                            {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
