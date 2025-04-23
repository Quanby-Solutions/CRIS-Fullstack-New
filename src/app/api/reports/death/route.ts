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
        // Adjust query to handle dateOfDeath as JSON
        const allDeaths = await prisma.deathCertificateForm.findMany({
            // Remove the date filtering initially to get ALL records
            select: {
                dateOfDeath: true,
                sex: true,
            },
        });

        console.log(`Found ${allDeaths.length} total death records before filtering`);

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
                    // First try to extract years from strings directly
                    if (typeof death.dateOfDeath === 'string') {
                        // Look for year pattern (4 digits that might be a year)
                        const yearMatch = death.dateOfDeath.match(/\b(19|20)\d{2}\b/);
                        if (yearMatch) {
                            year = parseInt(yearMatch[0]);

                            // Check if extracted year is within range
                            if (year >= startYear && year <= endYear) {
                                console.log(`Extracted year ${year} directly from string: ${death.dateOfDeath}`);

                                // Process sex data with this year
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
                                return; // Skip the rest of the processing
                            } else {
                                skippedCount++;
                                return; // Year outside range
                            }
                        }
                    }

                    // If no year found directly in string, proceed with normal date parsing
                    let dateObj;

                    if (typeof death.dateOfDeath === 'string') {
                        // If it looks like a JSON string with a date inside
                        if (death.dateOfDeath.includes('"dateOfDeath"')) {
                            try {
                                const parsed = JSON.parse(death.dateOfDeath);
                                dateObj = new Date(parsed.dateOfDeath);
                            } catch {
                                // Fallback to direct parsing if JSON parsing fails
                                dateObj = new Date(death.dateOfDeath);
                            }
                        } else {
                            // Direct parsing for ISO date strings
                            dateObj = new Date(death.dateOfDeath);
                        }
                    } else if (death.dateOfDeath instanceof Date) {
                        // Already a Date object
                        dateObj = death.dateOfDeath;
                    } else if (typeof death.dateOfDeath === 'object' && death.dateOfDeath !== null) {
                        // Handle JSON object with date property
                        const deathObj = death.dateOfDeath as Record<string, any>;

                        if ('dateOfDeath' in deathObj && deathObj.dateOfDeath) {
                            // Make sure the nested dateOfDeath is a valid value for Date constructor
                            const nestedValue = deathObj.dateOfDeath;
                            if (typeof nestedValue === 'string' ||
                                typeof nestedValue === 'number' ||
                                nestedValue instanceof Date) {
                                dateObj = new Date(nestedValue);
                            } else {
                                // Handle case where nested value isn't a valid date input
                                console.warn(`Nested dateOfDeath has invalid type: ${typeof nestedValue}`);
                                const nestedStr = String(nestedValue);
                                dateObj = new Date(nestedStr);
                            }
                        } else {
                            // Attempt to stringify and parse the object
                            const dateStr = JSON.stringify(death.dateOfDeath);
                            dateObj = new Date(dateStr.replace(/["\\]/g, ''));
                        }
                    } else {
                        throw new Error(`Unsupported date type: ${typeof death.dateOfDeath}`);
                    }

                    // Check if we have a valid date
                    if (isNaN(dateObj.getTime())) {
                        // Try to extract year directly using regex if date is invalid (as a fallback)
                        if (typeof death.dateOfDeath === 'string') {
                            // Look for year pattern (4 digits that might be a year)
                            const yearMatch = death.dateOfDeath.match(/\b(19|20)\d{2}\b/);
                            if (yearMatch) {
                                year = parseInt(yearMatch[0]);

                                // Check if extracted year is within range
                                if (year >= startYear && year <= endYear) {
                                    // Valid year found
                                    console.log(`Extracted year ${year} from invalid date: ${death.dateOfDeath}`);
                                } else {
                                    throw new Error(`Extracted year ${year} is outside range ${startYear}-${endYear}`);
                                }
                            } else {
                                throw new Error('No valid year found in string');
                            }
                        } else {
                            throw new Error('Invalid date');
                        }
                    } else {
                        // Valid date, extract year
                        year = dateObj.getFullYear();
                    }

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