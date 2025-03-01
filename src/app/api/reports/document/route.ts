import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/report'
import { PrismaClient, Prisma, FormType, DocumentStatus } from '@prisma/client'
import { GroupByOption, ReportDataItem, groupDocumentsByPeriod, zeroFillMultipleYears, zeroFillGroups, DocumentWithBaseRegistryForm } from '@/lib/report-helpers'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const groupBy = (searchParams.get('groupBy') || 'yearly') as GroupByOption
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')
        const displayMode = searchParams.get('displayMode') || 'all'
        const classification = searchParams.get('classification') || 'all'
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10))

        // Build where clause for BaseRegistryForm (classification only)
        const baseFormWhere: Prisma.BaseRegistryFormWhereInput = {}

        if (classification !== 'all') {
            baseFormWhere.formType = classification.toUpperCase() as FormType
        }

        // Date filters will be applied later after fetching data
        // This allows us to fetch all documents while still filtering for display

        // Build the document where clause using the relation through BaseRegistryFormDocument
        const whereClause: Prisma.DocumentWhereInput = {
            baseRegistryForms: {
                some: {
                    baseRegistryForm: baseFormWhere
                }
            },
        }

        // Fetch all documents along with their BaseRegistryForm data
        const documents = await prisma.document.findMany({
            where: whereClause,
            include: {
                baseRegistryForms: {
                    include: {
                        baseRegistryForm: {
                            select: {
                                id: true,
                                formType: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        })

        // Transform the documents to include flattened baseRegistryForm data
        const transformedDocuments: DocumentWithBaseRegistryForm[] = documents.map(doc => {
            // Create a compatible BaseRegistryForm array with documentId
            const baseForms = doc.baseRegistryForms.map(relation => ({
                id: relation.baseRegistryForm.id,
                formType: relation.baseRegistryForm.formType,
                documentId: doc.id,
                createdAt: relation.baseRegistryForm.createdAt
            }));

            return {
                ...doc,
                BaseRegistryForm: baseForms
            } as DocumentWithBaseRegistryForm;
        });

        // Filter documents by date if date parameters are provided
        let filteredDocuments = transformedDocuments;
        if (startDateParam && endDateParam) {
            const startDate = new Date(startDateParam);
            const endDate = new Date(endDateParam);

            filteredDocuments = transformedDocuments.filter(doc => {
                // Get the earliest valid form date
                const validForms = doc.BaseRegistryForm.filter(
                    form => form.documentId && form.createdAt
                );

                if (validForms.length > 0) {
                    const earliest = new Date(
                        Math.min(...validForms.map(form => new Date(form.createdAt).getTime()))
                    );
                    return earliest >= startDate && earliest <= endDate;
                }

                // If no valid forms, use document creation date
                return doc.createdAt >= startDate && doc.createdAt <= endDate;
            });
        }

        // Group filtered documents by period
        const groups = groupDocumentsByPeriod(filteredDocuments, groupBy);

        // Handle zero-filling based on whether date filtering is applied
        let reportData: ReportDataItem[] = [];

        if (!startDateParam && !endDateParam) {
            // If no date filters, zero-fill all years
            // Fetch all available years from the base forms
            const allBaseForms = await prisma.baseRegistryForm.findMany({
                select: { createdAt: true },
            });

            const availableYearsSet = new Set<number>();
            allBaseForms.forEach(form => {
                availableYearsSet.add(new Date(form.createdAt).getFullYear());
            });

            const years = Array.from(availableYearsSet).sort();

            // Zero-fill for each year
            years.forEach(year => {
                reportData = reportData.concat(zeroFillGroups(groups, groupBy, year.toString()));
            });
        } else {
            // If date filters are applied, only zero-fill for the filtered years
            const yearsSet = new Set<number>();
            filteredDocuments.forEach(doc => {
                const validForms = doc.BaseRegistryForm.filter(
                    form => form.documentId && form.createdAt
                );

                if (validForms.length > 0) {
                    const earliest = new Date(
                        Math.min(...validForms.map(form => new Date(form.createdAt).getTime()))
                    );
                    yearsSet.add(earliest.getFullYear());
                } else {
                    yearsSet.add(new Date(doc.createdAt).getFullYear());
                }
            });

            yearsSet.forEach(year => {
                reportData = reportData.concat(zeroFillGroups(groups, groupBy, year.toString()));
            });
        }

        // Filter out periods with no documents if displayMode is 'hasDocuments'
        // if (displayMode === 'hasDocuments') {
        //     reportData = reportData.filter(item => item.totalDocuments > 0);
        // }

        // Sort periods chronologically
        reportData.sort((a, b) => {
            if (groupBy === 'yearly') {
                return parseInt(a.period) - parseInt(b.period);
            }
            return a.period.localeCompare(b.period);
        });

        const totalGroups = reportData.length;
        const paginatedData = reportData.slice((page - 1) * pageSize, page * pageSize);

        // Calculate correct classification counts for all documents (not just filtered ones)
        const classificationCounts = {
            marriage: 0,
            birth: 0,
            death: 0
        };

        // Count unique form types
        const processedFormIds = new Set<string>();

        transformedDocuments.forEach(doc => {
            doc.BaseRegistryForm.forEach(form => {
                if (!processedFormIds.has(form.id)) {
                    processedFormIds.add(form.id);

                    if (form.formType === FormType.MARRIAGE) {
                        classificationCounts.marriage++;
                    } else if (form.formType === FormType.BIRTH) {
                        classificationCounts.birth++;
                    } else if (form.formType === FormType.DEATH) {
                        classificationCounts.death++;
                    }
                }
            });
        });

        // Fetch all available years for the filter dropdown
        const allYearsForms = await prisma.baseRegistryForm.findMany({
            select: { createdAt: true },
        });

        const availableYearsSet = new Set<number>();
        allYearsForms.forEach(form => {
            availableYearsSet.add(new Date(form.createdAt).getFullYear());
        });

        const availableYears = Array.from(availableYearsSet).sort((a, b) => a - b);

        const response: ApiResponse = {
            data: paginatedData,
            meta: {
                totalGroups,
                page,
                pageSize,
                classification: classificationCounts,
                availableYears,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in document report API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}