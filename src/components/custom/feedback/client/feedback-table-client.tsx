'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DataTable } from '@/components/custom/feedback/data-table'
import { useCreateFeedbackColumns } from '@/components/custom/feedback/columns'
import type { Feedback } from '@prisma/client'

export interface FeedbackRow extends Feedback {
    submitterName: string | null
    user: { name: string; email: string; image: string | null } | null
}

interface FeedbackTableClientProps {
    feedback: FeedbackRow[]
    role?: string
}

export function FeedbackTableClient({ feedback: initialFeedback, role }: FeedbackTableClientProps) {
    const { data: session, status } = useSession()
    const [feedback, setFeedback] = useState<FeedbackRow[]>([])

    useEffect(() => {
        // Ensure that user is never undefined by defaulting to null
        setFeedback(
            initialFeedback.map(item => ({
                ...item,
                user: item.user ?? null,
            }))
        )
    }, [initialFeedback])

    const handleFeedbackUpdate = (updatedFeedback: FeedbackRow) => {
        setFeedback(prev =>
            prev.map(f => (f.id === updatedFeedback.id ? updatedFeedback : f))
        )
    }

    const handleFeedbackDelete = (deletedFeedbackId: string) => {
        setFeedback(prev => prev.filter(f => f.id !== deletedFeedbackId))
    }

    const columns = useCreateFeedbackColumns(session, handleFeedbackUpdate, handleFeedbackDelete)

    if (status === 'loading') {
        return <div>Loading session...</div>
    }

    return <DataTable data={feedback} columns={columns} selection={false} role={role} />
}
