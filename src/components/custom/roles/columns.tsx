'use client'

import { t } from 'i18next'
import { format } from 'date-fns'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import { Role, Permission } from '@prisma/client'
import { DataTableRowActions } from './data-table-row-actions'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { DataTableColumnHeader } from '@/components/custom/table/data-table-column-header'

type RoleRow = Role & {
    permissions: Permission[]
    users: { id: string; name: string; email: string }[]
}

export const columns: ColumnDef<RoleRow>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Description')} />
        ),
        cell: ({ row }) => {
            const description = row.getValue('description') as string
            return <div className="text-sm text-muted-foreground">{description || 'No description'}</div>
        },
    },
    {
        accessorKey: 'permissions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t("dataTable.permissions")} />
        ),
        cell: ({ row }) => {
            const permissions = new Set<Permission>();

            (row.getValue('permissions') as Permission[]).forEach((perm) =>
                permissions.add(perm)
            )

            const hasPermissions = permissions.size > 0

            return hasPermissions ? (
                <Popover>
                    <PopoverTrigger>
                        <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                        >
                            <Icons.shield className="w-3 h-3 mr-1" />
                            {permissions.size} {t("dataTable.permissions")}
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <Icons.shield className="w-4 h-4 text-muted-foreground" />
                                <h4 className="font-medium">{t("dataTable.allPermissions")}</h4>
                            </div>
                            {/* Permissions list container with grid layout */}
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                {Array.from(permissions).map((permission: string) => (
                                    <div
                                        key={permission}
                                        className="text-sm px-2 py-1 rounded-md bg-secondary/50"
                                    >
                                        {permission
                                            .replace(/_/g, " ")
                                            .toString()
                                            .toLowerCase()
                                            .replace(/^\w/, (c: string) => c.toUpperCase())}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            ) : (
                <Badge variant="secondary" className="opacity-50">
                    <Icons.shield className="w-3 h-3 mr-1" />
                    {t("dataTable.noPermissions")}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Created At')} />
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
        accessorKey: 'updatedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Last Updated')} />
        ),
        cell: ({ row }) => {
            const updatedAt = row.getValue('updatedAt') as Date
            return (
                <div className="text-sm text-muted-foreground">
                    {t('Updated')}: {format(new Date(updatedAt), 'PPP p')}
                </div>
            )
        },
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('Actions')} />
        ),
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]