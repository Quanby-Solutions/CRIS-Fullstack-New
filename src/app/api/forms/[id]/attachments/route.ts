// src/app/api/forms/[id]/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const formId = params.id

        // Validate the form exists
        const existingForm = await prisma.baseRegistryForm.findUnique({
            where: { id: formId },
        })

        if (!existingForm) {
            return NextResponse.json(
                { error: 'Form not found' },
                { status: 404 }
            )
        }

        // Fetch attachments for the form
        const attachments = await prisma.attachment.findMany({
            where: {
                document: {
                    baseRegistryForms: {
                        some: {
                            baseRegistryFormId: formId
                        }
                    }
                }
            },
            include: {
                certifiedCopies: true
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        })

        return NextResponse.json(attachments, { status: 200 })
    } catch (error) {
        console.error('Error fetching form attachments:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch attachments',
                details:
                    error && typeof error === 'object' && 'message' in error
                        ? (error as Error).message
                        : 'Unknown error',
            },
            { status: 500 }
        )
    }
}