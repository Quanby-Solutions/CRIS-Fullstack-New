import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Update user and profile in a transaction.
        const [user, profile] = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    username: body.username || undefined,
                    name: body.name || undefined,
                    image: body.image || undefined,
                },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: { permissions: true },
                            },
                        },
                    },
                },
            })

            const updatedProfile = await tx.profile.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                    phoneNumber: body.phoneNumber || null,
                    address: body.address || null,
                    city: body.city || null,
                    state: body.state || null,
                    country: body.country || null,
                    postalCode: body.postalCode || null,
                    bio: body.bio || null,
                    occupation: body.occupation || null,
                    gender: body.gender || null,
                    nationality: body.nationality || null,
                },
                update: {
                    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                    phoneNumber: body.phoneNumber || null,
                    address: body.address || null,
                    city: body.city || null,
                    state: body.state || null,
                    country: body.country || null,
                    postalCode: body.postalCode || null,
                    bio: body.bio || null,
                    occupation: body.occupation || null,
                    gender: body.gender || null,
                    nationality: body.nationality || null,
                },
            })

            return [updatedUser, updatedProfile]
        })

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    ...user,
                    // Map roles while filtering out any null values.
                    roles: user.roles
                        .map((ur: any) => ur.role?.name)
                        .filter((name): name is string => !!name),
                    permissions: Array.from(
                        new Set(user.roles.flatMap((ur: any) => ur.role?.permissions.map((p: any) => p.permission) || []))
                    ),
                },
                profile,
            },
        })
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update profile',
            },
            { status: 500 }
        )
    }
}
