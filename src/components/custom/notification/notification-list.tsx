"use client"

import { useState } from 'react'
import { CalendarSearch, Icon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationItem } from './notification-item'
import { NotificationModal } from './notification-modal'
import { Notification } from '@/lib/types/notification'
import { useNotificationPageActions } from '@/hooks/notification-page-actions'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button } from '@/components/ui/button'

export function NotificationList({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const { notifications, isLoading, error, markAsRead, archiveNotification, favoriteNotification } = useNotificationPageActions(userId)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Use Date objects for start and end date instead of strings
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  // State for controlling sort order: 'desc' for newest-to-oldest, 'asc' for oldest-to-newest
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

  // Helper to check if a notification is within the selected date range
  const isWithinDateRange = (createdAt: Date | string) => {
    const date = new Date(createdAt)
    if (startDate && date < startDate) return false
    if (endDate && date > endDate) return false
    return true
  }

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

  // Filter notifications by status
  const archivedNotifications = filteredNotifications.filter((notification) =>
    notification.status.includes('archive')
  )
  const favoriteNotifications = filteredNotifications.filter((notification) =>
    notification.status.includes('favorite')
  )
  const unreadNotifications = filteredNotifications.filter(
    (notification) => !notification.read && !notification.status.includes('archive')
  )

  return (
    <div className="w-full mx-auto bg-background rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('notificationList.title')}</h2>
          {filteredNotifications.filter((n) => !n.read).length > 0 && (
            <div className="bg-primary text-primary-foreground text-sm px-2 py-1 rounded-full">
              {filteredNotifications.filter((n) => !n.read).length} {t('notificationList.unread')}
            </div>
          )}
        </div>
        <div className='flex gap-4'>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('notificationList.searchPlaceholder')}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
              variant={'outline'}
              >
               <CalendarSearch />
                <span>{t('notificationList.dateRange') || 'Date Range'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-full">
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {t('notificationList.startDate') || 'Start Date'}
                  </label>
                  <ReactDatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="MM/dd/yy"
                    placeholderText="mm/dd/yy"
                    className="mt-1 border rounded p-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {t('notificationList.endDate') || 'End Date'}
                  </label>
                  <ReactDatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="MM/dd/yy"
                    placeholderText="mm/dd/yy"
                    className="mt-1 border rounded p-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate(null)
                    setEndDate(null)
                  }}
                  className="text-sm"
                >
                  {t('notificationList.resetDateRange') || 'Reset'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center border p-2 rounded"
          >
            {sortOrder === 'desc'
              ? t('notificationList.sortNewestToOldest') || 'Newest to Oldest'
              : t('notificationList.sortOldestToNewest') || 'Oldest to Newest'}
          </button>
        </div>
      </div>
      </div>

      <Tabs defaultValue="all" className="p-4">
        <TabsList className="grid w-full h-9 grid-cols-4 mb-4">
          <TabsTrigger value="all">
            {t('notificationList.all')} (
            {filteredNotifications.filter((n) => !n.status.includes('archive')).length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t('notificationList.unreadTab')} ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="archive">
            {t('notificationList.archive')} ({archivedNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="favorite">
            {t('notificationList.favorite')} ({favoriteNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 max-h-[450px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">{t('notificationList.loading')}</div>
          ) : error ? (
            <div className="text-center text-destructive">{error}</div>
          ) : filteredNotifications.filter((n) => !n.status.includes('archive')).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('notificationList.noNotifications')}
            </div>
          ) : (
            filteredNotifications
              .filter((notification) => !notification.status.includes('archive'))
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification as Notification}
                  onClick={handleNotificationClick}
                  onArchive={() => archiveNotification(notification.id)}
                  onFavorite={() => favoriteNotification(notification.id)}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-2 max-h-[450px] overflow-y-auto">
          {unreadNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('notificationList.noUnread')}</p>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification as Notification}
                onClick={handleNotificationClick}
                onArchive={() => archiveNotification(notification.id)}
                onFavorite={() => favoriteNotification(notification.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="archive" className="space-y-2 max-h-[460px] overflow-y-auto">
          {archivedNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('notificationList.noArchived')}
            </p>
          ) : (
            archivedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification as Notification}
                onClick={handleNotificationClick}
                onArchive={() => archiveNotification(notification.id)}
                onFavorite={() => favoriteNotification(notification.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="favorite" className="space-y-2 max-h-[460px] overflow-y-auto">
          {favoriteNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('notificationList.noFavorite')}
            </p>
          ) : (
            favoriteNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification as Notification}
                onClick={handleNotificationClick}
                onArchive={() => archiveNotification(notification.id)}
                onFavorite={() => favoriteNotification(notification.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <NotificationModal
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={handleCloseModal}
      />
    </div>
  )
}
