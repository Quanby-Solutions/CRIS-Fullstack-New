// src/app/api/feedback/route.ts
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        if (!body.feedback || !body.userId) {
            return NextResponse.json(
                { error: "Feedback and userId are required." },
                { status: 400 }
            )
        }

        // Create feedback entry in the database
        const feedback = await prisma.feedback.create({
            data: {
                feedback: body.feedback,
                submittedBy: body.userId,
            },
        })

        return NextResponse.json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback,
        })
    } catch (error) {
        console.error("Feedback creation error:", error)
        return NextResponse.json(
            {
                error: "Failed to submit feedback",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        // If userId is provided, filter by it; otherwise, fetch all feedback
        const feedback = await prisma.feedback.findMany({
            where: userId ? { submittedBy: userId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        })

        // Format the feedback: add a submitterName and convert dates to ISO strings
        const formattedFeedback = feedback.map(item => ({
            ...item,
            content: item.feedback,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            submitterName: item.user ? item.user.name : null,
        }))

        return NextResponse.json({ feedback: formattedFeedback })
    } catch (error) {
        console.error("Feedback fetch error:", error)
        return NextResponse.json(
            {
                error: "Failed to fetch feedback",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}
