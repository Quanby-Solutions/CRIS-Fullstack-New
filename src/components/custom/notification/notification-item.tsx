import { Star, Mail, Bell, MessageCircle, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Notification } from '@/lib/types/notification'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
  onArchive: () => void
  onFavorite: () => void
}

export function NotificationItem({ notification, onClick, onArchive, onFavorite }: NotificationItemProps) {
  // Map notification types to corresponding icons
  const icons = {
    EMAIL: Mail,
    SYSTEM: Bell,
    SMS: MessageCircle,
  }

  // Get the appropriate icon based on the notification type
  const Icon = icons[notification.type]

  // Determine if the notification is archived or favorite
  const isArchived = notification.status.includes('archive')
  const isFavorite = notification.status.includes('favorite')
  const isUnread = !notification.read

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onArchive()
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite()
  }

  // Format date for better readability
  const formatNotificationDate = (dateValue: string | Date) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md border transition-colors cursor-pointer',
        isUnread && 'bg-accent/30 border-accent/60',
        !isUnread && 'hover:bg-muted border-transparent'
      )}
      onClick={() => onClick(notification)}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md',
          isUnread ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Icon
            className={cn(
              'h-4 w-4',
              isUnread ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {isUnread && (
                <Badge variant="secondary" className="px-1 py-0 h-auto text-xs">New</Badge>
              )}
              <p className={cn(
                "text-sm leading-tight truncate",
                isUnread && "font-medium"
              )}>
                {notification.message}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNotificationDate(notification.createdAt)}
            </p>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={handleArchiveClick}
                    aria-label={isArchived ? "Unarchive" : "Archive"}
                  >
                    <Archive
                      className={cn(
                        'h-4 w-4',
                        isArchived ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isArchived ? "Unarchive" : "Archive"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}