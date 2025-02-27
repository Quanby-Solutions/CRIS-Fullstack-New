// src/app/(dashboard)/users/page.tsx
import { Suspense, type FC } from 'react'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'
import { UsersClientPage, UsersTableSkeleton } from '@/components/custom/users/client/users-client'

import { PageProps } from '@/lib/types/page'
import { Breadcrumb } from '@/types/dashboard'
import { ScrollArea } from '@/components/ui/scroll-area'

const breadcrumbs: Breadcrumb[] = [
  { label: 'Dashboard', href: '/dashboard', active: false },
  { label: 'Users', href: '/manage-staffs', active: true },
] as const

const UsersPage: FC<PageProps> = () => {
  return (
    <div className='flex flex-col h-screen'>
      <div className='flex-none'>
        <DashboardHeader breadcrumbs={breadcrumbs} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <Suspense fallback={<UsersTableSkeleton />}>
              <UsersClientPage />
            </Suspense>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default UsersPage