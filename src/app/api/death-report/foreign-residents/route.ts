// app/api/death-report/foreign-residents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

        // Convert year to start and end dates for filtering
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // Query for all death certificates in the specified year
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

        // Initialize counters for Philippines and foreign residents
        const deathsByNationality = {
            philippines: 0,
            foreignCountries: 0
        };

        // Initialize monthly counters
        const deathsByNationalityMonthly: Record<string, { philippines: number, foreignCountries: number }> = {};
        for (let month = 1; month <= 12; month++) {
            deathsByNationalityMonthly[month.toString()] = {
                philippines: 0,
                foreignCountries: 0
            };
        }

        // Track foreign countries separately
        const foreignCountryCounts: Record<string, number> = {};

        // Process each death record
        deathRecords.forEach(record => {
            if (record.deathCertificateForm) {
                const residence = record.deathCertificateForm.residence as any;

                // Determine if this is a Philippine resident or foreign
                let isPhilippineResident = true;
                let foreignCountry = 'Unknown';

                if (residence && residence.country) {
                    const country = String(residence.country).trim().toLowerCase();

                    // Check if it's not Philippines (account for different spellings)
                    if (country !== '' &&
                        !['philippines', 'philippine', 'pilipinas', 'ph', 'phl'].includes(country)) {
                        isPhilippineResident = false;
                        foreignCountry = String(residence.country).trim();

                        // Count by foreign country
                        if (foreignCountryCounts[foreignCountry]) {
                            foreignCountryCounts[foreignCountry]++;
                        } else {
                            foreignCountryCounts[foreignCountry] = 1;
                        }
                    }
                }

                // Count by nationality
                if (isPhilippineResident) {
                    deathsByNationality.philippines++;
                } else {
                    deathsByNationality.foreignCountries++;
                }

                // Count by month - fix the TypeScript error by checking if registeredByDate exists
                if (record.registeredByDate) {
                    const recordDate = new Date(record.registeredByDate);
                    const month = recordDate.getMonth() + 1; // January is 0

                    if (isPhilippineResident) {
                        deathsByNationalityMonthly[month.toString()].philippines++;
                    } else {
                        deathsByNationalityMonthly[month.toString()].foreignCountries++;
                    }
                }
            }
        });

        // Return the data
        return NextResponse.json({
            totalDeaths: deathRecords.length,
            deathsByNationality,
            deathsByNationalityMonthly,
            foreignCountryCounts,
            year
        });

    } catch (error: any) {
        console.error('Error fetching foreign resident death reports:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch foreign resident death reports',
                details: error.message
            },
            { status: 500 }
        );
    }
}