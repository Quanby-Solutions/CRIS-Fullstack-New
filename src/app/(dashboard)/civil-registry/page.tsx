import { Suspense, type FC } from 'react'
import { PageProps } from '@/lib/types/page'
import { Breadcrumb } from '@/types/dashboard'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'
import { CivilRegistryClientPage, CivilRegistryTableSkeleton } from '@/components/custom/civil-registry/client/civil-registry-client'
import { ScrollArea } from '@/components/ui/scroll-area'

const breadcrumbs: Breadcrumb[] = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Civil Registry', href: '/civil-registry', active: true },
] as const

const CivilRegistryPage: FC<PageProps> = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none">
        <DashboardHeader breadcrumbs={breadcrumbs} />
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <Suspense fallback={<CivilRegistryTableSkeleton />}>
              <CivilRegistryClientPage />
            </Suspense>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default CivilRegistryPage