'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { NotificationProvider } from '@/contexts/notification-context'

interface NotificationProviderWrapperProps {
    children: ReactNode
}

export function NotificationProviderWrapper({ children }: NotificationProviderWrapperProps) {
    const { data: session } = useSession()
    const userId = session?.user?.id || ''

    // Only initialize the provider if we have a valid user ID
    if (!userId) {
        return <>{children}</>
    }

    return (
        <NotificationProvider userId={userId}>
            {children}
        </NotificationProvider>
    )
}