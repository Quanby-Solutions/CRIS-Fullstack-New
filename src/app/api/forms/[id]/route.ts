// src/app/api/forms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Zod schema for form update validation
const formUpdateSchema = z.object({
    // Optional fields that can be updated
    status: z.enum(['PENDING', 'VERIFIED', 'LATE_REGISTRATION', 'READY_FOR_RELEASE', 'RELEASED']).optional(),
    documentId: z.string().uuid().optional(),
    remarks: z.string().optional().nullable(),

    // Optional specific form type updates can be added here
    birthForm: z.object({
        isDelayedRegistration: z.boolean().optional(),
        reasonForDelay: z.string().optional().nullable()
    }).optional(),

    marriageForm: z.object({
        // Add marriage-specific update fields if needed
    }).optional(),

    deathForm: z.object({
        // Add death-specific update fields if needed
    }).optional()
})

// GET: Retrieve form details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const formId = params.id

        // Fetch the form with all related details
        const form = await prisma.baseRegistryForm.findUnique({
            where: { id: formId },
            include: {
                preparedBy: true,
                verifiedBy: true,
                documents: {
                    include: {
                        document: {
                            include: {
                                attachments: {
                                    include: { certifiedCopies: true },
                                    orderBy: { uploadedAt: 'desc' }
                                }
                            }
                        }
                    }
                },
                birthCertificateForm: true,
                marriageCertificateForm: true,
                deathCertificateForm: true
            }
        })

        if (!form) {
            return NextResponse.json(
                { error: 'Form not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(form, { status: 200 })
    } catch (error) {
        console.error('Error fetching form details:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch form details',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// PATCH: Update form details
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const formId = params.id
        const body = await request.json()

        // Validate the input using Zod schema
        const validationResult = formUpdateSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            )
        }

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

        // Prepare update data
        const updateData: any = {
            status: body.status,
            remarks: body.remarks,
        }

        // If documentId is provided, update it
        if (body.documentId) {
            updateData.documentId = body.documentId
        }

        // Start a transaction to handle multiple updates
        const updatedForm = await prisma.$transaction(async (prisma) => {
            // Update base form
            const baseFormUpdate = await prisma.baseRegistryForm.update({
                where: { id: formId },
                data: updateData
            })

            // Conditionally update specific form types if data is provided
            if (body.birthForm && existingForm.formType === 'BIRTH') {
                await prisma.birthCertificateForm.update({
                    where: { baseFormId: formId },
                    data: {
                        isDelayedRegistration: body.birthForm.isDelayedRegistration,
                        reasonForDelay: body.birthForm.reasonForDelay
                    }
                })
            }

            // Similar updates can be added for marriage and death forms

            return baseFormUpdate
        })

        // Revalidate the path to ensure fresh data on the frontend
        revalidatePath(`/civil-registry/details?formId=${formId}`)

        return NextResponse.json(
            {
                success: true,
                data: updatedForm
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error updating BaseRegistryForm:', error)
        return NextResponse.json(
            {
                error: 'Failed to update BaseRegistryForm',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

// DELETE: Delete a form (with soft delete or complete removal)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const formId = params.id

        // Optional: Add authorization check here

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

        // Soft delete approach (update status)
        const deletedForm = await prisma.baseRegistryForm.update({
            where: { id: formId },
            data: {
                status: 'PENDING',
                // Optional: add more metadata about deletion
                remarks: `Marked for deletion at ${new Date().toISOString()}`
            }
        })

        // Alternative: Hard delete (uncomment if you want to completely remove the form)
        // const deletedForm = await prisma.baseRegistryForm.delete({
        //     where: { id: formId }
        // })

        // Revalidate the path to reflect changes
        revalidatePath('/civil-registry')

        return NextResponse.json(
            {
                success: true,
                message: 'Form deleted successfully',
                data: deletedForm
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting BaseRegistryForm:', error)
        return NextResponse.json(
            {
                error: 'Failed to delete BaseRegistryForm',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}