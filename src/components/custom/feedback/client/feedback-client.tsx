'use client'

import useSWR from 'swr'
import { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Feedback } from '@prisma/client'
import { FeedbackTableClient } from './feedback-table-client'
import type { FeedbackRow } from './feedback-table-client'

interface FeedbackResponse {
    feedback: (Feedback & { submitterName: string | null; user?: { name: string; email: string; image: string | null } })[]
}

const fetcher = async (url: string): Promise<FeedbackRow[]> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Error fetching feedback: ${res.statusText}`)
    }
    const data = (await res.json()) as FeedbackResponse
    // Ensure each item has a defined "user" property (default to null)
    return data.feedback.map(item => ({
        ...item,
        user: item.user ?? null,
    }))
}

export const FeedbackTableSkeleton: FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Loading Feedback</CardTitle>
                <CardDescription>Please wait while we fetch the feedback data...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export const FeedbackClientPage: FC = () => {
    const { data: feedback, error, isLoading } = useSWR<FeedbackRow[]>(
        '/api/feedback',
        fetcher,
        {
            refreshInterval: 5000,
            fallbackData: [],
            revalidateOnFocus: false,
        }
    )

    if (error instanceof Error) {
        return (
            <Card className="p-6">
                <CardTitle className="text-red-600">Error</CardTitle>
                <CardDescription>Failed to load feedback: {error.message}</CardDescription>
            </Card>
        )
    }

    if (isLoading) {
        return <FeedbackTableSkeleton />
    }

    return <FeedbackTableClient feedback={feedback ?? []} />
}
