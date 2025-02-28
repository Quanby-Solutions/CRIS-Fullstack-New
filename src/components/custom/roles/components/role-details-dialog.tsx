'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Role } from '@prisma/client'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import {
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'

interface RoleDetailsDialogProps {
    role: Role & {
        permissions: string[]
        users: { id: string; name: string; email: string }[]
    }
    onCloseAction?: () => void
    isOpen: boolean
    onOpenChangeAction: (open: boolean) => void
}

export function RoleDetailsDialog({ role, onCloseAction }: RoleDetailsDialogProps) {
    const groupedPermissions = role.permissions.reduce<Record<string, string[]>>((acc, perm) => {
        const [group] = perm.split('_')
        if (!acc[group]) acc[group] = []
        acc[group].push(perm)
        return acc
    }, {})

    // State for pagination and filtering
    const [userPage, setUserPage] = useState(1)
    const [userSearch, setUserSearch] = useState('')
    const [permissionSearch, setPermissionSearch] = useState('')
    const usersPerPage = 5

    // Filter users based on search
    const filteredUsers = role.users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    )

    // Pagination for users
    const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage)
    const displayedUsers = filteredUsers.slice(
        (userPage - 1) * usersPerPage,
        userPage * usersPerPage
    )

    // Filter permission groups
    const filteredPermissionGroups = Object.entries(groupedPermissions)
        .filter(([group, perms]) => {
            const groupMatches = group.toLowerCase().includes(permissionSearch.toLowerCase())
            const permMatches = perms.some(perm =>
                perm.toLowerCase().includes(permissionSearch.toLowerCase())
            )
            return groupMatches || permMatches
        })

    return (
        <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-3xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Icons.shield className="h-5 w-5 text-primary" />
                    Role Details
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
                {/* Basic Role Info Card */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{role.name}</h3>
                        <Badge variant={role.name === 'Super Admin' ? 'destructive' : 'outline'}>
                            {role.users.length} users
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {role.description || 'No description provided'}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <div>Created: {format(new Date(role.createdAt), 'PPP')}</div>
                        <div>Updated: {format(new Date(role.updatedAt), 'PPP')}</div>
                    </div>
                </div>

                {/* Permissions Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="permissions">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Icons.lock className="h-4 w-4" />
                                Permissions ({role.permissions.length})
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {Object.keys(groupedPermissions).length > 0 ? (
                                <div className="space-y-3">
                                    {/* Search permissions */}
                                    <div className="relative mb-4">
                                        <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search permissions..."
                                            className="pl-8"
                                            value={permissionSearch}
                                            onChange={(e) => setPermissionSearch(e.target.value)}
                                        />
                                    </div>

                                    {filteredPermissionGroups.length > 0 ? (
                                        filteredPermissionGroups.map(([group, perms]) => (
                                            <div key={group} className="rounded border p-3">
                                                <div className="mb-1 font-medium capitalize">{group}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {perms.map(perm => (
                                                        <Badge
                                                            key={perm}
                                                            variant="secondary"
                                                            className={`text-xs ${permissionSearch && perm.toLowerCase().includes(permissionSearch.toLowerCase()) ? 'bg-primary/20 border-primary' : ''}`}
                                                        >
                                                            {perm.split('_')[1]?.toLowerCase() || perm}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-2 text-center text-sm text-muted-foreground">
                                            No permissions found matching &quot;{permissionSearch}&quot;
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-2 text-sm text-muted-foreground">No permissions assigned</div>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Users Accordion */}
                    <AccordionItem value="users">
                        <AccordionTrigger className="text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Icons.users className="h-4 w-4" />
                                Users ({role.users.length})
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {role.users.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Search users */}
                                    <div className="relative">
                                        <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            className="pl-8"
                                            value={userSearch}
                                            onChange={(e) => {
                                                setUserSearch(e.target.value)
                                                setUserPage(1) // Reset to first page on search
                                            }}
                                        />
                                    </div>

                                    {/* User list */}
                                    {displayedUsers.length > 0 ? (
                                        <div className="space-y-2 py-1">
                                            {displayedUsers.map(user => (
                                                <div key={user.id} className="flex items-center justify-between rounded border p-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-sm text-muted-foreground">
                                            No users found matching &quot;{userSearch}&quot;
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {filteredUsers.length > usersPerPage && (
                                        <div className="flex items-center justify-between border-t pt-3">
                                            <div className="text-xs text-muted-foreground">
                                                Showing {(userPage - 1) * usersPerPage + 1} to {Math.min(userPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                                    disabled={userPage === 1}
                                                >
                                                    <Icons.chevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                                    disabled={userPage === totalUserPages}
                                                >
                                                    <Icons.chevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-2 text-sm text-muted-foreground">No users assigned</div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <DialogFooter>
                <Button variant="secondary" onClick={onCloseAction}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
