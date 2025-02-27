'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { Notification } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { NotificationItem } from './notification-item'
import { NotificationModal } from './notification-modal'
import { useNotifications } from '@/contexts/notification-context'
import { CalendarIcon, Search, X, ArrowUpDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerWithRangeProps {
  dateRange: DateRange | undefined
  setDateRangeAction: (range: DateRange | undefined) => void
  resetDateRangeAction: () => void
  isActive: boolean
}

export function DatePickerWithRange({
  dateRange,
  setDateRangeAction,
  resetDateRangeAction,
  isActive,
}: DatePickerWithRangeProps) {
  return (
    <div className='flex items-center gap-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !dateRange?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Filter by date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRangeAction}
            numberOfMonths={2}
          />
          {isActive && (
            <div className='flex justify-end p-2 border-t'>
              <Button variant='ghost' size='sm' onClick={resetDateRangeAction}>
                Reset
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * NotificationList:
 * Displays notifications with filtering, sorting, and a unified date range picker.
 */
export function NotificationList() {
  const { t } = useTranslation()
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    archiveNotification,
    favoriteNotification,
    unreadCount,
  } = useNotifications()

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    if (!notification.read) {
      markAsRead({ id: notification.id, read: true }).catch((error) => {
        console.error('Failed to mark notification as read:', error)
      })
    }
  }

  const handleCloseModal = () => {
    setSelectedNotification(null)
  }

  // Check if a notification's creation date is within the selected range.
  const isWithinDateRange = (createdAt: Date | string) => {
    const date = new Date(createdAt)
    if (dateRange?.from && date < dateRange.from) return false
    if (dateRange?.to && date > dateRange.to) return false
    return true
  }

  // Filtering by search query and date range only.
  const filteredNotifications = notifications
    .filter((notification) =>
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((notification) => isWithinDateRange(notification.createdAt))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

  // 'All' now includes every notification from filteredNotifications.
  const allNotifications = filteredNotifications

  // Other tabs can still use additional filters.
  const archivedNotifications = filteredNotifications.filter((notification) =>
    notification.status.includes('archive')
  )
  const favoriteNotifications = filteredNotifications.filter((notification) =>
    notification.status.includes('favorite')
  )
  const unreadNotifications = filteredNotifications.filter(
    (notification) => !notification.read && !notification.status.includes('archive')
  )

  const isDateRangeActive = dateRange?.from !== undefined

  const setDateRangeAction = (range: DateRange | undefined) => setDateRange(range)
  const resetDateRangeAction = () => setDateRange(undefined)

  return (
    <div className='w-full mx-auto bg-background rounded-lg shadow'>
      <div className='p-4 border-b'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-semibold'>{t('notificationList.title')}</h2>
            {unreadCount > 0 && (
              <Badge variant='destructive' className='px-2 py-0.5 text-xs font-medium'>
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <div className='flex flex-wrap gap-3 items-center'>
          <div className='relative flex-1 min-w-[300px]'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('notificationList.searchPlaceholder')}
              className='pl-8 h-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery !== '' && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 h-7 w-7 p-0'
                onClick={() => setSearchQuery('')}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
          <DatePickerWithRange
            dateRange={dateRange}
            setDateRangeAction={setDateRangeAction}
            resetDateRangeAction={resetDateRangeAction}
            isActive={isDateRangeActive}
          />
          <Button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            variant='outline'
            size='sm'
            className='h-9'
          >
            <ArrowUpDown className='mr-2 h-3.5 w-3.5' />
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue='all' className='p-4'>
        <div className='flex justify-left mb-4'>
          <TabsList className='inline-flex w-auto'>
            <TabsTrigger value='all' className='relative px-4'>
              {t('notificationList.all')}
              <Badge variant='outline' className='ml-1.5'>
                {allNotifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='unread' className='relative px-4'>
              {t('notificationList.unreadTab')}
              <Badge variant='outline' className='ml-1.5'>
                {unreadNotifications.length}
              </Badge>
              {unreadNotifications.length > 0 && (
                <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full'></span>
              )}
            </TabsTrigger>
            <TabsTrigger value='archive' className='relative px-4'>
              {t('notificationList.archive')}
              <Badge variant='outline' className='ml-1.5'>
                {archivedNotifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='favorite' className='relative px-4'>
              {t('notificationList.favorite')}
              <Badge variant='outline' className='ml-1.5'>
                {favoriteNotifications.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='overflow-hidden border rounded-md'>
          <TabsContent value='all' className='h-[400px]'>
            <div className='h-full overflow-y-auto custom-scrollbar px-2 py-2'>
              {isLoading ? (
                <div className='text-center text-muted-foreground py-8'>
                  {t('notificationList.loading')}
                </div>
              ) : error ? (
                <div className='text-center text-destructive py-8'>{error}</div>
              ) : allNotifications.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  {t('notificationList.noNotifications')}
                </div>
              ) : (
                <div className='space-y-2'>
                  {allNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onArchive={() => archiveNotification(notification.id)}
                      onFavorite={() => favoriteNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='unread' className='h-[400px]'>
            <div className='h-full overflow-y-auto custom-scrollbar px-2 py-2'>
              {unreadNotifications.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>{t('notificationList.noUnread')}</div>
              ) : (
                <div className='space-y-2'>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onArchive={() => archiveNotification(notification.id)}
                      onFavorite={() => favoriteNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='archive' className='h-[400px]'>
            <div className='h-full overflow-y-auto custom-scrollbar px-2 py-2'>
              {archivedNotifications.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  {t('notificationList.noArchived')}
                </div>
              ) : (
                <div className='space-y-2'>
                  {archivedNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onArchive={() => archiveNotification(notification.id)}
                      onFavorite={() => favoriteNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='favorite' className='h-[400px]'>
            <div className='h-full overflow-y-auto custom-scrollbar px-2 py-2'>
              {favoriteNotifications.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  {t('notificationList.noFavorite')}
                </div>
              ) : (
                <div className='space-y-2'>
                  {favoriteNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onArchive={() => archiveNotification(notification.id)}
                      onFavorite={() => favoriteNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <NotificationModal
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={handleCloseModal}
      />
    </div>
  )
}
