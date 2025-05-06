// src/app/api/statistics/marriage-age/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TS shapes for JSON columns
interface LicenseDetails { marriageAgreement?: boolean }
interface DelayedAffidavit { delayedRegistration?: 'No' | 'Yes' }

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') ?? new Date().getFullYear().toString(), 10);

        // Get all marriage forms for the specified year in Legazpi
        const forms = await prisma.baseRegistryForm.findMany({
            where: {
                formType: 'MARRIAGE',
                cityMunicipality: { contains: 'Legazpi', mode: 'insensitive' },
                createdAt: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                },
            },
            select: {
                id: true,
                createdAt: true,
                marriageCertificateForm: {
                    select: {
                        husbandAge: true,
                        wifeAge: true,
                    }
                }
            }
        });

        // Filter out forms without marriage certificate data
        const validForms = forms.filter(f => f.marriageCertificateForm != null);

        // Age buckets
        const buckets = [
            { label: 'Under 15', min: 0, max: 14 },
            { label: '15-19', min: 15, max: 19 },
            { label: '20-24', min: 20, max: 24 },
            { label: '25-29', min: 25, max: 29 },
            { label: '30-34', min: 30, max: 34 },
            { label: '35-39', min: 35, max: 39 },
            { label: '40-44', min: 40, max: 44 },
            { label: '45-49', min: 45, max: 49 },
            { label: '50-54', min: 50, max: 54 },
            { label: '55-59', min: 55, max: 59 },
            { label: '60+', min: 60, max: Infinity },
        ];

        // Organize data by month
        const monthlyData = Array.from({ length: 12 }, (_, month) => {
            // Get marriages for this month
            const monthForms = validForms.filter(f =>
                f.createdAt.getMonth() === month &&
                f.createdAt.getFullYear() === year
            );

            // Count male and female by age buckets
            const maleCounts = buckets.map(bucket => {
                return monthForms.filter(f => {
                    const age = f.marriageCertificateForm?.husbandAge || 0;
                    return age >= bucket.min && age <= bucket.max;
                }).length;
            });

            const femaleCounts = buckets.map(bucket => {
                return monthForms.filter(f => {
                    const age = f.marriageCertificateForm?.wifeAge || 0;
                    return age >= bucket.min && age <= bucket.max;
                }).length;
            });

            // Create month data point
            return {
                month: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
                date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
                male: maleCounts.reduce((sum, count) => sum + count, 0),
                female: femaleCounts.reduce((sum, count) => sum + count, 0)
            };
        });

        // Calculate aggregated data by age bucket
        const ageBucketData = buckets.map((bucket, index) => {
            return {
                label: bucket.label,
                male: validForms.filter(f => {
                    const age = f.marriageCertificateForm?.husbandAge || 0;
                    return age >= bucket.min && age <= bucket.max;
                }).length,
                female: validForms.filter(f => {
                    const age = f.marriageCertificateForm?.wifeAge || 0;
                    return age >= bucket.min && age <= bucket.max;
                }).length
            };
        });

        return NextResponse.json({
            year,
            monthlyData,
            ageBucketData,
            totalMarriages: validForms.length,
            totalMale: validForms.length,
            totalFemale: validForms.length
        }, { status: 200 });

    } catch (err: any) {
        console.error('Error fetching marriage age stats:', err);
        return NextResponse.json({
            error: 'Unable to fetch marriage age statistics',
            details: err.message
        }, { status: 500 });
    }
}