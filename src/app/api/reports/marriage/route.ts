// FILE: src/app/api/reports/marriage/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { MarriageDataSchema } from '@/lib/types/reports'

// Helper function to safely extract country information from residence data
const extractCountry = (residence: any): string | null => {
    if (!residence) return null

    try {
        // Check for country property
        if (residence.country && typeof residence.country === 'string' && residence.country.trim() !== '') {
            return residence.country.trim()
        }

        // Check for international address as fallback
        if (residence.internationalAddress && typeof residence.internationalAddress === 'string' && residence.internationalAddress.trim() !== '') {
            return 'International'
        }

        return null
    } catch (error) {
        console.error('Error extracting country from residence', error)
        return null
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const startYear = parseInt(searchParams.get('startYear') || '2019')
        const endYear = parseInt(searchParams.get('endYear') || '2025')

        // Fetch marriage data with required fields
        const marriageData = await prisma.marriageCertificateForm.findMany({
            where: {
                dateOfMarriage: {
                    gte: new Date(`${startYear}-01-01`),
                    lte: new Date(`${endYear}-12-31`),
                },
            },
            select: {
                dateOfMarriage: true,
                husbandResidence: true,
                wifeResidence: true,
                husbandCitizenship: true,
                wifeCitizenship: true,
            },
        })

        // Initialize data structure for yearly aggregation
        const yearlyData: Record<number, { totalMarriages: number; residents: number; nonResidents: number }> = {}

        // Process each marriage record
        marriageData.forEach((entry) => {
            const year = entry.dateOfMarriage.getFullYear()

            // Initialize year data if not exists
            if (!yearlyData[year]) {
                yearlyData[year] = { totalMarriages: 0, residents: 0, nonResidents: 0 }
            }

            yearlyData[year].totalMarriages++

            // Extract countries safely, handling potential null values
            const husbandCountry = entry.husbandResidence ? extractCountry(entry.husbandResidence) : null
            const wifeCountry = entry.wifeResidence ? extractCountry(entry.wifeResidence) : null

            // Determine residency status with fallback to citizenship
            const isHusbandResident = husbandCountry === 'Philippines' ||
                (husbandCountry === null && entry.husbandCitizenship === 'Philippines');
            const isWifeResident = wifeCountry === 'Philippines' ||
                (wifeCountry === null && entry.wifeCitizenship === 'Philippines');

            // Categorize based on residency status
            if (isHusbandResident && isWifeResident) {
                yearlyData[year].residents++
            } else {~
                yearlyData[year].nonResidents++
            }
        })

        // Convert to array format for API response
        const result = Object.entries(yearlyData).map(([year, data]) => ({
            year: parseInt(year),
            totalMarriages: data.totalMarriages,
            residents: data.residents,
            nonResidents: data.nonResidents,
        }))

        // Sort by year
        result.sort((a, b) => a.year - b.year)

        // Validate and return the data
        const validatedData = MarriageDataSchema.parse(result)
        return NextResponse.json(validatedData)
    } catch (error) {
        console.error('Error fetching marriage data:', error)
        return NextResponse.json({ error: 'Failed to fetch marriage data' }, { status: 500 })
    }
}

// USAGE NOTES:
// 1. This implementation handles null values in husbandResidence and wifeResidence
// 2. It uses citizenship as a fallback when residence country isn't available
// 3. Added error handling for safer JSON parsing
// 4. Sorts results by year for better UX
// 5. Added detailed comments for maintainability