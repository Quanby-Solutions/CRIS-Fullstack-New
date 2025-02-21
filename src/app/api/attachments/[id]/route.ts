// src\app\api\attachments\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = await context.params;

    try {
        await prisma.attachment.delete({
            where: { id },
        })

        return NextResponse.json(
            { message: 'Attachment deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting attachment:', error)
        return NextResponse.json(
            { error: 'Failed to delete attachment' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = await context.params;

    try {
        const { status } = await req.json()

        // Validate required fields
        if (!status) {
            return NextResponse.json(
                { error: 'Missing status field' },
                { status: 400 }
            )
        }

        // Update the attachment status
        const updatedAttachment = await prisma.attachment.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json(updatedAttachment, { status: 200 })
    } catch (error) {
        console.error('Error updating attachment status:', error)
        return NextResponse.json(
            { error: 'Failed to update attachment status' },
            { status: 500 }
        )
    }
}