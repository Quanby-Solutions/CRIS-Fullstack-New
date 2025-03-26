// In a file like 'marriage-certificate-actions.ts'
'use server';

import { prisma } from '@/lib/prisma';
import { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { revalidatePath } from 'next/cache';

export async function updateMarriageCertificateForm(
    baseFormId: string,  // Renamed to reflect it's the baseFormId
    data: MarriageCertificateFormValues
) {
    try {
        console.log('Looking for marriage certificate with baseFormId:', baseFormId);

        // Find the marriage certificate using baseFormId
        const marriageCert = await prisma.marriageCertificateForm.findFirst({
            where: { baseFormId },
            select: { id: true, baseFormId: true }
        });

        console.log('Existing form query result:', marriageCert);

        if (!marriageCert) {
            console.log('Marriage certificate not found for ID:', baseFormId);

            // Let's try to find if there are any marriage certificates at all
            const allForms = await prisma.marriageCertificateForm.findMany({
                take: 1,
                select: { id: true }
            });

            console.log('Sample marriage certificate ID in database:', allForms);

            return { error: 'Marriage certificate not found. ID format might be incorrect.' };
        }


        // Update the base form using the baseFormId from the marriage certificate
        const updatedBaseForm = await prisma.baseRegistryForm.update({
            where: { id: baseFormId || '' },
            data: {
                registryNumber: data.registryNumber,
                province: data.province,
                cityMunicipality: data.cityMunicipality,
                pageNumber: data.pagination?.pageNumber,
                bookNumber: data.pagination?.bookNumber,
                remarks: data.remarks,
                // preparedByName: data.preparedBy?.nameInPrint,
                // preparedByPosition: data.preparedBy?.titleOrPosition,
                // preparedByDate: data.preparedBy?.date,
                receivedBy: data.receivedBy?.nameInPrint,
                receivedByPosition: data.receivedBy?.titleOrPosition,
                receivedByDate: data.receivedBy?.date,
                updatedAt: new Date(),
            }
        });

        // Then update the marriage certificate form
        const updatedMarriageForm = await prisma.marriageCertificateForm.update({
            where: { id: marriageCert.id },  // Use the marriage cert ID
            select: { baseFormId: true },
            data: {
                // Map all your marriage form fields here from data
                husbandFirstName: data.husbandName?.first,
                husbandMiddleName: data.husbandName?.middle,
                husbandLastName: data.husbandName?.last,
                husbandDateOfBirth: data.husbandBirth,
                husbandAge: data.husbandAge,
                husbandPlaceOfBirth: data.husbandPlaceOfBirth,
                husbandSex: data.husbandSex,
                husbandCitizenship: data.husbandCitizenship,
                husbandResidence: data.husbandResidence,
                husbandReligion: data.husbandReligion,
                husbandCivilStatus: data.husbandCivilStatus,
                husbandFatherName: data.husbandParents?.fatherName,
                husbandFatherCitizenship: data.husbandParents?.fatherCitizenship,
                husbandMotherMaidenName: data.husbandParents?.motherName,
                husbandMotherCitizenship: data.husbandParents?.motherCitizenship,
                husbandConsentPerson: data.husbandConsentPerson,

                wifeFirstName: data.wifeName?.first,
                wifeMiddleName: data.wifeName?.middle,
                wifeLastName: data.wifeName?.last,
                wifeDateOfBirth: data.wifeBirth,
                wifeAge: data.wifeAge,
                wifePlaceOfBirth: data.wifePlaceOfBirth,
                wifeSex: data.wifeSex,
                wifeCitizenship: data.wifeCitizenship,
                wifeResidence: data.wifeResidence,
                wifeReligion: data.wifeReligion,
                wifeCivilStatus: data.wifeCivilStatus,
                wifeFatherName: data.wifeParents?.fatherName,
                wifeFatherCitizenship: data.wifeParents?.fatherCitizenship,
                wifeMotherMaidenName: data.wifeParents?.motherName,
                wifeMotherCitizenship: data.wifeParents?.motherCitizenship,
                wifeConsentPerson: data.wifeConsentPerson,

                placeOfMarriage: data.placeOfMarriage,
                dateOfMarriage: data.dateOfMarriage,
                timeOfMarriage: data.timeOfMarriage,
                contractDay: data.contractDay,

                marriageSettlement: data.marriageSettlement,
                husbandContractParty: data.husbandContractParty,
                wifeContractParty: data.wifeContractParty,
                marriageLicenseDetails: data.marriageLicenseDetails,
                marriageArticle: data.marriageArticle,

                solemnizingOfficer: data.solemnizingOfficer,

                // Handle witnesses (this will depend on your DB schema)
                witnesses: [
                    ...(data.husbandWitnesses?.map(w => ({ name: w.name || '' })) || []),
                    ...(data.wifeWitnesses?.map(w => ({ name: w.name || '' })) || [])
                ],

                registeredByOffice: data.registeredByOffice,

                affidavitOfSolemnizingOfficer: data.affidavitOfSolemnizingOfficer,

                affidavitOfdelayedRegistration: data.affidavitForDelayed?.delayedRegistration === 'Yes'
                    ? data.affidavitForDelayed
                    : { delayedRegistration: 'No' },
            }
        });

        console.log('Successfully updated marriage certificate');
        revalidatePath('/civil-registry');

        return {
            data: {
                id: marriageCert.id,
                baseFormId: baseFormId,
                bookNumber: updatedBaseForm.bookNumber,
                pageNumber: updatedBaseForm.pageNumber
            }
        };

    } catch (error) {
        console.error('Error updating marriage certificate form:', error);
        return { error: (error as any).message || 'Failed to update marriage certificate' };
    }
}