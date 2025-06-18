// app/api/death-report/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define a type for valid age group keys
type AgeGroupKey = 'lessThan1Year' | 'oneToFourYears' | 'fiveToFourteenYears' |
    'fifteenToFortyNineYears' | 'fiftyToSixtyFourYears' |
    'sixtyFiveAndAbove' | 'unknown';

// Define TypeScript interfaces for our statistics
interface AgeGroups {
    lessThan1Year: number;
    oneToFourYears: number;
    fiveToFourteenYears: number;
    fifteenToFortyNineYears: number;
    fiftyToSixtyFourYears: number;
    sixtyFiveAndAbove: number;
    unknown: number;
}

interface MonthlyStatistics {
    registration: {
        onTime: number;
        late: number;
    };
    gender: {
        male: number;
        female: number;
        unknown: number;
    };
    ageGroups: AgeGroups;
}

interface Statistics {
    totalDeaths: number;
    registration: {
        onTime: number;
        late: number;
    };
    gender: {
        male: number;
        female: number;
        unknown: number;
    };
    ageGroups: AgeGroups;
    monthly: Record<string, MonthlyStatistics>;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

        // Convert year to start and end dates for filtering
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // Query for all death certificates for the specified year
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

        console.log(`Found ${deathRecords.length} death records for year ${year}`);

        // Initialize statistics counters with proper TypeScript typing
        const statistics: Statistics = {
            totalDeaths: deathRecords.length,
            registration: {
                onTime: 0,
                late: 0,
            },
            gender: {
                male: 0,
                female: 0,
                unknown: 0,
            },
            ageGroups: {
                lessThan1Year: 0,
                oneToFourYears: 0,
                fiveToFourteenYears: 0,
                fifteenToFortyNineYears: 0,
                fiftyToSixtyFourYears: 0,
                sixtyFiveAndAbove: 0,
                unknown: 0,
            },
            // Initialize monthly with an empty object that will be properly typed
            monthly: {},
        };

        // Initialize monthly statistics
        for (let month = 1; month <= 12; month++) {
            // Use string keys for the monthly object to avoid TypeScript errors
            const monthKey = month.toString();

            statistics.monthly[monthKey] = {
                registration: {
                    onTime: 0,
                    late: 0,
                },
                gender: {
                    male: 0,
                    female: 0,
                    unknown: 0,
                },
                ageGroups: {
                    lessThan1Year: 0,
                    oneToFourYears: 0,
                    fiveToFourteenYears: 0,
                    fifteenToFortyNineYears: 0,
                    fiftyToSixtyFourYears: 0,
                    sixtyFiveAndAbove: 0,
                    unknown: 0,
                },
            };
        }

        // Debug data about records
        const recordMonths: Record<string, number> = {};
        const recordDebug: any[] = []; // Track detailed info about each record

        // Process each death record
        deathRecords.forEach((record, index) => {
            if (record.registeredByDate) {
                const recordDate = new Date(record.registeredByDate);

                // ✅ Use UTC-based grouping
                const month = recordDate.getUTCMonth() + 1; // 1-based
                const recordYear = recordDate.getUTCFullYear();

                if (recordYear !== year) {
                    console.warn(`Record ${record.id} has UTC year ${recordYear} but we're filtering for ${year}`);
                    return; // Skip if not in this year
                }

                const monthKey = month.toString();

                // Debug tracking
                recordMonths[monthKey] = (recordMonths[monthKey] || 0) + 1;

                const recordInfo: any = {
                    id: record.id,
                    date: record.registeredByDate,
                    dateUTC: recordDate.toISOString(),
                    monthUTC: month,
                    yearUTC: recordYear,
                    has_death_certificate: !!record.deathCertificateForm,
                };

                if (record.deathCertificateForm) {
                    const isLateRegistration = getIsLateRegistration(record.deathCertificateForm);
                    recordInfo.isLate = isLateRegistration;

                    if (isLateRegistration) {
                        statistics.registration.late++;
                        statistics.monthly[monthKey].registration.late++;
                    } else {
                        statistics.registration.onTime++;
                        statistics.monthly[monthKey].registration.onTime++;
                    }

                    const gender = getGender(record.deathCertificateForm);
                    recordInfo.gender = gender;

                    if (gender === 'MALE') {
                        statistics.gender.male++;
                        statistics.monthly[monthKey].gender.male++;
                    } else if (gender === 'FEMALE') {
                        statistics.gender.female++;
                        statistics.monthly[monthKey].gender.female++;
                    } else {
                        statistics.gender.unknown++;
                        statistics.monthly[monthKey].gender.unknown++;
                    }

                    const ageYears = getAgeYears(record.deathCertificateForm);
                    const ageGroup = getAgeGroup(ageYears);
                    recordInfo.ageYears = ageYears;
                    recordInfo.ageGroup = ageGroup;

                    incrementAgeGroup(statistics.ageGroups, ageGroup);
                    incrementAgeGroup(statistics.monthly[monthKey].ageGroups, ageGroup);
                } else {
                    recordInfo.isLate = false;
                    recordInfo.gender = 'UNKNOWN';
                    recordInfo.ageGroup = 'unknown';

                    statistics.gender.unknown++;
                    statistics.ageGroups.unknown++;
                    statistics.registration.onTime++;

                    statistics.monthly[monthKey].gender.unknown++;
                    statistics.monthly[monthKey].ageGroups.unknown++;
                    statistics.monthly[monthKey].registration.onTime++;
                }

                recordDebug.push(recordInfo);
            }
        });


        // Add detailed debug information to the response
        const debug = {
            totalRecords: deathRecords.length,
            recordsByMonth: recordMonths,
            monthlyStats: Object.keys(statistics.monthly).map(month => {
                const monthData = statistics.monthly[month];
                return {
                    month,
                    monthName: new Date(2000, parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' }),
                    onTime: monthData.registration.onTime,
                    late: monthData.registration.late,
                    male: monthData.gender.male,
                    female: monthData.gender.female,
                    ageGroups: monthData.ageGroups,
                    total: monthData.registration.onTime + monthData.registration.late
                };
            }),
            recordDetails: recordDebug.slice(0, 10), // Just include first 10 records to avoid response size issues
            statistics: statistics, // Include full statistics object in debug for comparison
            timezone: 'Asia/Manila', // Indicate that we're using Philippines time
            note: 'All date processing uses Philippines time (UTC+8) for grouping by month. Dates stored in UTC are converted to PH time for accurate monthly statistics.'
        };

        return NextResponse.json({
            statistics,
            year,
            debug // Include debug information
        });

    } catch (error: any) {
        console.error('Error fetching death statistics:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch death statistics',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// Helper function to safely increment an age group counter
function incrementAgeGroup(ageGroups: AgeGroups, key: AgeGroupKey): void {
    if (key === 'lessThan1Year') ageGroups.lessThan1Year++;
    else if (key === 'oneToFourYears') ageGroups.oneToFourYears++;
    else if (key === 'fiveToFourteenYears') ageGroups.fiveToFourteenYears++;
    else if (key === 'fifteenToFortyNineYears') ageGroups.fifteenToFortyNineYears++;
    else if (key === 'fiftyToSixtyFourYears') ageGroups.fiftyToSixtyFourYears++;
    else if (key === 'sixtyFiveAndAbove') ageGroups.sixtyFiveAndAbove++;
    else if (key === 'unknown') ageGroups.unknown++;
}

// Helper function to determine if registration was late
function getIsLateRegistration(deathCertificateForm: any): boolean {
    try {
        // Check for the delayedRegistration field
        if (deathCertificateForm.delayedRegistration) {
            const delayedRegistration = typeof deathCertificateForm.delayedRegistration === 'string'
                ? JSON.parse(deathCertificateForm.delayedRegistration)
                : deathCertificateForm.delayedRegistration;

            return delayedRegistration.isDelayed === true;
        }
        return false;
    } catch (error) {
        console.error('Error parsing delayed registration status:', error);
        return false;
    }
}

// Helper function to get gender
function getGender(deathCertificateForm: any): string {
    try {
        if (deathCertificateForm.sex) {
            return deathCertificateForm.sex;
        }
        return 'UNKNOWN';
    } catch (error) {
        console.error('Error parsing gender:', error);
        return 'UNKNOWN';
    }
}

// Helper function to get age in years
function getAgeYears(deathCertificateForm: any): number | null {
    try {
        if (deathCertificateForm.ageAtDeath) {
            const ageAtDeath = typeof deathCertificateForm.ageAtDeath === 'string'
                ? JSON.parse(deathCertificateForm.ageAtDeath)
                : deathCertificateForm.ageAtDeath;

            // First check if years is available
            if (ageAtDeath.years !== undefined && ageAtDeath.years !== null) {
                return Number(ageAtDeath.years);
            }

            // If years is not available, check months
            if (ageAtDeath.months !== undefined && ageAtDeath.months !== null) {
                // Convert months to years (anything less than 12 months is less than 1 year)
                return Number(ageAtDeath.months) < 12 ? 0 : 1;
            }

            // If months is not available, check days
            if (ageAtDeath.days !== undefined && ageAtDeath.days !== null) {
                // Any value in days means less than 1 year
                return 0;
            }

            // If even days is not available, check hours
            if (ageAtDeath.hours !== undefined && ageAtDeath.hours !== null) {
                // Any value in hours means less than 1 year
                return 0;
            }
        }

        // If no age information is available
        return null;
    } catch (error) {
        console.error('Error parsing age:', error);
        return null;
    }
}

// Helper function to categorize age into groups
function getAgeGroup(ageYears: number | null): AgeGroupKey {
    if (ageYears === null) return 'unknown';

    if (ageYears < 1) return 'lessThan1Year';
    if (ageYears >= 1 && ageYears <= 4) return 'oneToFourYears';
    if (ageYears >= 5 && ageYears <= 14) return 'fiveToFourteenYears';
    if (ageYears >= 15 && ageYears <= 49) return 'fifteenToFortyNineYears';
    if (ageYears >= 50 && ageYears <= 64) return 'fiftyToSixtyFourYears';
    if (ageYears >= 65) return 'sixtyFiveAndAbove';

    return 'unknown';
}