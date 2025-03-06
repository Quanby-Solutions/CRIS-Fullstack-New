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

        // Update each user's eSignature individually.
        // await tx.user.update({
        //   where: { id: preparedByUser.id },
        //   data: {
        //     eSignature:
        //       formData.preparedBy.signature instanceof File
        //         ? await fileToBase64(formData.preparedBy.signature)
        //         : formData.preparedBy.signature,
        //   },
        // });
        // await tx.user.update({
        //   where: { id: receivedByUser.id },
        //   data: {
        //     eSignature:
        //       formData.receivedBy.signature instanceof File
        //         ? await fileToBase64(formData.receivedBy.signature)
        //         : formData.receivedBy.signature,
        //   },
        // });
        // await tx.user.update({
        //   where: { id: registeredByUser.id },
        //   data: {
        //     eSignature:
        //       formData.registeredByOffice.signature instanceof File
        //         ? await fileToBase64(formData.registeredByOffice.signature)
        //         : formData.registeredByOffice.signature,
        //   },
        // });

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
            timeOfDeath: dateToJSON(formData.timeOfDeath!), // Non-null assertion.
            dateOfBirth: formData.dateOfBirth!, // Non-null assertion.
            ageAtDeath: formData.ageAtDeath as Prisma.JsonObject,
            placeOfDeath: {
              province: formData.placeOfDeath.province,
              cityMunicipality: formData.placeOfDeath.cityMunicipality,
              houseNo: formData.placeOfDeath.houseNo,
              st: formData.placeOfDeath.st,
              barangay: formData.placeOfDeath.barangay,
              hospitalInstitution: formData.placeOfDeath.hospitalInstitution,
            },
            civilStatus: formData.civilStatus!,
            religion: formData.religion || '',
            citizenship: formData.citizenship,
            residence: {
              province: formData.residence.province,
              cityMunicipality: formData.residence.cityMunicipality,
              houseNo: formData.residence.houseNo,
              st: formData.residence.st,
              barangay: formData.residence.barangay,
              country: formData.residence.country
            },
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
                      time: dateToJSON(formData.medicalCertificate.attendant.certification.time!),
                      date: dateToJSON(formData.medicalCertificate.attendant.certification.date!),
                      name: formData.medicalCertificate.attendant.certification.name!,
                      title: formData.medicalCertificate.attendant.certification.title!,
                      address: {
                        province: formData.medicalCertificate.attendant.certification.address.province,
                        cityMunicipality: formData.medicalCertificate.attendant.certification.address.cityMunicipality,
                        houseNo: formData.medicalCertificate.attendant.certification.address.houseNo,
                        st: formData.medicalCertificate.attendant.certification.address.st,
                        barangay: formData.medicalCertificate.attendant.certification.address.barangay,
                        country: formData.medicalCertificate.attendant.certification.address.country
                      },
                    }
                    : null,
                }
                : null,
              autopsy: formData.medicalCertificate.autopsy,
            } as Prisma.JsonObject,

            //Causes of Death (specific section).
            causesOfDeath19a: formData.causesOfDeath19a as Prisma.JsonObject,

            // Causes of Death (specific section).
            causesOfDeath19b: formData.causesOfDeath19b as Prisma.JsonObject,

            // Certification of Death.
            certificationOfDeath: {
              hasAttended: formData.certificationOfDeath.hasAttended,
              // signature:
              //   formData.certificationOfDeath.signature instanceof File
              //     ? await fileToBase64(formData.certificationOfDeath.signature)
              //     : formData.certificationOfDeath.signature,
              nameInPrint: formData.certificationOfDeath.nameInPrint,
              titleOfPosition: formData.certificationOfDeath.titleOfPosition,
              address: {
                province: formData.certificationOfDeath.address.province,
                cityMunicipality: formData.certificationOfDeath.address.cityMunicipality,
                houseNo: formData.certificationOfDeath.address.houseNo,
                st: formData.certificationOfDeath.address.st,
                barangay: formData.certificationOfDeath.address.barangay,
                country: formData.certificationOfDeath.address.country
              },
              date: dateToJSON(formData.certificationOfDeath.date!),
              // healthOfficerSignature:
              //   formData.certificationOfDeath.healthOfficerSignature instanceof
              //   File
              //     ? await fileToBase64(
              //         formData.certificationOfDeath.healthOfficerSignature
              //       )
              //     : formData.certificationOfDeath.healthOfficerSignature,
              healthOfficerNameInPrint:
                formData.certificationOfDeath.healthOfficerNameInPrint,
            } as Prisma.JsonObject,

            // Review Information.
            reviewedBy: dateToJSON(formData.reviewedBy.date!),


            // Optional Certificates.
            postmortemCertificate: formData.postmortemCertificate
              ? ({
                ...formData.postmortemCertificate,
                // signature:
                //   formData.postmortemCertificate.signature instanceof File
                //     ? await fileToBase64(
                //         formData.postmortemCertificate.signature
                //       )
                //     : formData.postmortemCertificate.signature,
                date: dateToJSON(formData.postmortemCertificate.date!),
              } as Prisma.JsonObject)
              : Prisma.JsonNull,

            embalmerCertification: {
              nameInPrint: formData.embalmerCertification?.nameInPrint,
              nameOfDeceased: formData.embalmerCertification?.nameOfDeceased,
              licenseNo: formData.embalmerCertification?.licenseNo,
              issuedOn: dateToJSON(formData.embalmerCertification?.issuedOn!),
              issuedAt: formData.embalmerCertification?.issuedAt,
              expiryDate: dateToJSON(formData.embalmerCertification?.expiryDate!),
              address: formData.embalmerCertification?.address,
              titleDesignation: formData.embalmerCertification?.titleDesignation,
            } as Prisma.JsonObject,

            delayedRegistration: formData.delayedRegistration?.isDelayed
              ? ({
                isDelayed: formData.delayedRegistration.isDelayed,
                affiant: {
                  name: formData.delayedRegistration?.affiant?.name,
                  civilStatus: formData.delayedRegistration?.affiant?.civilStatus,
                  residenceAddress: formData.delayedRegistration?.affiant?.residenceAddress,
                  age: formData.delayedRegistration?.affiant?.age,
                } as Prisma.JsonObject,
                deceased: {
                  name: formData.delayedRegistration?.deceased?.name,
                  dateOfDeath: dateToJSON(formData.delayedRegistration?.deceased?.dateOfDeath!),
                  placeOfDeath: formData.delayedRegistration?.deceased?.placeOfDeath,
                  burialInfo: {
                    date: dateToJSON(formData.delayedRegistration?.deceased?.burialInfo?.date!),
                    place: formData.delayedRegistration?.deceased?.burialInfo?.place,
                    method: formData.delayedRegistration?.deceased?.burialInfo?.method
                  }
                } as Prisma.JsonObject,
                attendance: {
                  wasAttended: formData.delayedRegistration?.attendance?.wasAttended,
                  attendedBy: formData.delayedRegistration?.attendance?.attendedBy,
                },
                causeOfDeath: formData.delayedRegistration?.causeOfDeath,
                reasonForDelay: formData.delayedRegistration?.reasonForDelay,
                affidavitDate: dateToJSON(formData.delayedRegistration?.affidavitDate!),
                affidavitDatePlace: formData.delayedRegistration?.affidavitDatePlace,
                adminOfficer: formData.delayedRegistration?.adminOfficer,
                ctcInfo: {
                  number: formData.delayedRegistration?.ctcInfo?.number,
                  issuedOn: dateToJSON(formData.delayedRegistration?.ctcInfo?.issuedOn!),
                  issuedAt: formData.delayedRegistration?.ctcInfo?.issuedAt
                } as Prisma.JsonObject

              } as Prisma.JsonObject)
              : {},


            // Disposal Information.
            corpseDisposal: formData.corpseDisposal,
            burialPermit: {
              number: formData.burialPermit.number,
              dateIssued: dateToJSON(formData.burialPermit.dateIssued!),
            } as Prisma.JsonObject,

            transferPermit: formData.transferPermit
              ? ({
                number: formData.transferPermit.number,
                dateIssued: dateToJSON(formData.transferPermit.dateIssued!),
              } as Prisma.JsonObject)
              : Prisma.JsonNull,

            cemeteryOrCrematory: {
              name: formData.cemeteryOrCrematory.name,
              address: formData.cemeteryOrCrematory.address,
            } as Prisma.JsonObject,

            // Informant Information.
            informant: {
              // signature:
              //   formData.informant.signature instanceof File
              //     ? await fileToBase64(formData.informant.signature)
              //     : formData.informant.signature,
              nameInPrint: formData.informant.nameInPrint,
              relationshipToDeceased: formData.informant.relationshipToDeceased,
              address: {
                province: formData.informant.address.province,
                cityMunicipality: formData.informant.address.cityMunicipality,
                houseNo: formData.informant.address.houseNo,
                st: formData.informant.address.st,
                barangay: formData.informant.address.barangay,
                country: formData.informant.address.country
              },
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
