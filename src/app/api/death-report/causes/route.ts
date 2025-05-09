// app/api/death-report/causes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define common causes of death based on image
const causeCategories = [
    'Ischaemic heart disease',
    'Neoplasms',
    'Cerebrovascular diseases',
    'Pneumonia',
    'Diabetes Mellitus',
    'Hypertensive diseases',
    'Chronic lower respiratory diseases',
    'Respiratory tuberculosis',
    'Other heart diseases',
    'Remainder of the genitourinary system',
    'All other external causes',
    'Transport accidents',
    'Remainder of diseases of the digestive system',
    'Diseases of the liver',
    'Certain conditions originating in the perinatal period',
    'Remainder of diseases of the nervous system',
    'Remainder of endocrine nutritional and metabolic diseases',
    'Remainder of diseases of the respiratory system',
    'Congenital malformations deformations and chromosomal abnormalities',
    'Diseases of the musculoskeletal system and connective tissue',
    'Maternal delivery of infant',
    'Other causes of death',
];

// Mapping of similar phrases or keywords to standardize cause categorization
const causeKeywordMapping: Record<string, string[]> = {
    'Ischaemic heart disease': ['ischemic', 'ischaemic', 'coronary', 'coronary artery', 'heart attack', 'myocardial infarction', 'mi', 'ihd'],
    'Neoplasms': ['cancer', 'tumor', 'tumour', 'malignant', 'carcinoma', 'sarcoma', 'leukemia', 'lymphoma', 'neoplasm'],
    'Cerebrovascular diseases': ['stroke', 'cerebral', 'cerebrovascular', 'brain hemorrhage', 'brain haemorrhage', 'cvd', 'cerebral infarction'],
    'Pneumonia': ['pneumonia', 'lung infection', 'pulmonary infection'],
    'Diabetes Mellitus': ['diabetes', 'diabetic', 'dm', 'diabetes mellitus', 'type 1 diabetes', 'type 2 diabetes'],
    'Hypertensive diseases': ['hypertension', 'high blood pressure', 'hypertensive'],
    'Chronic lower respiratory diseases': ['copd', 'chronic obstructive', 'asthma', 'bronchitis', 'emphysema', 'respiratory disease'],
    'Respiratory tuberculosis': ['tuberculosis', 'pulmonary tb', 'tb', 'lung tb'],
    'Other heart diseases': ['heart failure', 'cardiac arrest', 'arrhythmia', 'cardiomyopathy', 'valve', 'aortic', 'mitral'],
    'Remainder of the genitourinary system': ['kidney', 'renal', 'urinary', 'bladder', 'prostate', 'genital', 'urinary tract', 'kidney failure', 'renal failure'],
    'All other external causes': ['accident', 'injury', 'poisoning', 'trauma', 'wound', 'fall', 'burn', 'drowning'],
    'Transport accidents': ['vehicular', 'car accident', 'motor vehicle', 'road accident', 'traffic', 'collision', 'motorcycle', 'pedestrian'],
    'Remainder of diseases of the digestive system': ['digestive', 'intestinal', 'bowel', 'colon', 'appendicitis', 'peritonitis', 'gi', 'gastro'],
    'Diseases of the liver': ['liver', 'hepatic', 'cirrhosis', 'hepatitis', 'liver failure', 'jaundice', 'fatty liver'],
    'Certain conditions originating in the perinatal period': ['perinatal', 'newborn', 'birth asphyxia', 'prematurity', 'low birth weight', 'neonatal'],
    'Remainder of diseases of the nervous system': ['alzheimer', 'parkinson', 'multiple sclerosis', 'epilepsy', 'neuropathy', 'neurological', 'cns', 'nervous'],
    'Remainder of endocrine nutritional and metabolic diseases': ['thyroid', 'adrenal', 'pituitary', 'metabolic', 'endocrine', 'nutritional', 'electrolyte', 'obesity'],
    'Remainder of diseases of the respiratory system': ['respiratory', 'pulmonary', 'pleural', 'lung', 'pulmonary edema', 'influenza'],
    'Congenital malformations deformations and chromosomal abnormalities': ['congenital', 'birth defect', 'chromosomal', 'down syndrome', 'genetic', 'malformation', 'deformation'],
    'Diseases of the musculoskeletal system and connective tissue': ['musculoskeletal', 'bone', 'joint', 'arthritis', 'osteoporosis', 'lupus', 'rheumatoid', 'connective tissue'],
    'Maternal delivery of infant': ['maternal', 'postpartum', 'childbirth', 'delivery', 'puerperal', 'eclampsia', 'obstetric'],
    'Other causes of death': ['other', 'unknown', 'unspecified', 'undetermined', 'pending'],
};

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

        // Initialize counts for each cause and month
        const causeCounts: Record<string, number> = {};
        const monthlyData: Record<string, Record<string, number>> = {};

        // Initialize all categories with zero
        causeCategories.forEach(cause => {
            causeCounts[cause] = 0;

            // Initialize monthly data
            for (let month = 1; month <= 12; month++) {
                if (!monthlyData[month]) {
                    monthlyData[month] = {};
                }
                monthlyData[month][cause] = 0;
            }
        });

        // Function to determine cause category from text
        const determineCauseCategory = (causeText: string): string => {
            if (!causeText) return 'Other causes of death';

            causeText = causeText.toLowerCase().trim();

            // Check each category for keyword matches
            for (const [category, keywords] of Object.entries(causeKeywordMapping)) {
                for (const keyword of keywords) {
                    if (causeText.includes(keyword.toLowerCase())) {
                        return category;
                    }
                }
            }

            return 'Other causes of death';
        };

        // Process each death record
        deathRecords.forEach(record => {
            const form = record.deathCertificateForm;
            if (!form) return;

            // Get the month from the registration date
            const month = new Date(record.dateOfRegistration).getMonth() + 1;

            // Extract cause of death from form
            let causeOfDeath = '';

            // Try to get cause from different possible locations in the death certificate form
            if (form.causesOfDeath19b) {
                // Format: { immediate: { cause, interval }, antecedent: { cause, interval }, underlying: { cause, interval } }
                const causes19b = typeof form.causesOfDeath19b === 'string'
                    ? JSON.parse(form.causesOfDeath19b)
                    : form.causesOfDeath19b;

                if (causes19b?.underlying?.cause) {
                    causeOfDeath = causes19b.underlying.cause;
                } else if (causes19b?.immediate?.cause) {
                    causeOfDeath = causes19b.immediate.cause;
                }
            }

            // Backup: Check medical certificate if 19b not available
            if (!causeOfDeath && form.medicalCertificate) {
                const medical = typeof form.medicalCertificate === 'string'
                    ? JSON.parse(form.medicalCertificate)
                    : form.medicalCertificate;

                if (medical?.causesOfDeath?.underlying?.cause) {
                    causeOfDeath = medical.causesOfDeath.underlying.cause;
                } else if (medical?.causesOfDeath?.immediate?.cause) {
                    causeOfDeath = medical.causesOfDeath.immediate.cause;
                }
            }

            // Default to 'Other' if no cause found
            if (!causeOfDeath) {
                causeOfDeath = 'Other causes of death';
            }

            // Determine the category for this cause
            const category = determineCauseCategory(causeOfDeath);

            // Increment the overall count
            causeCounts[category]++;

            // Increment the monthly count
            monthlyData[month][category]++;
        });

        // Return the data
        return NextResponse.json(
            {
                totalDeaths: deathRecords.length,
                causeCounts,
                monthlyData,
                year,
                causeCategories, // Include the list of categories for reference
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to fetch causes of death', details: err.message },
            { status: 500 }
        );
    }
}