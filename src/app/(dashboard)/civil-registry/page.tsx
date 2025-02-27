// src/app/(dashboard)/civil-registry/page.tsx -- make it like this
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
    <div>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      
      <ScrollArea className='h-[85dvh]'>
        <div className="flex flex-col gap-4 p-4">
        <Suspense fallback={<CivilRegistryTableSkeleton />}>  
          <CivilRegistryClientPage />
        </Suspense>
        </div>
      </ScrollArea>
    </div>
  )
}

export default CivilRegistryPage
