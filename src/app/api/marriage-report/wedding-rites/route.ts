// src/app/api/marriage-report/wedding-rites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SolemnizingOfficer {
    name?: string;
    position?: string;
    registryNoExpiryDate?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') ?? new Date().getFullYear().toString(), 10);

        // Define pattern arrays for each category - EXACTLY matching the base route
        const civilPatterns = ['mayor', 'judge', 'justice', 'fiscal', 'attorney', 'lawyer', 'court'];
        const catholicPatterns = ['father', 'rev.', 'rev ', 'reverend', 'priest', 'pastor', 'bishop', 'cardinal', 'deacon', 'minister', 'fr.', 'fr '];
        const muslimPatterns = ['imam', 'ustadz', 'sheikh', 'islamic', 'muslim'];
        const tribalPatterns = ['tribal', 'elder', 'indigenous', 'chieftain', 'datu', 'chief'];

        // Start date: January 1st of the selected year
        const startDate = new Date(year, 0, 1);
        // End date: January 1st of the next year
        const endDate = new Date(year + 1, 0, 1);

        // Fetch all marriage forms for the year
        const forms = await prisma.baseRegistryForm.findMany({
            where: {
                formType: 'MARRIAGE',
                cityMunicipality: { contains: 'Legazpi', mode: 'insensitive' },
                createdAt: {
                    gte: startDate,
                    lt: endDate
                },
            },
            select: {
                createdAt: true,
                marriageCertificateForm: {
                    select: {
                        solemnizingOfficer: true,
                    }
                }
            }
        });

        // Only include entries with a certificate
        const validForms = forms.filter(f => f.marriageCertificateForm != null);

        // Initialize monthly counts
        const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
            const month = new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
            return {
                month,
                civil: 0,
                catholic: 0,
                muslim: 0,
                tribal: 0,
                other: 0
            };
        });

        // Track total counts
        let totalCivil = 0;
        let totalCatholic = 0;
        let totalMuslim = 0;
        let totalTribal = 0;
        let totalOther = 0;

        // Process each form to categorize by wedding rite and month
        validForms.forEach(form => {
            const month = form.createdAt.getMonth();
            const officer = form.marriageCertificateForm!.solemnizingOfficer as SolemnizingOfficer;
            // Convert to lowercase and ensure it's a string
            const position = (officer?.position || '').toString().toLowerCase().trim();

            // Use some() to check if any pattern matches - EXACTLY as in base route
            const isCivil = civilPatterns.some(pattern => position.includes(pattern));
            const isCatholic = catholicPatterns.some(pattern => position.includes(pattern));
            const isMuslim = muslimPatterns.some(pattern => position.includes(pattern));
            const isTribal = tribalPatterns.some(pattern => position.includes(pattern));

            // Categorize based on matches
            if (isCivil) {
                monthlyData[month].civil++;
                totalCivil++;
            } else if (isCatholic) {
                monthlyData[month].catholic++;
                totalCatholic++;
            } else if (isMuslim) {
                monthlyData[month].muslim++;
                totalMuslim++;
            } else if (isTribal) {
                monthlyData[month].tribal++;
                totalTribal++;
            } else {
                monthlyData[month].other++;
                totalOther++;
            }
        });

        // Set totals from the actual calculated counts
        const totals = {
            civil: totalCivil,
            catholic: totalCatholic,
            muslim: totalMuslim,
            tribal: totalTribal,
            other: totalOther,
            total: validForms.length
        };

        // Log totals for debugging
        console.log(`Year ${year} totals:`, totals);

        return NextResponse.json({
            year,
            monthlyData,
            totals
        }, { status: 200 });

    } catch (err: any) {
        console.error('Error fetching wedding rites statistics:', err);
        return NextResponse.json({
            error: 'Unable to fetch wedding rites statistics',
            details: err.message
        }, { status: 500 });
    }
}