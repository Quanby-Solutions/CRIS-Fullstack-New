import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'
import { NotificationList } from '@/components/custom/notification/notification-list'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function ProfilePage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return <div>User not authenticated</div>
    }

    const profile = await prisma.profile.findUnique({
        where: { userId },
        include: { user: true },
    })

    if (!profile) {
        return <div>Profile not found</div>
    }

    return (
 
        <div className="flex flex-col h-screen">
            <div className="flex-none">
                <DashboardHeader
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard', active: false },
                        { label: 'Notifications', href: '/notifications', active: true },
                    ]}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <NotificationList userId={userId} />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}