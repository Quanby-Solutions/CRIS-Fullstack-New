// src/app/actions/certificate-actions/birth-certificate-actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import { revalidatePath } from 'next/cache';
import { FormType, Prisma } from '@prisma/client';

export async function submitBirthCertificateForm(
  formData: BirthCertificateFormValues
) {
  try {
    if (!formData) {
      throw new Error('No form data provided');
    }

    // Destructure formData with safe nested defaults for dates
    const {
      registryNumber = '',
      province = '',
      cityMunicipality = '',
      pagination: { pageNumber = '', bookNumber = '' } = {},
      preparedBy: {
        nameInPrint: preparedByName = '',
        titleOrPosition: preparedByTitle = '',
        date: preparedByDate = new Date(),
      } = {},
      receivedBy: {
        nameInPrint: receivedByName = '',
        titleOrPosition: receivedByTitle = '',
        date: receivedByDate = new Date(),
      } = {},
      registeredByOffice: {
        nameInPrint: registeredByName = '',
        titleOrPosition: registeredByTitle = '',
        date: registeredByDate = new Date(),
      } = {},
      remarks = '',
      isDelayedRegistration = false,
      hasAffidavitOfPaternity = false,
    } = formData;

    // JSON helpers
    const toJsonDate = (d: Date) => d.toISOString();
    const asJson = (obj: unknown) => obj as Prisma.JsonObject;

    return await prisma.$transaction(
      async (tx) => {
        // Lookup optional users by name
        const [receivedUser, registeredUser] = await Promise.all([
          tx.user.findFirst({ where: { name: receivedByName } }),
          tx.user.findFirst({ where: { name: registeredByName } }),
        ]);
        const receivedById = receivedUser?.id ?? null;
        const registeredById = registeredUser?.id ?? null;

        // Create the base registry form
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '102',
            formType: FormType.BIRTH,
            registryNumber,
            province,
            cityMunicipality,
            pageNumber,
            bookNumber,
            dateOfRegistration: new Date(),
            isLateRegistered: isDelayedRegistration,
            // We leave verifiedBy* as null for now
            preparedById: null,
            verifiedById: null,
            preparedByName,
            verifiedByName: null,
            receivedById,
            receivedBy: receivedByName,
            receivedByPosition: receivedByTitle,
            receivedByDate,
            registeredById,
            registeredBy: registeredByName,
            registeredByPosition: registeredByTitle,
            registeredByDate,
            remarks,
          },
        });

        // Create the birth certificate details
        await tx.birthCertificateForm.create({
          data: {
            baseFormId: baseForm.id,

            childName: asJson({
              first: formData.childInfo?.firstName ?? '',
              middle: formData.childInfo?.middleName ?? '',
              last: formData.childInfo?.lastName ?? '',
            }),
            sex: formData.childInfo?.sex!,
            dateOfBirth: formData.childInfo?.dateOfBirth ?? new Date(),
            placeOfBirth: asJson(formData.childInfo?.placeOfBirth ?? {}),
            typeOfBirth: formData.childInfo?.typeOfBirth ?? '',
            multipleBirthOrder: formData.childInfo?.multipleBirthOrder ?? '',
            birthOrder: formData.childInfo?.birthOrder ?? '',
            weightAtBirth: formData.childInfo?.weightAtBirth ?? '0',
            motherMaidenName: asJson({
              first: formData.motherInfo?.firstName ?? '',
              middle: formData.motherInfo?.middleName ?? '',
              last: formData.motherInfo?.lastName ?? '',
            }),
            motherCitizenship: formData.motherInfo?.citizenship ?? '',
            motherReligion: formData.motherInfo?.religion ?? '',
            motherOccupation: formData.motherInfo?.occupation ?? '',
            motherAge:
              parseInt(formData.motherInfo?.age ?? '0', 10) || 0,
            motherResidence: asJson(formData.motherInfo?.residence ?? {}),
            totalChildrenBornAlive:
              parseInt(formData.motherInfo?.totalChildrenBornAlive ?? '0', 10) ||
              0,
            childrenStillLiving:
              parseInt(formData.motherInfo?.childrenStillLiving ?? '0', 10) ||
              0,
            childrenNowDead:
              parseInt(formData.motherInfo?.childrenNowDead ?? '0', 10) ||
              0,

            fatherName:
              formData.fatherInfo?.firstName && formData.fatherInfo?.lastName
                ? asJson({
                  first: formData.fatherInfo.firstName,
                  middle: formData.fatherInfo.middleName ?? '',
                  last: formData.fatherInfo.lastName,
                })
                : Prisma.JsonNull,
            fatherCitizenship: formData.fatherInfo?.citizenship ?? '',
            fatherReligion: formData.fatherInfo?.religion ?? '',
            fatherOccupation: formData.fatherInfo?.occupation ?? '',
            fatherAge:
              parseInt(formData.fatherInfo?.age ?? '0', 10) || 0,
            fatherResidence:
              formData.fatherInfo?.residence
                ? asJson(formData.fatherInfo.residence)
                : Prisma.JsonNull,

            parentMarriage:
              formData.parentMarriage?.date
                ? {
                  date: formData.parentMarriage.date,
                  place: formData.parentMarriage.place ?? {},
                } as Prisma.JsonObject
                : Prisma.JsonNull,

            attendant: formData.attendant
              ? asJson({
                type: formData.attendant.type ?? '',
                certification: {
                  ...formData.attendant.certification,
                  // time is now just a string (or undefined)
                  time: formData.attendant.certification?.time ?? undefined,
                  // dates still get serialized
                  date: formData.attendant.certification?.date
                },
              })
              : Prisma.JsonNull,

            informant: formData.informant
              ? asJson({
                ...formData.informant,
                date: formData.informant.date
                  ? toJsonDate(formData.informant.date)
                  : undefined,
              })
              : Prisma.JsonNull,

            preparer: asJson({
              nameInPrint: preparedByName,
              titleOrPosition: preparedByTitle,
              date: toJsonDate(preparedByDate),
            }),

            hasAffidavitOfPaternity,
            affidavitOfPaternityDetails:
              hasAffidavitOfPaternity && formData.affidavitOfPaternityDetails
                ? asJson(formData.affidavitOfPaternityDetails)
                : Prisma.JsonNull,

            isDelayedRegistration,
            affidavitOfDelayedRegistration:
              isDelayedRegistration &&
                formData.affidavitOfDelayedRegistration
                ? asJson(formData.affidavitOfDelayedRegistration)
                : Prisma.JsonNull,
            reasonForDelay:
              isDelayedRegistration &&
                formData.affidavitOfDelayedRegistration?.reasonForDelay
                ? formData.affidavitOfDelayedRegistration.reasonForDelay
                : '',
          },
        });

        revalidatePath('/civil-registry');

        return {
          success: true,
          message: 'Birth certificate submitted successfully',
          data: { baseFormId: baseForm.id, bookNumber, pageNumber },
        };
      },
      { maxWait: 10000, timeout: 30000 }
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
