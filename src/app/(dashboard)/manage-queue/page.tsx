// src\app\(dashboard)\manage-queue\page.tsx
import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header"
import { QueueManagement } from "@/components/custom/manage-queue/management"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function ManageQueue() {

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs={[
            { label: 'Manage Queue', href: '/manage-queue', active: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <ScrollArea className="h-full">
              <QueueManagement />
            </ScrollArea>
          </div>
        </ScrollArea>
      </div>
    </div>
  )

}