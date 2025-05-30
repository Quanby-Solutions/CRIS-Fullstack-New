// Updated api/marriage-report/base/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// TS shapes for JSON columns
interface LicenseDetails {
    marriageAgreement?: boolean
}

interface DelayedAffidavit {
    delayedRegistration?: 'No' | 'Yes'
}

interface SolemnizingOfficer {
    name?: string;
    position?: string;
    registryNoExpiryDate?: string
}

interface RegisteredByOffice {
    date?: string;
    nameInPrint?: string;
    titleOrPosition?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const startYear = parseInt(searchParams.get('startYear') ?? '2024', 10)
        const startMonth = parseInt(searchParams.get('startMonth') ?? '1', 10)
        const endYear = parseInt(searchParams.get('endYear') ?? '2025', 10)
        const endMonth = parseInt(searchParams.get('endMonth') ?? '5', 10)

        const startDate = new Date(startYear, startMonth - 1, 1)
        const endDate = new Date(endYear, endMonth, 0) // Last day of the month

        // Set time to end of day for the end date to include the entire day
        endDate.setHours(23, 59, 59, 999)

        // Fetch raw forms with additional fields for date filtering
        const forms = await prisma.baseRegistryForm.findMany({
            where: {
                formType: 'MARRIAGE',
                cityMunicipality: { contains: 'Legazpi', mode: 'insensitive' },
            },
            select: {
                registeredByDate: true,
                marriageCertificateForm: {
                    select: {
                        husbandAge: true,
                        wifeAge: true,
                        marriageLicenseDetails: true,
                        affidavitOfdelayedRegistration: true,
                        solemnizingOfficer: true,
                        registeredByOffice: true,
                    }
                }
            }
        })

        // Filter forms based on registration date criteria
        const validForms = forms
            .filter(f => f.marriageCertificateForm != null)
            .filter(f => {
                // First try to use registeredByDate from baseRegistryForm
                if (f.registeredByDate) {
                    const regDate = new Date(f.registeredByDate)
                    return regDate >= startDate && regDate <= endDate
                }

                // If registeredByDate is empty, fall back to registeredByOffice.date
                const registeredByOffice = f.marriageCertificateForm?.registeredByOffice as RegisteredByOffice | undefined
                if (registeredByOffice?.date) {
                    const regDate = new Date(registeredByOffice.date)
                    return regDate >= startDate && regDate <= endDate
                }

                // If neither date is available, exclude this record
                return false
            })

        const total = validForms.length

        // Count with/without license
        const withLicense = validForms.filter(f => {
            const lic = f.marriageCertificateForm!.marriageLicenseDetails as LicenseDetails | undefined
            return lic?.marriageAgreement === true
        }).length
        const noLicense = total - withLicense

        // On-time vs late registration
        const onTime = validForms.filter(f => {
            const aff = f.marriageCertificateForm!.affidavitOfdelayedRegistration as DelayedAffidavit | undefined
            return aff?.delayedRegistration === 'No'
        }).length
        const late = total - onTime

        // Count ceremony types based on solemnizing officer position
        let civilCeremony = 0
        let romanCatholic = 0
        let muslim = 0
        let tribal = 0
        let otherReligious = 0

        // Define pattern arrays for each category
        const civilPatterns = ['mayor', 'judge', 'justice', 'fiscal', 'attorney', 'lawyer', 'court'];
        const catholicPatterns = ['father', 'rev.', 'rev ', 'reverend', 'priest', 'pastor', 'bishop', 'cardinal', 'deacon', 'minister', 'fr.', 'fr '];
        const muslimPatterns = ['imam', 'ustadz', 'sheikh', 'islamic', 'muslim'];
        const tribalPatterns = ['tribal', 'elder', 'indigenous', 'chieftain', 'datu', 'chief'];

        validForms.forEach(f => {
            const officer = f.marriageCertificateForm!.solemnizingOfficer as SolemnizingOfficer;
            // Convert to lowercase and ensure it's a string
            const position = (officer?.position || '').toString().toLowerCase().trim();

            // Use some() to check if any pattern matches
            const isCivil = civilPatterns.some(pattern => position.includes(pattern));
            const isCatholic = catholicPatterns.some(pattern => position.includes(pattern));
            const isMuslim = muslimPatterns.some(pattern => position.includes(pattern));
            const isTribal = tribalPatterns.some(pattern => position.includes(pattern));

            // Categorize based on matches
            if (isCivil) {
                civilCeremony++;
            } else if (isCatholic) {
                romanCatholic++;
            } else if (isMuslim) {
                muslim++;
            } else if (isTribal) {
                tribal++;
            } else {
                otherReligious++;
            }
        })

        // Age buckets - already updated
        const buckets = [
            { label: '17 and under', min: 0, max: 17 },
            { label: '18-24', min: 18, max: 24 },
            { label: '25-29', min: 25, max: 29 },
            { label: '30-34', min: 30, max: 34 },
            { label: '35-39', min: 35, max: 39 },
            { label: '40-44', min: 40, max: 44 },
            { label: '45-49', min: 45, max: 49 },
            { label: '50-54', min: 50, max: 54 },
            { label: '55-59', min: 55, max: 59 },
            { label: '60+', min: 60, max: Infinity },
        ]

        // Initialize age counts
        const ageCounts = buckets.map(b => ({ bucket: b.label, bride: 0, groom: 0 }))

        // Tally ages
        validForms.forEach(f => {
            const cert = f.marriageCertificateForm!
            const { husbandAge, wifeAge } = cert
            buckets.forEach((bk, i) => {
                if (husbandAge >= bk.min && husbandAge <= bk.max) {
                    ageCounts[i].groom++
                }
                if (wifeAge >= bk.min && wifeAge <= bk.max) {
                    ageCounts[i].bride++
                }
            })
        })

        return NextResponse.json({
            summary: {
                total,
                withLicense,
                noLicense,
                onTime,
                late,
                civilCeremony,
                romanCatholic,
                muslim,
                tribal,
                otherReligious
            },
            ageCounts
        }, { status: 200 })

    } catch (err: any) {
        console.error('Error fetching marriage stats:', err)
        return NextResponse.json({
            error: 'Unable to fetch marriage statistics',
            details: err.message
        }, { status: 500 })
    }
}