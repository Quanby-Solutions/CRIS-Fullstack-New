import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/custom/dashboard/dashboard-header'

import Profile from '@/components/custom/profile/profile'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function ProfilePage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return <div>User not authenticated</div>
    }

    // Display loading skeleton while fetching the profile
    const profilePromise = prisma.profile.findUnique({
        where: { userId },
        include: { user: true },
    })

    const profile = await profilePromise

    if (!profile || !profile.user) {
        return <div>Profile not found</div>
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-none">
                <DashboardHeader
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard', active: false },
                        { label: 'Profile', href: '/profile', active: true },
                    ]}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <Profile userId={userId} profile={profile} isLoading={!profile} />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
