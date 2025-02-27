'use client'

import { Session } from 'next-auth'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { Feedback, User } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-row-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/custom/table/data-table-column-header'

/**
 * Define a FeedbackRow type that extends the Prisma Feedback type
 * with a user relation (if available).
 */
export type FeedbackRow = Feedback & {
    user: { name: string; email: string; image: string | null } | null
}

/**
 * Hook that creates columns for the Feedback DataTable,
 * following the pattern used in the users module.
 *
 * @param session - The current session, used for conditional actions.
 * @param onUpdateFeedback - Callback when a feedback item is updated.
 * @param onDeleteFeedback - Callback when a feedback item is deleted.
 */
export const useCreateFeedbackColumns = (
    session: Session | null,
    onUpdateFeedback?: (feedback: FeedbackRow) => void,
    onDeleteFeedback?: (id: string) => void
): ColumnDef<FeedbackRow>[] => {
    const { t } = useTranslation()

    return [
        {
            accessorKey: 'user',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.user')} />
            ),
            cell: ({ row }) => {
                const user = row.getValue('user') as FeedbackRow['user']
                const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'
                return (
                    <div className="flex items-center gap-3 py-1">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.image || ''} alt={user?.name || t('anonymous')} />
                            <AvatarFallback className="font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <div className="font-medium truncate">
                                {user ? user.name : t('anonymous')}
                            </div>
                            {user && (
                                <div className="text-sm text-muted-foreground truncate">
                                    {user.email}
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'feedback',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.feedback')} />
            ),
            cell: ({ row }) => (
                <div className="text-sm">{row.getValue('feedback') as string}</div>
            ),
        },
        {
            accessorKey: 'submittedBy',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.submittedBy')} />
            ),
            cell: ({ row }) => (row.original.user ? t('dataTable.known_user') : t('dataTable.anonymous')),
            filterFn: (row, id, value: string[]) => {
                const hasUser = Boolean(row.original.user)
                return value.includes(String(hasUser))
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.submittedAt')} />
            ),
            cell: ({ row }) => {
                const createdAt = row.getValue('createdAt') as Date
                return (
                    <div className="text-sm text-muted-foreground">
                        {format(new Date(createdAt), 'PPP p')}
                    </div>
                )
            },
        },
        {
            id: 'actions',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
                if (session?.user?.email === (row.getValue('user') as User)?.email) {
                    return null
                }
                return (
                    <DataTableRowActions
                        row={row}
                        onUpdateFeedback={onUpdateFeedback}
                        onDeleteFeedback={onDeleteFeedback}
                    />
                )
            },
        },
    ]
}
