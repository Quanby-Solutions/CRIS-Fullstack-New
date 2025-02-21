// src\app\actions\certificate-actions\birth-certificate-actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { DocumentStatus, FormType, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function submitBirthCertificateForm(
  formData: BirthCertificateFormValues
) {
  try {
    if (!formData) {
      throw new Error('No form data provided');
    }

    return await prisma.$transaction(
      async (tx) => {
        // Find the user by name
        const preparedByUser = await tx.user.findFirst({
          where: {
            name: formData.preparedBy.nameInPrint,
          },
        });

        if (!preparedByUser) {
          throw new Error(
            `No user found with name: ${formData.preparedBy.nameInPrint}`
          );
        }

        // Find the user for receivedBy and registeredBy
        const receivedByUser = await tx.user.findFirst({
          where: {
            name: formData.receivedBy.nameInPrint,
          },
        });

        const registeredByUser = await tx.user.findFirst({
          where: {
            name: formData.registeredByOffice.nameInPrint,
          },
        });

        if (!receivedByUser || !registeredByUser) {
          throw new Error('ReceivedBy or RegisteredBy user not found');
        }

        // Use pagination details directly from the form data.
        const pageNumber = formData.pagination?.pageNumber || '';
        const bookNumber = formData.pagination?.bookNumber || '';

        // Create the BaseRegistryForm record
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '102',
            formType: FormType.BIRTH,
            registryNumber: formData.registryNumber,
            province: formData.province,
            cityMunicipality: formData.cityMunicipality,
            pageNumber,
            bookNumber,
            dateOfRegistration: new Date(),
            isLateRegistered: formData.isDelayedRegistration,
            status: DocumentStatus.PENDING,
            preparedById: preparedByUser.id,
            verifiedById: null,
            preparedByName: formData.preparedBy.nameInPrint,
            verifiedByName: null,
            receivedById: receivedByUser.id,
            receivedBy: formData.receivedBy.nameInPrint,
            receivedByPosition: formData.receivedBy.titleOrPosition,
            receivedByDate: formData.receivedBy.date, // Correct field name used here
            registeredById: registeredByUser.id,
            registeredBy: formData.registeredByOffice.nameInPrint,
            registeredByPosition: formData.registeredByOffice.titleOrPosition,
            registeredByDate: formData.registeredByOffice.date,
            remarks: formData.remarks,
          },
        });

        await tx.user.updateMany({
          where: {
            id: {
              in: [preparedByUser.id, receivedByUser.id, registeredByUser.id],
            },
          },
          data: {
            eSignature:
              formData.preparedBy.signature instanceof File
                ? await fileToBase64(formData.preparedBy.signature)
                : formData.preparedBy.signature, // If it's already base64, leave it unchanged
          },
        });

        await tx.user.update({
          where: { id: receivedByUser.id },
          data: {
            eSignature:
              formData.receivedBy.signature instanceof File
                ? await fileToBase64(formData.receivedBy.signature)
                : formData.receivedBy.signature,
          },
        });

        await tx.user.update({
          where: { id: registeredByUser.id },
          data: {
            eSignature:
              formData.registeredByOffice.signature instanceof File
                ? await fileToBase64(formData.registeredByOffice.signature)
                : formData.registeredByOffice.signature,
          },
        });

        // Helper function to convert Date to ISO string for JSON
        const dateToJSON = (date: Date) => date.toISOString();

        // Create the BirthCertificateForm record
        await tx.birthCertificateForm.create({
          data: {
            baseFormId: baseForm.id,
            childName: {
              first: formData.childInfo.firstName,
              middle: formData.childInfo.middleName || '',
              last: formData.childInfo.lastName,
            } as Prisma.JsonObject,
            sex: formData.childInfo.sex,
            dateOfBirth: formData.childInfo.dateOfBirth,
            placeOfBirth: formData.childInfo.placeOfBirth as Prisma.JsonObject,
            typeOfBirth: formData.childInfo.typeOfBirth,
            multipleBirthOrder: formData.childInfo.multipleBirthOrder || '',
            birthOrder: formData.childInfo.birthOrder,
            weightAtBirth: parseFloat(formData.childInfo.weightAtBirth),
            motherMaidenName: {
              first: formData.motherInfo.firstName,
              middle: formData.motherInfo.middleName || '',
              last: formData.motherInfo.lastName,
            } as Prisma.JsonObject,
            motherCitizenship: formData.motherInfo.citizenship,
            motherReligion: formData.motherInfo.religion || '',
            motherOccupation: formData.motherInfo.occupation,
            motherAge: parseInt(formData.motherInfo.age, 10),
            motherResidence: formData.motherInfo.residence as Prisma.JsonObject,
            totalChildrenBornAlive: parseInt(
              formData.motherInfo.totalChildrenBornAlive,
              10
            ),
            childrenStillLiving: parseInt(
              formData.motherInfo.childrenStillLiving,
              10
            ),
            childrenNowDead: parseInt(formData.motherInfo.childrenNowDead, 10),
            fatherName:
              !formData.fatherInfo ||
              !formData.fatherInfo.firstName ||
              !formData.fatherInfo.lastName
                ? Prisma.JsonNull
                : ({
                    first: formData.fatherInfo.firstName,
                    middle: formData.fatherInfo.middleName || '',
                    last: formData.fatherInfo.lastName,
                  } as Prisma.JsonObject),

            fatherCitizenship: formData.fatherInfo?.citizenship || '',
            fatherReligion: formData.fatherInfo?.religion || '',
            fatherOccupation: formData.fatherInfo?.occupation || '',
            fatherAge: formData.fatherInfo
              ? parseInt(formData.fatherInfo.age, 10)
              : 0,
            fatherResidence: !formData.fatherInfo
              ? Prisma.JsonNull
              : (formData.fatherInfo.residence as Prisma.JsonObject),
            parentMarriage: !formData.parentMarriage
              ? Prisma.JsonNull
              : formData.parentMarriage.date
              ? {
                  date: dateToJSON(formData.parentMarriage.date),
                  place: formData.parentMarriage.place,
                }
              : Prisma.JsonNull,
            attendant: {
              type: formData.attendant.type,
              certification: {
                ...formData.attendant.certification,
                time: dateToJSON(formData.attendant.certification.time),
                date: dateToJSON(formData.attendant.certification.date),
              },
            } as unknown as Prisma.JsonObject,
            informant: {
              ...formData.informant,
              date: dateToJSON(formData.informant.date),
            } as unknown as Prisma.JsonObject,
            preparer: {
              ...formData.preparedBy,
              date: dateToJSON(formData.preparedBy.date),
            } as unknown as Prisma.JsonObject,
            hasAffidavitOfPaternity: formData.hasAffidavitOfPaternity,
            affidavitOfPaternityDetails:
              !formData.hasAffidavitOfPaternity ||
              !formData.affidavitOfPaternityDetails
                ? Prisma.JsonNull
                : (formData.affidavitOfPaternityDetails as unknown as Prisma.JsonObject),
            isDelayedRegistration: formData.isDelayedRegistration,
            affidavitOfDelayedRegistration:
              !formData.isDelayedRegistration ||
              !formData.affidavitOfDelayedRegistration
                ? Prisma.JsonNull
                : (formData.affidavitOfDelayedRegistration as unknown as Prisma.JsonObject),
            reasonForDelay:
              (formData.isDelayedRegistration &&
                formData.affidavitOfDelayedRegistration?.reasonForDelay) ||
              '',
          },
        });

        // Revalidate the path
        revalidatePath('/civil-registry');

        return {
          success: true,
          message: 'Birth certificate submitted successfully',
          data: {
            baseFormId: baseForm.id,
            bookNumber,
            pageNumber,
          },
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to submit birth certificate form',
    };
  }
}
