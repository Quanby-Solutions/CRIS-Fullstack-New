import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/custom/feedback/data-table'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

async function getFeedback() {
  const feedback = await prisma.feedback.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return feedback.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }))
}

function FeedbackTableSkeleton() {
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

export default async function FeedbackPage() {
  const feedback = await getFeedback()

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex-none'>
        <DashboardHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard', active: false },
            { label: 'Feedback', href: '/feedback', active: true },
          ]}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <Suspense fallback={<FeedbackTableSkeleton />}>
              <DataTable
                data={feedback}
                selection={false}
              />
            </Suspense>
          </div>
        </ScrollArea>
      </div>
    </div>

  )
}
