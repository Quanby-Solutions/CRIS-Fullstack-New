// app/api/death-report/burial-method/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define types for cemetery categories
type CemeteryType = 'publicCemetery' | 'privateCemetery' | 'cremation' | 'withTransferPermit' | 'withoutTransferPermit';
type LocationType = 'legazpi' | 'outsideLegazpi';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(
            searchParams.get('year') ?? new Date().getFullYear().toString(),
            10
        );

        // Build start/end for the year
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // Grab all death records in that year
        const deathRecords = await prisma.baseRegistryForm.findMany({
            where: {
                formType: 'DEATH',
                dateOfRegistration: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: { deathCertificateForm: true },
        });

        // Top-level counts
        const burialCounts: Record<LocationType, Record<string, number>> & {
            cremation: number;
            withTransferPermit: number;
            withoutTransferPermit: number;
            notStated: number; // Added only global Not Stated
        } = {
            legazpi: {
                publicCemetery: 0,
                privateCemetery: 0,
                withTransferPermit: 0,
                withoutTransferPermit: 0,
            },
            outsideLegazpi: {
                publicCemetery: 0,
                privateCemetery: 0,
                withTransferPermit: 0,
                withoutTransferPermit: 0,
            },
            cremation: 0,
            withTransferPermit: 0,
            withoutTransferPermit: 0,
            notStated: 0, // Global not stated count only
        };

        // Monthly buckets
        const burialCountsMonthly: Record<string, typeof burialCounts> = {};
        for (let m = 1; m <= 12; m++) {
            burialCountsMonthly[m] = JSON.parse(JSON.stringify(burialCounts));
            // reset global cremation/transfer/notStated totals inside each month
            burialCountsMonthly[m].cremation = 0;
            burialCountsMonthly[m].withTransferPermit = 0;
            burialCountsMonthly[m].withoutTransferPermit = 0;
            burialCountsMonthly[m].notStated = 0;
        }

        // Phrases that indicate "not stated" or unknown cemetery
        const notStatedPhrases = [
            'do not know',
            'don\'t know', 
            'dont know',
            'unknown',
            'n/a',
            'not applicable',
            'not available',
            'not stated',
            'not specified',
            'unspecified',
            'not determined',
            'not indicated',
            'not filled',
            'none',
            'pending',
            'undetermined',
            'blank'
        ];

        deathRecords.forEach((record) => {
            const form = record.deathCertificateForm;
            if (!form) return;

            const month = new Date(record.dateOfRegistration).getMonth() + 1;
            const bucket = burialCountsMonthly[month];

            const hasPermit = typeof form.transferPermit === 'object' && form.transferPermit !== null && 'number' in form.transferPermit;
            // track transfer vs no-transfer at both global and monthly
            if (hasPermit) {
                burialCounts.withTransferPermit++;
                bucket.withTransferPermit++;
            } else {
                burialCounts.withoutTransferPermit++;
                bucket.withoutTransferPermit++;
            }

            // cremation?
            if (form.corpseDisposal?.toLowerCase().includes('cremation')) {
                burialCounts.cremation++;
                bucket.cremation++;
                return;
            }

            // Get cemetery name
            const cemeteryName = (form.cemeteryOrCrematory as any)?.name?.toLowerCase() ?? '';
            
            // Check if it's a "not stated" case
            const isNotStated = cemeteryName === '' || 
                notStatedPhrases.some(phrase => cemeteryName.includes(phrase));
            
            // If it's not stated, count it as global Not Stated
            if (isNotStated) {
                burialCounts.notStated++;
                bucket.notStated++;
                return; // Skip further processing - it's already counted
            }
            
            // burial: location + type
            if (form.corpseDisposal?.toLowerCase().includes('burial')) {
                let loc: LocationType = 'outsideLegazpi';
                let type: CemeteryType = 'privateCemetery';

                const addr = (form.cemeteryOrCrematory as any)?.address;
                if (addr?.cityMunicipality?.toLowerCase().includes('legazpi')) {
                    loc = 'legazpi';
                }

                // Determine if public or private
                if (
                    cemeteryName.includes('public') ||
                    cemeteryName.includes('municipal') ||
                    cemeteryName.includes('city') ||
                    cemeteryName.includes('government')
                ) {
                    type = 'publicCemetery';
                }

                // bump both global and monthly
                (burialCounts as any)[loc][type]++;
                (bucket as any)[loc][type]++;
            }
        });

        return NextResponse.json(
            {
                totalDeaths: deathRecords.length,
                burialCounts,
                burialCountsMonthly,
                year,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to fetch burial method reports', details: err.message },
            { status: 500 }
        );
    }
}