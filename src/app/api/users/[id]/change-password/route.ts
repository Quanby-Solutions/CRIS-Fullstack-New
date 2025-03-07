// app\api\users\[id]\change-password\route.ts
import { hash } from 'bcryptjs'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Permission } from '@prisma/client'
import { hasPermission } from '@/types/auth'

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: userId } = await context.params
        const { newPassword, confirmNewPassword } = await request.json()

        console.log('Updating password for userId:', userId)
        console.log('Received data:', { newPassword, confirmNewPassword })

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true,
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: true
                            }
                        }
                    }
                }
            },
        })

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user is updating their own password or has USER_UPDATE permission
        const isOwnAccount = session.user.id === userId
        const canUpdateUsers = hasPermission(session.user.permissions, 'USER_UPDATE' as Permission)

        if (!isOwnAccount && !canUpdateUsers) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }

        const userAccount = existingUser.accounts[0]
        if (!userAccount) {
            return NextResponse.json({ error: 'User account not found' }, { status: 404 })
        }

        if (newPassword !== confirmNewPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
        }

        const hashedNewPassword = await hash(newPassword, 10)
        const now = new Date()

        // Update the account with both the new password and updated timestamp
        await prisma.account.update({
            where: { id: userAccount.id },
            data: {
                password: hashedNewPassword,
                updatedAt: now
            },
        })

        // Also update the user's updatedAt timestamp
        await prisma.user.update({
            where: { id: userId },
            data: {
                updatedAt: now
            }
        })

        console.log('Password updated successfully')

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        })

    } catch (error) {
        console.error('Password update error:', error)
        return NextResponse.json({
            error: 'Failed to update password',
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 })
    }
}