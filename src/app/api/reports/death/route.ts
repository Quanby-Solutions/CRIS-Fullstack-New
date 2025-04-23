// src/app/api/reports/death/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { DeathDataSchema } from '@/lib/types/reports'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const startYear = parseInt(searchParams.get('startYear') || '2019')
        const endYear = parseInt(searchParams.get('endYear') || '2025')

        console.log(`Fetching death data from ${startYear} to ${endYear}`)

        // Adjust query to safely handle dateOfDeath
        const allDeaths = await prisma.deathCertificateForm.findMany({
            where: {
                dateOfDeath: {
                    gte: new Date(`${startYear}-01-01T00:00:00Z`),
                    lte: new Date(`${endYear}-12-31T23:59:59Z`),
                },
            },
            select: {
                dateOfDeath: true,
                sex: true,
            },
        })

        console.log(`Found ${allDeaths.length} death records`)

        // If no records found, return empty array with structure
        if (allDeaths.length === 0) {
            // Generate empty data for the requested year range
            const emptyResult = [];
            for (let year = startYear; year <= endYear; year++) {
                emptyResult.push({
                    year,
                    male: 0,
                    female: 0,
                    unknown: 0,
                    total: 0
                });
            }
            return NextResponse.json(emptyResult);
        }

        // Log a sample record to help diagnose structure issues
        console.log('Sample record:', JSON.stringify(allDeaths[0]))

        // Process data year by year
        const yearlyData: Record<number, { male: number; female: number; unknown: number }> = {}

        // Initialize data for all years in the range
        for (let year = startYear; year <= endYear; year++) {
            yearlyData[year] = { male: 0, female: 0, unknown: 0 };
        }

        // Process records, handling nullable fields cautiously
        let processedCount = 0;
        let skippedCount = 0;

        allDeaths.forEach(death => {
            try {
                // Skip records with null date
                if (!death.dateOfDeath) {
                    skippedCount++;
                    return;
                }

                // Get year from date, handling potential date format issues
                let year: number;
                try {
                    // Convert the dateOfDeath to an actual Date object
                    let dateObj;
                    if (typeof death.dateOfDeath === 'string') {
                        dateObj = new Date(death.dateOfDeath);
                    } else if (death.dateOfDeath instanceof Date) {
                        dateObj = death.dateOfDeath;
                    } else if (typeof death.dateOfDeath === 'object' && death.dateOfDeath !== null) {
                        // Handle potential JSON date representation
                        const dateStr = JSON.stringify(death.dateOfDeath);
                        dateObj = new Date(dateStr.replace(/["\\]/g, ''));
                    } else {
                        throw new Error(`Unsupported date type: ${typeof death.dateOfDeath}`);
                    }

                    if (isNaN(dateObj.getTime())) {
                        throw new Error('Invalid date');
                    }

                    year = dateObj.getFullYear();

                    // Skip if the year is outside our range
                    if (year < startYear || year > endYear) {
                        skippedCount++;
                        return;
                    }
                } catch (dateError) {
                    console.error('Error parsing date:', death.dateOfDeath, dateError);
                    skippedCount++;
                    return;
                }

                // Process sex data safely
                let sexValue = null;
                if (death.sex !== null && death.sex !== undefined) {
                    sexValue = String(death.sex).toLowerCase();
                }

                if (sexValue === 'male') {
                    yearlyData[year].male++;
                } else if (sexValue === 'female') {
                    yearlyData[year].female++;
                } else {
                    yearlyData[year].unknown++;
                }

                processedCount++;
            } catch (recordError) {
                console.error('Error processing record:', recordError);
                skippedCount++;
            }
        });

        console.log(`Processed ${processedCount} records, skipped ${skippedCount} records`);

        // Convert to array and calculate totals
        const result = Object.entries(yearlyData)
            .map(([year, counts]) => ({
                year: parseInt(year),
                male: counts.male,
                female: counts.female,
                unknown: counts.unknown,
                total: counts.male + counts.female + counts.unknown
            }))
            .sort((a, b) => a.year - b.year);

        console.log(`Generated data for ${result.length} years`);

        // Remove years that have zero data if they weren't explicitly requested
        const filteredResult = result.filter(item =>
            item.total > 0 || (item.year >= startYear && item.year <= endYear)
        );

        // Try validation, but return data even if validation fails
        try {
            const validatedData = DeathDataSchema.parse(filteredResult);
            return NextResponse.json(validatedData);
        } catch (validationError) {
            console.error('Validation error:', validationError);
            // Return unvalidated data as fallback
            return NextResponse.json(filteredResult);
        }
    } catch (error) {
        console.error('Error in death data API route:', error);
        return NextResponse.json({
            error: 'Failed to fetch death data',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}