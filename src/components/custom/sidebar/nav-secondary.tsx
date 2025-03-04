'use client'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Icons } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { handleSignOut } from '@/hooks/auth-actions'
import { FeedbackForm } from '@/components/custom/feedback/actions/feedback-form'
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { type NavSecondaryItem } from '@/lib/types/navigation'

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: Array<NavSecondaryItem & { icon?: React.ElementType }>
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCloseAction = async () => {
    setOpenDialog(null)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await handleSignOut()
    toast.success(t('loggingOut'), { duration: 3000 })
    setIsLoggingOut(false)
    handleCloseAction()
  }

  const getDialogContent = (item: NavSecondaryItem) => {
    if (item.title === t('send-feedback')) {
      return (
        <div className="mt-4">
          {session?.user?.id ? (
            <FeedbackForm userId={session.user.id} onSubmitAction={handleCloseAction} />
          ) : (
            <p className="text-muted-foreground">{t('signInToSubmitFeedback')}</p>
          )}
        </div>
      )
    }

    if (item.title === t('logOut')) {
      return (
        <>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('areYouSureToLogout')}
          </DialogDescription>
          <DialogFooter className="flex justify-center space-x-4 mt-4">
            <Button onClick={handleCloseAction} variant="outline" disabled={isLoggingOut}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {t('loggingOut')}
                </>
              ) : (
                t('logOut')
              )}
            </Button>
          </DialogFooter>
        </>
      )
    }

    return null
  }

  const extendedItems = [
    ...items,
    {
      title: t('send-feedback'),
      url: '#',
      icon: Icons.messageSquare,
    },
    {
      title: t('logOut'),
      url: '#',
      icon: Icons.logout,
    },
  ]

  if (!mounted || !extendedItems.length) return null

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {extendedItems.map((item) => {
            const ItemIcon = item.icon

            return (
              <SidebarMenuItem key={item.title}>
                <Dialog
                  open={openDialog === item.title}
                  onOpenChange={(open) => {
                    setOpenDialog(open ? item.title : null)
                  }}
                >
                  <DialogTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      className={cn(
                        'w-full transition-colors',
                        openDialog === item.title && 'bg-primary/10 text-primary',
                        item.title === t('logOut') && 'text-red-600 hover:bg-red-500 hover:text-white'
                      )}
                    >
                      {ItemIcon && <ItemIcon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {ItemIcon && <ItemIcon className="h-5 w-5 text-primary" />}
                        {item.title}
                      </DialogTitle>
                    </DialogHeader>
                    {getDialogContent(item)}
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
