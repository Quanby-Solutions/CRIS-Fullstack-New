'use client'

import { Icons } from '@/components/ui/icons'
import { useCallback, useState } from 'react'
import { formatDateTime } from '@/utils/date'
import { useTranslation } from 'react-i18next'
import { Notification } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/contexts/notification-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function NotificationBell() {
  const { t } = useTranslation()
  const { notifications, unreadCount, isLoading, error, markAsRead } = useNotifications()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      setSelectedNotification(notification)
      setIsDialogOpen(true)

      if (!notification.read) {
        try {
          // Mark as read - we don't need to await this since we have optimistic updates
          markAsRead({ id: notification.id, read: true }).catch((error) => {
            console.error('Failed to mark notification as read:', error)
          });
        } catch (error) {
          console.error('Failed to handle notification click:', error)
        }
      }
    },
    [markAsRead]
  )

  const formatDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput)
      const now = new Date()

      if (isNaN(date.getTime())) {
        return ''
      }

      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

      if (diffInMinutes < 1) return t('just_now') // "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes} ${t('minutes_ago')}`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ${t('hours_ago')}`
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ${t('days_ago')}`

      return formatDateTime(date)
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={50}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-9 w-9 relative'
                >
                  <Icons.bellIcon className='h-[1.2rem] w-[1.2rem]' />
                  {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  <span className='sr-only'>{t('notifications')}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side='bottom'>{t('notifications')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align='end' className='w-80'>
          <DropdownMenuLabel className='flex justify-between items-center'>
            <span>{t('notifications')}</span>
            {unreadCount > 0 && (
              <span className='text-xs text-muted-foreground'>
                {unreadCount} {t('unread')}
              </span>
            )}
          </DropdownMenuLabel>
          {isLoading ? (
            <div className='p-4 text-sm text-center text-muted-foreground'>
              {t('loading')}...
            </div>
          ) : error ? (
            <div className='p-4 text-sm text-center text-destructive'>
              {error}
            </div>
          ) : notifications.filter((notification) => !notification.read).length === 0 ? (
            <div className='p-4 text-sm text-center text-muted-foreground'>
              {t('no_notifications')}
            </div>
          ) : (
            <ScrollArea className='h-[300px]'>
              {notifications
                .filter((notification) => !notification.read)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className='p-2 hover:bg-accent cursor-pointer flex gap-2 items-start'
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className='mt-1.5'>
                      <Icons.circleDot className='h-2 w-2 text-blue-500' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>
                        {notification.title}
                      </div>
                      <div className='text-xs text-muted-foreground line-clamp-2'>
                        {notification.message}
                      </div>
                      <div className='text-[10px] text-muted-foreground mt-1'>
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <div className="flex items-start gap-4 max-w-[540px]">
              <Icons.bellIcon className="h-6 w-6" />
              <DialogTitle>{selectedNotification?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="grid py-4">
            {selectedNotification?.type && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-3 text-sm">{t(selectedNotification.type)}</span>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4 pb-4">
              <span className="col-span-3 text-sm">
                {selectedNotification?.createdAt ? formatDate(selectedNotification.createdAt) : ""}
              </span>
            </div>
            <ScrollArea className="w-full rounded-md border p-4 max-h-[300px]">
              <pre className="text-sm whitespace-pre-wrap break-words">{selectedNotification?.message}</pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}