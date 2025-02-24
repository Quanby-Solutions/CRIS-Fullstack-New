// src/app/api/users/route.ts
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Get the current session
        const session = await auth()

        // Fetch the full current user record (with roles and permissions) using the session id.
        let currentUser = null
        if (session?.user?.id) {
            currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: true,
                                },
                            },
                        },
                    },
                },
            })
        }

        // Determine privilege flags from the current user's roles.
        let isSuperAdmin = false
        let isAdmin = false
        let hasUserReadPermission = false

        if (currentUser && currentUser.roles) {
            for (let i = 0; i < currentUser.roles.length; i++) {
                const roleEntry = currentUser.roles[i]
                const roleName = roleEntry.role?.name
                if (roleName === 'Super Admin') {
                    isSuperAdmin = true
                }
                if (roleName === 'Admin') {
                    isAdmin = true
                }
                if (roleEntry.role?.permissions) {
                    for (let j = 0; j < roleEntry.role.permissions.length; j++) {
                        const permEntry = roleEntry.role.permissions[j]
                        if (permEntry.permission === 'USER_READ') {
                            hasUserReadPermission = true
                        }
                    }
                }
            }
        }

        // Fetch all active users with their roles and permissions.
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
                emailVerified: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                permissions: {
                                    select: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            where: { active: true },
            orderBy: { updatedAt: 'desc' },
        })

        // Type filteredUsers as an array of the same type as the elements in 'users'
        let filteredUsers: typeof users = []

        if (isSuperAdmin) {
            // Super Admin sees every user and role.
            filteredUsers = users
        } else if (isAdmin) {
            // Admin (but not Super Admin) should not see any users that hold a Super Admin role.
            filteredUsers = users
                .filter(user => {
                    // Exclude any user that has a Super Admin role.
                    return !user.roles.some(r => r.role?.name === 'Super Admin')
                })
                .map(user => ({
                    ...user,
                    // For the users returned, filter out any Super Admin roles.
                    roles: user.roles.filter(r => r.role?.name !== 'Super Admin'),
                }))
        } else {
            // Normal user: if they do not have USER_READ permission, show nothing.
            if (!hasUserReadPermission) {
                filteredUsers = []
            } else {
                // If they do have permission, do not show any users that have an Admin or Super Admin role.
                filteredUsers = users
                    .filter(user => {
                        return !user.roles.some(
                            r =>
                                r.role?.name === 'Admin' || r.role?.name === 'Super Admin'
                        )
                    })
                    .map(user => ({
                        ...user,
                        // Also, remove any Admin or Super Admin roles from the returned roles.
                        roles: user.roles.filter(
                            r =>
                                r.role?.name !== 'Admin' && r.role?.name !== 'Super Admin'
                        ),
                    }))
            }
        }

        return NextResponse.json({ success: true, users: filteredUsers }, { status: 200 })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}
