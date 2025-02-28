import { Suspense } from 'react'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Breadcrumb } from '@/types/dashboard'
import { FeedbackClientPage, FeedbackTableSkeleton } from '@/components/custom/feedback/client/feedback-client'

const breadcrumbs: Breadcrumb[] = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Feedback', href: '/feedback', active: true },
]

export default function FeedbackPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none">
      <DashboardHeader breadcrumbs={breadcrumbs} />
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
          <Suspense fallback={<FeedbackTableSkeleton />}>
            <FeedbackClientPage />
           </Suspense>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
