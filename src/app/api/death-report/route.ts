// app/api/death-reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { legazpiData } from '@/lib/utils/barangay';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

        // Convert year to start and end dates for filtering
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // Query for all death certificates in Legazpi City for the specified year
        const deathRecords = await prisma.baseRegistryForm.findMany({
            where: {
                formType: 'DEATH',
                registeredByDate: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                deathCertificateForm: true,
            },
        });

        // Import the barangay list for accurate matching


        // Create a quick lookup set of all barangays
        const barangays = new Set(legazpiData["LEGAZPI CITY"].barangay_list);

        // Group deaths by barangay
        const deathsByBarangay: Record<string, number> = {};

        // Initialize all barangays with zero counts
        legazpiData["LEGAZPI CITY"].barangay_list.forEach(barangay => {
            deathsByBarangay[barangay] = 0;
        });

        // Process each death record
        deathRecords.forEach(record => {
            if (record.deathCertificateForm) {
                // Parse the residence JSON to get the barangay
                const residence = record.deathCertificateForm.residence as any;

                // Make sure this is from Legazpi City
                if (
                    residence &&
                    residence.cityMunicipality &&
                    String(residence.cityMunicipality).toLowerCase().includes('legazpi')
                ) {
                    // Get the raw barangay name from the record
                    const rawBarangay = residence.barangay ? String(residence.barangay).trim() : 'Unknown';

                    // Try to find the exact matching barangay
                    if (barangays.has(rawBarangay)) {
                        deathsByBarangay[rawBarangay]++;
                    } else {
                        // If not an exact match, try to find a close match
                        // We'll handle common naming variations like:
                        // - Missing apostrophes (Ems Barrio vs Em's Barrio)
                        // - Case differences (em's barrio vs Em's Barrio)
                        // - But preserve directional indicators (South, North, East, West)

                        // First, normalize the raw barangay name
                        const normalizedBarangay = rawBarangay.toLowerCase()
                            .replace(/['´`]/g, '') // Remove apostrophes
                            .replace(/\s+/g, ' ')  // Normalize spaces
                            .trim();

                        // Flag to track if we found a match
                        let foundMatch = false;

                        // Check each barangay from our master list
                        for (const masterBarangay of barangays) {
                            const normalizedMaster = masterBarangay.toLowerCase()
                                .replace(/['´`]/g, '')
                                .replace(/\s+/g, ' ')
                                .trim();

                            // Check for exact match after normalization
                            if (normalizedBarangay === normalizedMaster) {
                                deathsByBarangay[masterBarangay]++;
                                foundMatch = true;
                                break;
                            }

                            // Special handling for directional variants (South, North, East, West)
                            // First, identify if this is a directional variant
                            const directions = ['south', 'north', 'east', 'west'];
                            const hasDirection = directions.some(dir =>
                                normalizedBarangay.includes(dir) || normalizedMaster.includes(dir)
                            );

                            // If both have directional indicators, they must match exactly
                            if (hasDirection) {
                                // We still want some fuzzy matching for the base name
                                // For example, "Ems Barrio South" should match "Em's Barrio South"

                                // Extract the base name (without direction)
                                let baseRaw = normalizedBarangay;
                                let baseMaster = normalizedMaster;

                                for (const dir of directions) {
                                    baseRaw = baseRaw.replace(dir, '').trim();
                                    baseMaster = baseMaster.replace(dir, '').trim();
                                }

                                // If the base names match, check if the full names
                                // have the same directional component
                                if (baseRaw === baseMaster &&
                                    (
                                        (normalizedBarangay.includes('south') && normalizedMaster.includes('south')) ||
                                        (normalizedBarangay.includes('north') && normalizedMaster.includes('north')) ||
                                        (normalizedBarangay.includes('east') && normalizedMaster.includes('east')) ||
                                        (normalizedBarangay.includes('west') && normalizedMaster.includes('west'))
                                    )
                                ) {
                                    deathsByBarangay[masterBarangay]++;
                                    foundMatch = true;
                                    break;
                                }

                                // If they don't have the same directional component,
                                // they're different barangays, so don't count
                                continue;
                            }

                            // For non-directional barangays, if one is a substring of the other
                            // and neither has directional indicators, they might be a match
                            if (!hasDirection) {
                                if (normalizedBarangay.includes(normalizedMaster) ||
                                    normalizedMaster.includes(normalizedBarangay)) {
                                    deathsByBarangay[masterBarangay]++;
                                    foundMatch = true;
                                    break;
                                }
                            }
                        }

                        // If no match found, count under "Unknown"
                        if (!foundMatch) {
                            if (!deathsByBarangay["Unknown"]) {
                                deathsByBarangay["Unknown"] = 0;
                            }
                            deathsByBarangay["Unknown"]++;
                        }
                    }
                }
            }
        });

        // Get deaths by month and barangay for more detailed analysis
        const deathsByMonthAndBarangay: Record<string, Record<string, number>> = {};

        for (let month = 1; month <= 12; month++) {
            deathsByMonthAndBarangay[month.toString()] = {};

            // Initialize all barangays with zero counts for this month
            legazpiData["LEGAZPI CITY"].barangay_list.forEach(barangay => {
                deathsByMonthAndBarangay[month.toString()][barangay] = 0;
            });

            // Filter deaths for this month
            const monthDeaths = deathRecords.filter(record => {
                const recordDate = new Date(record.dateOfRegistration);
                return recordDate.getMonth() + 1 === month;
            });

            // Count deaths by barangay for this month using the same logic as above
            monthDeaths.forEach(record => {
                if (record.deathCertificateForm) {
                    const residence = record.deathCertificateForm.residence as any;

                    if (
                        residence &&
                        residence.cityMunicipality &&
                        String(residence.cityMunicipality).toLowerCase().includes('legazpi')
                    ) {
                        const rawBarangay = residence.barangay ? String(residence.barangay).trim() : 'Unknown';

                        // Try to find the exact matching barangay
                        if (barangays.has(rawBarangay)) {
                            deathsByMonthAndBarangay[month.toString()][rawBarangay]++;
                        } else {
                            // If not an exact match, use the same matching logic as above
                            const normalizedBarangay = rawBarangay.toLowerCase()
                                .replace(/['´`]/g, '')
                                .replace(/\s+/g, ' ')
                                .trim();

                            let foundMatch = false;

                            for (const masterBarangay of barangays) {
                                const normalizedMaster = masterBarangay.toLowerCase()
                                    .replace(/['´`]/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim();

                                if (normalizedBarangay === normalizedMaster) {
                                    deathsByMonthAndBarangay[month.toString()][masterBarangay]++;
                                    foundMatch = true;
                                    break;
                                }

                                const directions = ['south', 'north', 'east', 'west'];
                                const hasDirection = directions.some(dir =>
                                    normalizedBarangay.includes(dir) || normalizedMaster.includes(dir)
                                );

                                if (hasDirection) {
                                    let baseRaw = normalizedBarangay;
                                    let baseMaster = normalizedMaster;

                                    for (const dir of directions) {
                                        baseRaw = baseRaw.replace(dir, '').trim();
                                        baseMaster = baseMaster.replace(dir, '').trim();
                                    }

                                    if (baseRaw === baseMaster &&
                                        (
                                            (normalizedBarangay.includes('south') && normalizedMaster.includes('south')) ||
                                            (normalizedBarangay.includes('north') && normalizedMaster.includes('north')) ||
                                            (normalizedBarangay.includes('east') && normalizedMaster.includes('east')) ||
                                            (normalizedBarangay.includes('west') && normalizedMaster.includes('west'))
                                        )
                                    ) {
                                        deathsByMonthAndBarangay[month.toString()][masterBarangay]++;
                                        foundMatch = true;
                                        break;
                                    }

                                    continue;
                                }

                                if (!hasDirection) {
                                    if (normalizedBarangay.includes(normalizedMaster) ||
                                        normalizedMaster.includes(normalizedBarangay)) {
                                        deathsByMonthAndBarangay[month.toString()][masterBarangay]++;
                                        foundMatch = true;
                                        break;
                                    }
                                }
                            }

                            if (!foundMatch) {
                                if (!deathsByMonthAndBarangay[month.toString()]["Unknown"]) {
                                    deathsByMonthAndBarangay[month.toString()]["Unknown"] = 0;
                                }
                                deathsByMonthAndBarangay[month.toString()]["Unknown"]++;
                            }
                        }
                    }
                }
            });
        }

        // Remove barangays with zero counts to reduce payload size
        const cleanedDeathsByBarangay: Record<string, number> = {};
        Object.entries(deathsByBarangay).forEach(([barangay, count]) => {
            if (count > 0) {
                cleanedDeathsByBarangay[barangay] = count;
            }
        });

        const cleanedDeathsByMonthAndBarangay: Record<string, Record<string, number>> = {};
        Object.entries(deathsByMonthAndBarangay).forEach(([month, barangayCounts]) => {
            cleanedDeathsByMonthAndBarangay[month] = {};
            Object.entries(barangayCounts).forEach(([barangay, count]) => {
                if (count > 0) {
                    cleanedDeathsByMonthAndBarangay[month][barangay] = count;
                }
            });
        });

        // Return the data
        return NextResponse.json({
            totalDeaths: deathRecords.length,
            deathsByBarangay: cleanedDeathsByBarangay,
            deathsByMonthAndBarangay: cleanedDeathsByMonthAndBarangay,
            year
        });

    } catch (error: any) {
        console.error('Error fetching death reports:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch death reports',
                details: error.message
            },
            { status: 500 }
        );
    }
}