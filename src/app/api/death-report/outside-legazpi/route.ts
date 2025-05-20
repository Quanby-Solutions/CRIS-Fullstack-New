// app/api/death-report/outside-legazpi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define a type for the residence categories
type ResidenceCategory = 'legazpi' | 'outsideLegazpiPhilippines' | 'foreignCountries';

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

        // Initialize counters with three categories
        const deathsByResidenceType = {
            legazpi: 0,
            outsideLegazpiPhilippines: 0,
            foreignCountries: 0
        };

        // Initialize monthly counters with three categories
        const deathsByResidenceTypeMonthly: Record<string, {
            legazpi: number,
            outsideLegazpiPhilippines: number,
            foreignCountries: number
        }> = {};

        for (let month = 1; month <= 12; month++) {
            deathsByResidenceTypeMonthly[month.toString()] = {
                legazpi: 0,
                outsideLegazpiPhilippines: 0,
                foreignCountries: 0
            };
        }

        // Process each death record
        deathRecords.forEach(record => {
            if (record.deathCertificateForm) {
                const residence = record.deathCertificateForm.residence as any;

                // First check if the person is from a foreign country
                let residenceCategory: ResidenceCategory = 'outsideLegazpiPhilippines'; // Default if not Legazpi or foreign

                if (residence) {
                    // Check country first
                    const country = residence.country
                        ? String(residence.country).trim().toLowerCase()
                        : 'philippines'; // Default to Philippines if not specified

                    if (country !== '' &&
                        !['philippines', 'philippine', 'pilipinas', 'ph', 'phl'].includes(country)) {
                        // This is a foreign resident
                        residenceCategory = 'foreignCountries';
                    } else {
                        // This is a Philippine resident, check if from Legazpi
                        if (
                            residence.cityMunicipality &&
                            String(residence.cityMunicipality).toLowerCase().includes('legazpi')
                        ) {
                            residenceCategory = 'legazpi';
                        }
                        // Otherwise, keep as outsideLegazpiPhilippines
                    }
                }

                // Count by residence category
                deathsByResidenceType[residenceCategory]++;

                // Count by month - Fix TypeScript error by checking if registeredByDate exists
                if (record.registeredByDate) {
                    const recordDate = new Date(record.registeredByDate);
                    const month = recordDate.getMonth() + 1; // January is 0
                    deathsByResidenceTypeMonthly[month.toString()][residenceCategory]++;
                }
            }
        });

        // Calculate the outsideLegazpi total (for backward compatibility)
        const outsideLegazpi = deathsByResidenceType.outsideLegazpiPhilippines +
            deathsByResidenceType.foreignCountries;

        // Return the data
        return NextResponse.json({
            totalDeaths: deathRecords.length,
            deathsByResidenceType: {
                ...deathsByResidenceType,
                outsideLegazpi // Add for backward compatibility
            },
            deathsByResidenceTypeMonthly,
            year
        });

    } catch (error: any) {
        console.error('Error fetching outside Legazpi death reports:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch outside Legazpi death reports',
                details: error.message
            },
            { status: 500 }
        );
    }
}