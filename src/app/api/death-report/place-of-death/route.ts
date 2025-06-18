// app/api/death-reports/place-of-death/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define a type for the place of death categories
type PlaceOfDeathCategory = 'hospital' | 'transient' | 'others';

// Define the type for monthly data
interface MonthlyPlaceOfDeathData {
    hospital: number;
    transient: number;
    others: number;
}

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

        // Initialize counters for each place of death category
        const deathsByPlaceOfDeath: MonthlyPlaceOfDeathData = {
            hospital: 0,
            transient: 0,
            others: 0
        };

        // Initialize monthly counters
        const deathsByPlaceOfDeathMonthly: Record<string, MonthlyPlaceOfDeathData> = {};
        for (let month = 1; month <= 12; month++) {
            deathsByPlaceOfDeathMonthly[month.toString()] = {
                hospital: 0,
                transient: 0,
                others: 0
            };
        }

        // Process each death record
        deathRecords.forEach(record => {
            if (record.deathCertificateForm) {
                const placeOfDeath = record.deathCertificateForm.placeOfDeath as any;

                // Determine the category based on the locationType and hospitalInstitution
                let category: PlaceOfDeathCategory = 'others';

                if (placeOfDeath && placeOfDeath.locationType) {
                    const locationType = String(placeOfDeath.locationType).toLowerCase();

                    if (locationType.includes('hospital')) {
                        // Check if it's a transient case
                        if (
                            placeOfDeath.hospitalInstitution &&
                            String(placeOfDeath.hospitalInstitution).toLowerCase().includes('transient')
                        ) {
                            category = 'transient';
                        } else {
                            category = 'hospital';
                        }
                    } else if (locationType.includes('transient')) {
                        category = 'transient';
                    }
                    // All other types fall into 'others' category
                }

                // Count by category
                deathsByPlaceOfDeath[category]++;

                // Count by month and category using UTC
                if (record.registeredByDate) {
                    const recordDate = new Date(record.registeredByDate);
                    const month = recordDate.getUTCMonth() + 1; // UTC month: Jan = 0, so +1

                    deathsByPlaceOfDeathMonthly[month.toString()][category]++;
                } else {
                    console.warn('Death record without date encountered:', record.id);
                }
            }
        });


        // Return the data
        return NextResponse.json({
            totalDeaths: deathRecords.length,
            deathsByPlaceOfDeath,
            deathsByPlaceOfDeathMonthly,
            year
        });

    } catch (error: any) {
        console.error('Error fetching place of death reports:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch place of death reports',
                details: error.message
            },
            { status: 500 }
        );
    }
}