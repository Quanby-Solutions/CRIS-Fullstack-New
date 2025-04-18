'use client'

import { Session } from "next-auth"
import { Permission } from '@prisma/client'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { UserWithRoleAndProfile } from '@/types/user'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-row-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DataTableColumnHeader } from '@/components/custom/table/data-table-column-header'

interface UserCellProps {
    row: Row<UserWithRoleAndProfile>
    t: (key: string) => string
}

const UserCell = ({ row, t }: UserCellProps) => {
    const user = row.original
    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U'
    return (
        <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
                <div className="font-medium truncate">{user.name || t('unnamed_user')}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Icons.user className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                        @{user.username || t('no_username')}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface EmailCellProps {
    email: string
}

const EmailCell = ({ email }: EmailCellProps) => (
    <div className="flex items-center gap-1.5">
        <Icons.mail className="w-3 h-3 text-violet-500 shrink-0" />
        <span className="text-sm truncate max-w-[200px]">{email}</span>
    </div>
)

export const useCreateColumns = (
    session: Session | null,
    onUpdateUser?: (user: UserWithRoleAndProfile) => void,
    onDeleteUser?: (id: string) => void
): ColumnDef<UserWithRoleAndProfile>[] => {
    const { t } = useTranslation()

    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.user')} />
            ),
            cell: ({ row }) => <UserCell row={row} t={t} />,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.contact')} />
            ),
            cell: ({ row }) => <EmailCell email={row.getValue('email')} />,
        },
        {
            id: 'role',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.role')} />
            ),
            cell: ({ row }) => {
                // Ensure roles is an array; filter out null values.
                const roles = Array.isArray(row.original.roles)
                    ? row.original.roles.filter(item => item && item.role)
                    : [];

                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.length > 0 ? (
                            roles.map((item, index) => (
                                <Badge
                                    key={`role-${item.role?.id ?? index}`}
                                    variant="outline"
                                    className="px-2 py-0.5"
                                >
                                    {item.role?.name || 'Unknown Role'}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">No roles</span>
                        )}
                    </div>
                )
            },
        },
        {
            id: 'permissions',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.permissions')} />
            ),
            cell: ({ row }) => {
                const permissionsSet: Set<Permission> = new Set<Permission>();

                // More defensive approach for collecting permissions
                if (Array.isArray(row.original.roles)) {
                    row.original.roles.forEach(roleItem => {
                        if (roleItem && roleItem.role && Array.isArray(roleItem.role.permissions)) {
                            roleItem.role.permissions.forEach(permItem => {
                                if (permItem && permItem.permission) {
                                    permissionsSet.add(permItem.permission);
                                }
                            });
                        }
                    });
                }

                const hasPermissions = permissionsSet.size > 0;

                return hasPermissions ? (
                    <Popover>
                        <PopoverTrigger>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                <Icons.shield className="w-3 h-3 mr-1" />
                                {permissionsSet.size} {t('dataTable.permissions')}
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Icons.shield className="w-4 h-4 text-muted-foreground" />
                                    <h4 className="font-medium">{t('dataTable.allPermissions')}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {Array.from(permissionsSet).map((permission: Permission): JSX.Element => (
                                        <div
                                            key={String(permission)}
                                            className="text-sm px-2 py-1 rounded-md bg-secondary/50"
                                        >
                                            {String(permission)
                                                .replace(/_/g, " ")
                                                .toLowerCase()
                                                .replace(/^\w/, (c: string): string => c.toUpperCase())}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Badge variant="secondary" className="opacity-50">
                        <Icons.shield className="w-3 h-3 mr-1" />
                        {t('dataTable.noPermissions')}
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'emailVerified',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.status')} />
            ),
            cell: ({ row }) => {
                const isVerified = row.getValue('emailVerified') as boolean
                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isVerified ? "default" : "secondary"}
                            className={`font-normal ${isVerified
                                ? "bg-primary hover:bg-primary/50 text-accent dark:text-accent-foreground"
                                : "bg-gray-300"
                                }`}
                        >
                            {isVerified ? t('dataTable.verified') : t('dataTable.unverified')}
                        </Badge>
                    </div>
                )
            },
            filterFn: (row, id, value: string[]) => {
                const rowValue = row.getValue(id) as boolean
                return value.includes(String(rowValue))
            },
        },
        {
            id: 'dates',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('dataTable.activity')} />
            ),
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Icons.calendar className="w-3 h-3 text-orange-500 shrink-0" />
                            <span className="text-muted-foreground truncate">
                                {t('dataTable.created')}{" "}
                                {formatDistanceToNow(new Date(user.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Icons.refresh className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-muted-foreground truncate">
                                {t('dataTable.updated')}{" "}
                                {formatDistanceToNow(new Date(user.updatedAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                    </div>
                )
            },
        },
        {
            id: 'actions',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
                // Skip rendering actions for the current user
                if (session?.user?.email === row.original.email) {
                    return null;
                }

                // Ensure row data is valid before passing to DataTableRowActions
                if (!row.original || !row.original.id) {
                    console.warn('Missing required data for actions row:', row.original);
                    return null;
                }

                // Wrap in try-catch to prevent table from breaking on errors
                try {
                    return (
                        <DataTableRowActions
                            row={row}
                            onUpdateUser={onUpdateUser}
                            onDeleteUser={onDeleteUser}
                        />
                    );
                } catch (error) {
                    console.error('Error rendering row actions:', error);
                    return (
                        <div className="text-xs text-red-500">Action error</div>
                    );
                }
            },
        },
    ]
}