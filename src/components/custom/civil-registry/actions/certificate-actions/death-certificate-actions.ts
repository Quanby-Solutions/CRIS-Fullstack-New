'use server';
import { prisma } from '@/lib/prisma';
import {
  deathCertificateFormSchema,
  DeathCertificateFormValues,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { DocumentStatus, FormType, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitDeathCertificateForm(
  formData: DeathCertificateFormValues
) {
  try {
    if (!formData) {
      throw new Error('No form data provided');
    }

    // Validate the form data using Zod.
    // If it passes, we assume that all required fields are defined.
    try {
      deathCertificateFormSchema.parse(formData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${validationError.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ')}`,
        };
      }
      throw validationError;
    }

    return await prisma.$transaction(
      async (tx) => {
        // Find users by name.
        const preparedByUser = await tx.user.findFirst({
          where: { name: formData.preparedBy.nameInPrint },
        });
        if (!preparedByUser) {
          throw new Error(
            `No user found with name: ${formData.preparedBy.nameInPrint}`
          );
        }
        const receivedByUser = await tx.user.findFirst({
          where: { name: formData.receivedBy.nameInPrint },
        });
        const registeredByUser = await tx.user.findFirst({
          where: { name: formData.registeredByOffice.nameInPrint },
        });
        if (!receivedByUser || !registeredByUser) {
          throw new Error('ReceivedBy or RegisteredBy user not found');
        }

        // Use pagination details from the form data.
        const pageNumber = formData.pagination?.pageNumber || '';
        const bookNumber = formData.pagination?.bookNumber || '';

        // Determine if the registration is late.
        const isLateRegistered = Boolean(formData.delayedRegistration);

        // Create the base registry form record.
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '103', // Death certificate form number.
            formType: FormType.DEATH,
            registryNumber: formData.registryNumber,
            province: formData.province,
            cityMunicipality: formData.cityMunicipality,
            pageNumber,
            bookNumber,
            dateOfRegistration: new Date(),
            isLateRegistered,
            status: DocumentStatus.PENDING,
            preparedById: preparedByUser.id,
            verifiedById: null,
            preparedByName: formData.preparedBy.nameInPrint,
            preparedByPosition: formData.preparedBy.titleOrPosition,
            preparedByDate: formData.preparedBy.date!,
            verifiedByName: null,
            receivedById: receivedByUser.id,
            receivedBy: formData.receivedBy.nameInPrint,
            receivedByPosition: formData.receivedBy.titleOrPosition,
            receivedByDate: formData.receivedBy.date!,
            registeredById: registeredByUser.id,
            registeredBy: formData.registeredByOffice.nameInPrint,
            registeredByPosition: formData.registeredByOffice.titleOrPosition,
            registeredByDate: formData.registeredByOffice.date!,
            remarks: formData.remarks,
          },
        });

        // Helper function to convert Date to ISO string.
        const dateToJSON = (date: Date) => date.toISOString();

        // Create the death certificate form record.
        await tx.deathCertificateForm.create({
          data: {
            baseFormId: baseForm.id,

            // Deceased Information.
            deceasedName: formData.name,
            sex: formData.sex!,
            dateOfDeath: formData.dateOfDeath!,
            timeOfDeath: formData.timeOfDeath!, // Non-null assertion.
            dateOfBirth: formData.dateOfBirth!, // Non-null assertion.
            ageAtDeath: formData.ageAtDeath as Prisma.JsonObject,
            placeOfDeath: formData.placeOfDeath as Prisma.JsonObject,
            civilStatus: formData.civilStatus!,
            religion: formData.religion || '',
            citizenship: formData.citizenship,
            residence: formData.residence as Prisma.JsonObject,
            occupation: formData.occupation,

            // Parent Information.
            parentInfo: formData.parents as Prisma.JsonObject,

            // Birth Information (if applicable).
            birthInformation: formData.birthInformation
              ? (formData.birthInformation as Prisma.JsonObject)
              : Prisma.JsonNull,

            // Medical Certificate.
            medicalCertificate: {
              causesOfDeath: formData.medicalCertificate.causesOfDeath,
              maternalCondition:
                formData.medicalCertificate.maternalCondition || null,
              externalCauses: formData.medicalCertificate.externalCauses,
              attendant: formData.medicalCertificate.attendant
                ? {
                    ...formData.medicalCertificate.attendant,
                    duration: formData.medicalCertificate.attendant.duration
                      ? {
                          from: dateToJSON(
                            formData.medicalCertificate.attendant.duration.from!
                          ),
                          to: dateToJSON(
                            formData.medicalCertificate.attendant.duration.to!
                          ),
                        }
                      : null,
                    certification: formData.medicalCertificate.attendant
                      .certification
                      ? {
                          ...formData.medicalCertificate.attendant
                            .certification,
                          time: dateToJSON(
                            formData.medicalCertificate.attendant.certification
                              .time!
                          ),
                          date: dateToJSON(
                            formData.medicalCertificate.attendant.certification
                              .date!
                          ),
                        }
                      : null,
                  }
                : null,
              autopsy: formData.medicalCertificate.autopsy,
            } as Prisma.JsonObject,

            // Causes of Death (specific section).
            causesOfDeath19b: formData.causesOfDeath19b as Prisma.JsonObject,

            // Certification of Death.
            certificationOfDeath: {
              hasAttended: formData.certificationOfDeath.hasAttended,
              nameInPrint: formData.certificationOfDeath.nameInPrint,
              titleOfPosition: formData.certificationOfDeath.titleOfPosition,
              address: formData.certificationOfDeath
                .address as Prisma.JsonObject,
              date: dateToJSON(formData.certificationOfDeath.date!),
              healthOfficerNameInPrint:
                formData.certificationOfDeath.healthOfficerNameInPrint,
            } as Prisma.JsonObject,

            // Review Information.
            reviewedBy: {
              date: dateToJSON(formData.reviewedBy.date!),
            } as Prisma.JsonObject,

            // Optional Certificates.
            postmortemCertificate: formData.postmortemCertificate
              ? ({
                  ...formData.postmortemCertificate,
                  date: dateToJSON(formData.postmortemCertificate.date!),
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

            embalmerCertification: formData.embalmerCertification
              ? ({
                  ...formData.embalmerCertification,
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

              delayedRegistration:
              formData.delayedRegistration && formData.delayedRegistration.isDelayed
                ? ({
                    ...formData.delayedRegistration,
                    affiant: {
                      ...formData.delayedRegistration.affiant,
                    },
                    adminOfficer: {
                      ...formData.delayedRegistration.adminOfficer,
                    },
                    affidavitDate: formData.delayedRegistration.affidavitDate
                      ? dateToJSON(formData.delayedRegistration.affidavitDate)
                      : null,
                  } as Prisma.JsonObject)
                : Prisma.JsonNull,

            // Disposal Information.
            corpseDisposal: formData.corpseDisposal,
            burialPermit: {
              number: formData.burialPermit.number,
              dateIssued: dateToJSON(formData.burialPermit.dateIssued!),
            } as Prisma.JsonObject,

            transferPermit: formData.transferPermit
            ? ({
                number: formData.transferPermit.number,
                dateIssued: dateToJSON(formData.transferPermit.dateIssued!)
              } as Prisma.JsonObject)
            : Prisma.JsonNull,

            cemeteryOrCrematory: {
              name: formData.cemeteryOrCrematory.name,
              address: formData.cemeteryOrCrematory.address,
            } as Prisma.JsonObject,

            // Informant Information.
            informant: {
              nameInPrint: formData.informant.nameInPrint,
              relationshipToDeceased: formData.informant.relationshipToDeceased,
              address: formData.informant.address as Prisma.JsonObject,
              date: dateToJSON(formData.informant.date!),
            } as Prisma.JsonObject,

            remarks: formData.remarks,
          },
        });

        revalidatePath('/civil-registry');

        return {
          success: true,
          message: 'Death certificate submitted successfully',
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
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to submit death certificate form',
    };
  }
}
