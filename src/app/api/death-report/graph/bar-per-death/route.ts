// app/api/death-reports/graph/bar-per-death/route.ts
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
                                    deathsByBarangay[masterBarangay]++;
                                    foundMatch = true;
                                    break;
                                }
                                continue;
                            }

                            // For non-directional barangays, if one is a substring of the other
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

        // Calculate total deaths in Legazpi City
        const totalDeathsInLegazpi = Object.values(deathsByBarangay).reduce((sum, count) => sum + count, 0);

        // Calculate percentages
        const percentagesByBarangay: Record<string, number> = {};
        Object.entries(deathsByBarangay).forEach(([barangay, count]) => {
            if (totalDeathsInLegazpi > 0) {
                // Calculate percentage with 1 decimal place precision
                const percentage = parseFloat(((count / totalDeathsInLegazpi) * 100).toFixed(1));
                if (percentage > 0) { // Only include barangays with deaths
                    percentagesByBarangay[barangay] = percentage;
                }
            }
        });

        // Sort by percentage in descending order for better visualization
        const sortedPercentages = Object.entries(percentagesByBarangay)
            .sort(([, a], [, b]) => b - a)
            .reduce((result, [barangay, percentage]) => {
                result[barangay] = percentage;
                return result;
            }, {} as Record<string, number>);

        // Calculate percentages by month
        const percentagesByMonth: Record<string, Record<string, number>> = {};

        for (let month = 1; month <= 12; month++) {
            // Filter deaths for this month
            const monthDeaths = deathRecords.filter(record => {
                // Fix TypeScript error by checking if registeredByDate exists
                if (!record.registeredByDate) return false;

                const recordDate = new Date(record.registeredByDate);
                return recordDate.getMonth() + 1 === month;
            });

            // Create a new object for barangay counts for this month
            const monthBarangayCounts: Record<string, number> = {};

            // Initialize with zeros
            legazpiData["LEGAZPI CITY"].barangay_list.forEach(barangay => {
                monthBarangayCounts[barangay] = 0;
            });

            // Process each death record for this month (using same logic as above)
            monthDeaths.forEach(record => {
                if (record.deathCertificateForm) {
                    const residence = record.deathCertificateForm.residence as any;

                    if (
                        residence &&
                        residence.cityMunicipality &&
                        String(residence.cityMunicipality).toLowerCase().includes('legazpi')
                    ) {
                        const rawBarangay = residence.barangay ? String(residence.barangay).trim() : 'Unknown';

                        if (barangays.has(rawBarangay)) {
                            monthBarangayCounts[rawBarangay]++;
                        } else {
                            // Same matching logic as above
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
                                    monthBarangayCounts[masterBarangay]++;
                                    foundMatch = true;
                                    break;
                                }

                                // Directional handling
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
                                        monthBarangayCounts[masterBarangay]++;
                                        foundMatch = true;
                                        break;
                                    }
                                    continue;
                                }

                                if (!hasDirection) {
                                    if (normalizedBarangay.includes(normalizedMaster) ||
                                        normalizedMaster.includes(normalizedBarangay)) {
                                        monthBarangayCounts[masterBarangay]++;
                                        foundMatch = true;
                                        break;
                                    }
                                }
                            }

                            if (!foundMatch) {
                                if (!monthBarangayCounts["Unknown"]) {
                                    monthBarangayCounts["Unknown"] = 0;
                                }
                                monthBarangayCounts["Unknown"]++;
                            }
                        }
                    }
                }
            });

            // Calculate total deaths for this month
            const totalMonthDeaths = Object.values(monthBarangayCounts).reduce((sum, count) => sum + count, 0);

            // Calculate percentages for this month
            percentagesByMonth[month.toString()] = {};

            if (totalMonthDeaths > 0) {
                Object.entries(monthBarangayCounts).forEach(([barangay, count]) => {
                    const percentage = parseFloat(((count / totalMonthDeaths) * 100).toFixed(1));
                    if (percentage > 0) {
                        percentagesByMonth[month.toString()][barangay] = percentage;
                    }
                });
            }
        }

        // Create data for visualization similar to the chart in the image
        const visualizationData = Object.entries(sortedPercentages).map(([barangay, percentage]) => ({
            barangay,
            percentage
        }));

        // Return the data
        return NextResponse.json({
            totalDeathsInLegazpi: totalDeathsInLegazpi,
            percentagesByBarangay: sortedPercentages,
            percentagesByMonth: percentagesByMonth,
            visualizationData: visualizationData,
            year
        });

    } catch (error: any) {
        console.error('Error calculating death percentages:', error);
        return NextResponse.json(
            {
                error: 'Failed to calculate death percentages',
                details: error.message
            },
            { status: 500 }
        );
    }
}