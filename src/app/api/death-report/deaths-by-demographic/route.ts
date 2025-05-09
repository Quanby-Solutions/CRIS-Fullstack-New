// app/api/death-report/deaths-by-demographic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { legazpiData } from "@/lib/utils/barangay";

interface AgeGenderCount {
    male: {
        lessThan1Year: number;
        oneToFourYears: number;
        fiveToFourteenYears: number;
        fifteenToFortyNineYears: number;
        fiftyToSixtyFourYears: number;
        sixtyFiveAndAbove: number;
        total: number;
    };
    female: {
        lessThan1Year: number;
        oneToFourYears: number;
        fiveToFourteenYears: number;
        fifteenToFortyNineYears: number;
        fiftyToSixtyFourYears: number;
        sixtyFiveAndAbove: number;
        total: number;
    };
    grandTotal: number;
}

interface Residence {
    cityMunicipality?: string;
    barangay?: string;
}

interface DeathCertificateForm {
    residence?: Residence;
    sex?: "Male" | "Female";
    ageAtDeath?: any; // Adjust this type as needed
}

interface BaseRegistryForm {
    formType: string;
    dateOfRegistration: Date;
    deathCertificateForm?: DeathCertificateForm;
}

interface DeathsByDemographicData {
    deathsByDemographic: Record<string, AgeGenderCount>;
    totalsByDemographic: AgeGenderCount;
    year: number;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(
            searchParams.get("year") ?? new Date().getFullYear().toString(),
            10
        );

        // Build start/end dates for the year
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // Fetch all death records for the year
        const deathRecords = await prisma.baseRegistryForm.findMany({
            where: {
                formType: "DEATH",
                dateOfRegistration: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                deathCertificateForm: true,
            },
        });

        // Get list of all barangays from Legazpi
        const legazpiBarangays = legazpiData["LEGAZPI CITY"].barangay_list;

        // Initialize data structure for counting deaths by barangay, age group, and gender
        const deathsByDemographic: Record<string, AgeGenderCount> = {};

        // Initialize counts for each barangay
        const initializeAgeGenderCount = (): AgeGenderCount => ({
            male: {
                lessThan1Year: 0,
                oneToFourYears: 0,
                fiveToFourteenYears: 0,
                fifteenToFortyNineYears: 0,
                fiftyToSixtyFourYears: 0,
                sixtyFiveAndAbove: 0,
                total: 0,
            },
            female: {
                lessThan1Year: 0,
                oneToFourYears: 0,
                fiveToFourteenYears: 0,
                fifteenToFortyNineYears: 0,
                fiftyToSixtyFourYears: 0,
                sixtyFiveAndAbove: 0,
                total: 0,
            },
            grandTotal: 0,
        });

        // Initialize all Legazpi barangays
        legazpiBarangays.forEach((barangay) => {
            deathsByDemographic[barangay] = initializeAgeGenderCount();
        });

        // Helper function to determine age group
        const getAgeGroup = (ageAtDeath: any) => {
            if (!ageAtDeath) return null;
            // Parse age values, defaulting to 0 if undefined
            const years = ageAtDeath.years !== undefined ? parseInt(ageAtDeath.years) : 0;
            const months = ageAtDeath.months !== undefined ? parseInt(ageAtDeath.months) : 0;
            const days = ageAtDeath.days !== undefined ? parseInt(ageAtDeath.days) : 0;
            const hours = ageAtDeath.hours !== undefined ? parseInt(ageAtDeath.hours) : 0;
            const minutes = ageAtDeath.minutes !== undefined ? parseInt(ageAtDeath.minutes) : 0;
            // If years is 0 or undefined, but other values are present, it's less than 1 year
            if ((years === 0 || years === undefined) && (months > 0 || days > 0 || hours > 0 || minutes > 0)) {
                return "lessThan1Year";
            }
            // Age groups based on years
            if (years === 0) return "lessThan1Year";
            if (years >= 1 && years <= 4) return "oneToFourYears";
            if (years >= 5 && years <= 14) return "fiveToFourteenYears";
            if (years >= 15 && years <= 49) return "fifteenToFortyNineYears";
            if (years >= 50 && years <= 64) return "fiftyToSixtyFourYears";
            if (years >= 65) return "sixtyFiveAndAbove";
            // Default case if something went wrong
            return null;
        };

        // Process each death record
        deathRecords.forEach((record) => {
            const deathForm = record.deathCertificateForm;
            if (!deathForm) return;

            // Check if the residence cityMunicipality is Legazpi City or City of Legazpi
            const residence = deathForm.residence as Residence | undefined;
            // if (
            //     residence?.cityMunicipality !== "Legazpi City" &&
            //     residence?.cityMunicipality !== "City of Legazpi"
            // ) {
            //     return;
            // }

            // Determine barangay
            let barangay = "Unknown";
            if (
                residence?.barangay &&
                legazpiBarangays.includes(residence.barangay)
            ) {
                barangay = residence.barangay;
            }

            // Ensure barangay exists in our data structures
            if (!deathsByDemographic[barangay]) {
                deathsByDemographic[barangay] = initializeAgeGenderCount();
            }

            // Determine gender (sex) - direct from deathCertificateForm
            const gender = deathForm.sex === "Female" ? "female" : "male";

            // Parse age at death
            let ageAtDeath;
            if (deathForm.ageAtDeath) {
                if (typeof deathForm.ageAtDeath === "string") {
                    try {
                        ageAtDeath = JSON.parse(deathForm.ageAtDeath);
                    } catch (e) {
                        console.error("Error parsing ageAtDeath JSON:", e);
                    }
                } else {
                    ageAtDeath = deathForm.ageAtDeath;
                }
            }

            // Determine age group
            const ageGroup = getAgeGroup(ageAtDeath);

            // Increment counts if we have valid age group
            if (ageGroup) {
                // Increment overall counts
                deathsByDemographic[barangay][gender][ageGroup]++;
                deathsByDemographic[barangay][gender].total++;
                deathsByDemographic[barangay].grandTotal++;
            }
        });

        // Calculate totals across all barangays
        const totalsByDemographic: AgeGenderCount = initializeAgeGenderCount();
        Object.values(deathsByDemographic).forEach(counts => {
            // Male totals
            totalsByDemographic.male.lessThan1Year += counts.male.lessThan1Year;
            totalsByDemographic.male.oneToFourYears += counts.male.oneToFourYears;
            totalsByDemographic.male.fiveToFourteenYears += counts.male.fiveToFourteenYears;
            totalsByDemographic.male.fifteenToFortyNineYears += counts.male.fifteenToFortyNineYears;
            totalsByDemographic.male.fiftyToSixtyFourYears += counts.male.fiftyToSixtyFourYears;
            totalsByDemographic.male.sixtyFiveAndAbove += counts.male.sixtyFiveAndAbove;
            totalsByDemographic.male.total += counts.male.total;
            // Female totals
            totalsByDemographic.female.lessThan1Year += counts.female.lessThan1Year;
            totalsByDemographic.female.oneToFourYears += counts.female.oneToFourYears;
            totalsByDemographic.female.fiveToFourteenYears += counts.female.fiveToFourteenYears;
            totalsByDemographic.female.fifteenToFortyNineYears += counts.female.fifteenToFortyNineYears;
            totalsByDemographic.female.fiftyToSixtyFourYears += counts.female.fiftyToSixtyFourYears;
            totalsByDemographic.female.sixtyFiveAndAbove += counts.female.sixtyFiveAndAbove;
            totalsByDemographic.female.total += counts.female.total;
            // Grand total
            totalsByDemographic.grandTotal += counts.grandTotal;
        });

        // Return the results
        return NextResponse.json({
            deathsByDemographic,
            totalsByDemographic,
            year,
        });
    } catch (error: any) {
        console.error("Error in deaths-by-demographic API:", error);
        return NextResponse.json(
            { error: "Failed to fetch demographic data", details: error.message },
            { status: 500 }
        );
    }
}