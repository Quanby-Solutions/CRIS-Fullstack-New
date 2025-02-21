// src\app\actions\certificate-actions\death-certificate-actions.ts
// src\app\actions\certificate-actions\death-certificate-actions.ts
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

    // Validate the form data against the Zod schema
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

        // Determine if the registration is late
        const isLateRegistered = formData.delayedRegistration ? true : false;

        // Create the BaseRegistryForm record
        const baseForm = await tx.baseRegistryForm.create({
          data: {
            formNumber: '103', // Death certificate form number
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
            preparedByDate: formData.preparedBy.date,
            verifiedByName: null,
            receivedById: receivedByUser.id,
            receivedBy: formData.receivedBy.nameInPrint,
            receivedByPosition: formData.receivedBy.titleOrPosition,
            receivedByDate: formData.receivedBy.date,
            registeredById: registeredByUser.id,
            registeredBy: formData.registeredByOffice.nameInPrint,
            registeredByPosition: formData.registeredByOffice.titleOrPosition,
            registeredByDate: formData.registeredByOffice.date,
            remarks: formData.remarks,
          },
        });

        // Update users' eSignature (convert file to base64 if it's a file)
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

        // Create the DeathCertificateForm record
        await tx.deathCertificateForm.create({
          data: {
            baseFormId: baseForm.id,

            // Deceased Information
            deceasedName: formData.name,
            sex: formData.sex,
            dateOfDeath: formData.dateOfDeath,
            timeOfDeath: formData.timeOfDeath,
            dateOfBirth: formData.dateOfBirth,
            ageAtDeath: formData.ageAtDeath as Prisma.JsonObject,
            placeOfDeath: formData.placeOfDeath as Prisma.JsonObject,
            civilStatus: formData.civilStatus,
            religion: formData.religion || '',
            citizenship: formData.citizenship,
            residence: formData.residence as Prisma.JsonObject,
            occupation: formData.occupation,

            // Parent Information
            parentInfo: formData.parents as Prisma.JsonObject,

            // Birth Information (if applicable)
            birthInformation: formData.birthInformation
              ? (formData.birthInformation as Prisma.JsonObject)
              : Prisma.JsonNull,

            // Medical Certificate
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
                            formData.medicalCertificate.attendant.duration.from
                          ),
                          to: dateToJSON(
                            formData.medicalCertificate.attendant.duration.to
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
                              .time
                          ),
                          date: dateToJSON(
                            formData.medicalCertificate.attendant.certification
                              .date
                          ),
                          signature:
                            formData.medicalCertificate.attendant.certification
                              .signature instanceof File
                              ? await fileToBase64(
                                  formData.medicalCertificate.attendant
                                    .certification.signature
                                )
                              : formData.medicalCertificate.attendant
                                  .certification.signature,
                        }
                      : null,
                  }
                : null,
              autopsy: formData.medicalCertificate.autopsy,
            } as Prisma.JsonObject,

            // Causes of Death (specific section)
            causesOfDeath19b: formData.causesOfDeath19b as Prisma.JsonObject,

            // Certification of Death
            certificationOfDeath: {
              hasAttended: formData.certificationOfDeath.hasAttended,
              signature:
                formData.certificationOfDeath.signature instanceof File
                  ? await fileToBase64(formData.certificationOfDeath.signature)
                  : formData.certificationOfDeath.signature,
              nameInPrint: formData.certificationOfDeath.nameInPrint,
              titleOfPosition: formData.certificationOfDeath.titleOfPosition,
              address: formData.certificationOfDeath
                .address as Prisma.JsonObject,
              date: dateToJSON(formData.certificationOfDeath.date),
              healthOfficerSignature:
                formData.certificationOfDeath.healthOfficerSignature instanceof
                File
                  ? await fileToBase64(
                      formData.certificationOfDeath.healthOfficerSignature
                    )
                  : formData.certificationOfDeath.healthOfficerSignature,
              healthOfficerNameInPrint:
                formData.certificationOfDeath.healthOfficerNameInPrint,
            } as Prisma.JsonObject,

            // Review Information
            reviewedBy: {
              signature:
                formData.reviewedBy.signature instanceof File
                  ? await fileToBase64(formData.reviewedBy.signature)
                  : formData.reviewedBy.signature,
              date: dateToJSON(formData.reviewedBy.date),
            } as Prisma.JsonObject,

            // Optional Certificates
            postmortemCertificate: formData.postmortemCertificate
              ? ({
                  ...formData.postmortemCertificate,
                  signature:
                    formData.postmortemCertificate.signature instanceof File
                      ? await fileToBase64(
                          formData.postmortemCertificate.signature
                        )
                      : formData.postmortemCertificate.signature,
                  date: dateToJSON(formData.postmortemCertificate.date),
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

            embalmerCertification: formData.embalmerCertification
              ? ({
                  ...formData.embalmerCertification,
                  signature:
                    formData.embalmerCertification.signature instanceof File
                      ? await fileToBase64(
                          formData.embalmerCertification.signature
                        )
                      : formData.embalmerCertification.signature,
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

            delayedRegistration: formData.delayedRegistration
              ? ({
                  ...formData.delayedRegistration,
                  affiant: {
                    ...formData.delayedRegistration.affiant,
                    signature:
                      formData.delayedRegistration.affiant.signature instanceof
                      File
                        ? await fileToBase64(
                            formData.delayedRegistration.affiant.signature
                          )
                        : formData.delayedRegistration.affiant.signature,
                  },
                  adminOfficer: {
                    ...formData.delayedRegistration.adminOfficer,
                    signature:
                      formData.delayedRegistration.adminOfficer
                        .signature instanceof File
                        ? await fileToBase64(
                            formData.delayedRegistration.adminOfficer.signature
                          )
                        : formData.delayedRegistration.adminOfficer.signature,
                  },
                  affidavitDate: formData.delayedRegistration.affidavitDate
                    ? dateToJSON(formData.delayedRegistration.affidavitDate)
                    : null,
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

            // Disposal Information
            corpseDisposal: formData.corpseDisposal,
            burialPermit: {
              number: formData.burialPermit.number,
              dateIssued: dateToJSON(formData.burialPermit.dateIssued),
            } as Prisma.JsonObject,

            transferPermit: formData.transferPermit
              ? ({
                  number: formData.transferPermit.number,
                  dateIssued: formData.transferPermit.dateIssued,
                } as Prisma.JsonObject)
              : Prisma.JsonNull,

            cemeteryOrCrematory: {
              name: formData.cemeteryOrCrematory.name,
              address: formData.cemeteryOrCrematory.address,
            } as Prisma.JsonObject,

            // Informant Information
            informant: {
              signature:
                formData.informant.signature instanceof File
                  ? await fileToBase64(formData.informant.signature)
                  : formData.informant.signature,
              nameInPrint: formData.informant.nameInPrint,
              relationshipToDeceased: formData.informant.relationshipToDeceased,
              address: formData.informant.address as Prisma.JsonObject,
              date: dateToJSON(formData.informant.date),
            } as Prisma.JsonObject,

            remarks: formData.remarks,
          },
        });

        // Revalidate the path for updated content
        revalidatePath('/death-certificates');

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
