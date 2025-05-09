'use server';

import { prisma } from '@/lib/prisma';
import { DeathCertificateFormValues, deathCertificateFormSchema } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { DocumentStatus, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function updateDeathCertificateForm(
  baseFormId: string,
  formData: DeathCertificateFormValues,
) {


  try {
    console.log('Looking for marriage certificate with baseFormId:', baseFormId);

    // Find the marriage certificate using baseFormId
    const deathCert = await prisma.deathCertificateForm.findFirst({
      where: { baseFormId },
      select: { id: true, baseFormId: true }
    });


    const registeredByUser = await prisma.user.findFirst({
      where: { name: formData.registeredByOffice?.nameInPrint },
    });

    const registeredById = registeredByUser ? registeredByUser.id : null;

    console.log('Existing form query result:', deathCert);

    if (!deathCert) {
      console.log('Marriage certificate not found for ID:', baseFormId);

      // Let's try to find if there are any marriage certificates at all
      const allForms = await prisma.deathCertificateForm.findMany({
        take: 1,
        select: { id: true }
      });

      console.log('Sample marriage certificate ID in database:', allForms);

      return { error: 'Marriage certificate not found. ID format might be incorrect.' };
    }
    // Helper function to convert date objects to ISO strings
    const dateToJSON = (date: Date | any) => {
      if (!date) return null;
      // Check if date is a Date object
      if (date instanceof Date) {
        return date.toISOString();
      }
      // If it's already a string, return it
      if (typeof date === 'string') {
        return date;
      }
      return null;
    };

    // Update the base form using the baseFormId from the marriage certificate
    const updatedBaseForm = await prisma.baseRegistryForm.update({
      where: { id: baseFormId || '' },
      data: {
        registryNumber: formData.registryNumber,
        province: formData.province,
        cityMunicipality: formData.cityMunicipality,
        pageNumber: formData.pagination?.pageNumber,
        bookNumber: formData.pagination?.bookNumber,
        remarks: formData.remarks,
        preparedByName: formData.preparedBy?.nameInPrint,
        preparedByPosition: formData.preparedBy?.titleOrPosition,
        preparedByDate: formData.preparedBy?.date,
        receivedBy: formData.receivedBy?.nameInPrint,
        receivedByPosition: formData.receivedBy?.titleOrPosition,
        receivedByDate: formData.receivedBy?.date,
        updatedAt: new Date(),
        registeredById: registeredById,
        registeredBy: formData.registeredByOffice?.nameInPrint,
        registeredByPosition: formData.registeredByOffice?.titleOrPosition,
        registeredByDate: formData.registeredByOffice?.date!,
      }
    });

    // Update the death certificate form record
    const updatedDeathForm = await prisma.deathCertificateForm.update({
      where: { id: deathCert.id },  // Use the death cert ID
      select: { baseFormId: true },
      data: {
        // Deceased Information
        deceasedName: formData.name,
        sex: formData.sex!,
        dateOfDeath: {
          dateOfDeath: formData.dateOfDeath,
        } as Prisma.JsonObject,
        dateOfBirth: {
          dateOfBirth: formData.dateOfBirth,
        } as Prisma.JsonObject,
        timeOfDeath: formData.timeOfDeath!, // This is already a string
        ageAtDeath: formData.ageAtDeath as Prisma.JsonObject,
        placeOfDeath: formData.placeOfDeath as Prisma.JsonObject,
        civilStatus: formData.civilStatus!,
        religion: formData.religion || '',
        citizenship: formData.citizenship,
        residence: formData.residence as Prisma.JsonObject,
        occupation: formData.occupation,

        // Parent Information - standardize to use parents field
        parentInfo: formData.parents as Prisma.JsonObject,

        // Birth Information (if applicable)
        birthInformation: formData.birthInformation
          ? (formData.birthInformation as Prisma.JsonObject)
          : Prisma.JsonNull,

        // Medical Certificate - consolidate causes of death here
        medicalCertificate: {
          causesOfDeath: formData?.medicalCertificate?.causesOfDeath,
          maternalCondition:
            formData.medicalCertificate?.maternalCondition || null,
          externalCauses: formData.medicalCertificate?.externalCauses,
          attendant: formData.medicalCertificate?.attendant
            ? {
              ...formData.medicalCertificate.attendant,
              duration: formData.medicalCertificate.attendant.duration
                ? {
                  from:
                    formData.medicalCertificate.attendant.duration.from!
                  ,
                  to:
                    formData.medicalCertificate.attendant.duration.to!
                  ,
                }
                : null,
              certification: formData.medicalCertificate.attendant
                .certification
                ? {
                  ...formData.medicalCertificate.attendant
                    .certification,
                  time: formData.medicalCertificate.attendant.certification.time!,
                  date: formData.medicalCertificate.attendant.certification.date!,
                  name: formData.medicalCertificate.attendant.certification.name!,
                  title: formData.medicalCertificate.attendant.certification.title!,
                  address: formData.medicalCertificate.attendant.certification.address,
                }
                : null,
            }
            : null,
          autopsy: formData.medicalCertificate?.autopsy,
        } as Prisma.JsonObject,

        // Keeping separate causes of death fields for backward compatibility
        // or specific form sections
        causesOfDeath19a: formData.causesOfDeath19a as Prisma.JsonObject,
        causesOfDeath19b: formData.causesOfDeath19b as Prisma.JsonObject,

        // Certification of Death - include reviewedBy data here
        certificationOfDeath: {
          hasAttended: formData.certificationOfDeath?.hasAttended,
          nameInPrint: formData.certificationOfDeath?.nameInPrint,
          titleOfPosition: formData.certificationOfDeath?.titleOfPosition,
          address: formData?.certificationOfDeath?.address,
          reviewedBy: {
            date: formData.certificationOfDeath?.reviewedBy?.date!,
            healthOfficerNameInPrint:
              formData.certificationOfDeath?.reviewedBy?.healthOfficerNameInPrint,
          }
        } as Prisma.JsonObject,

        // Remove separate reviewedBy field to avoid duplication
        // reviewedBy: dateToJSON(formData.reviewedBy?.date!),

        // Optional Certificates
        postmortemCertificate: formData.postmortemCertificate
          ? ({
            ...formData.postmortemCertificate,
            date: formData.postmortemCertificate.date!,
          } as Prisma.JsonObject)
          : Prisma.JsonNull,

        embalmerCertification: {
          nameInPrint: formData.embalmerCertification?.nameInPrint,
          nameOfDeceased: formData.embalmerCertification?.nameOfDeceased,
          licenseNo: formData.embalmerCertification?.licenseNo,
          issuedOn: formData.embalmerCertification?.issuedOn!,
          issuedAt: formData.embalmerCertification?.issuedAt,
          expiryDate: formData.embalmerCertification?.expiryDate!,
          address: formData.embalmerCertification?.address,
          titleDesignation: formData.embalmerCertification?.titleDesignation,
        } as Prisma.JsonObject,

        // Delayed Registration
        delayedRegistration: formData.delayedRegistration?.isDelayed
          ? {
            isDelayed: true,
            ...(formData.delayedRegistration.affiant ? {
              affiant: {
                name: formData.delayedRegistration.affiant.name || null,
                civilStatus: formData.delayedRegistration.affiant.civilStatus || null,
                residenceAddress: formData.delayedRegistration.affiant.residenceAddress || null,
                age: formData.delayedRegistration.affiant.age || null,
              }
            } : {}),
            ...(formData.delayedRegistration.deceased ? {
              deceased: {
                name: formData.delayedRegistration.deceased.name || null,
                diedOn: formData.delayedRegistration.deceased.diedOn || null,
                dateOfDeath: dateToJSON(formData.delayedRegistration.deceased.dateOfDeath) || null,
                placeOfDeath: formData.delayedRegistration.deceased.placeOfDeath || null,
                ...(formData.delayedRegistration.deceased.burialInfo ? {
                  burialInfo: {
                    date: dateToJSON(formData.delayedRegistration.deceased.burialInfo.date) || null,
                    place: formData.delayedRegistration.deceased.burialInfo.place || null,
                    method: formData.delayedRegistration.deceased.burialInfo.method || null,
                  }
                } : {})
              }
            } : {}),
            ...(formData.delayedRegistration.attendance ? {
              attendance: {
                wasAttended: formData.delayedRegistration.attendance.wasAttended || null,
                attendedBy: formData.delayedRegistration.attendance.attendedBy || null,
              }
            } : {}),
            ...(formData.delayedRegistration.causeOfDeath ? {
              causeOfDeath: formData.delayedRegistration.causeOfDeath
            } : {}),
            ...(formData.delayedRegistration.reasonForDelay ? {
              reasonForDelay: formData.delayedRegistration.reasonForDelay
            } : {}),
            ...(formData.delayedRegistration.affidavitDate ? {
              affidavitDate: dateToJSON(formData.delayedRegistration.affidavitDate) || null
            } : {}),
            ...(formData.delayedRegistration.affidavitDatePlace ? {
              affidavitDatePlace: formData.delayedRegistration.affidavitDatePlace
            } : {}),
            ...(formData.delayedRegistration.adminOfficer ? {
              adminOfficer: {
                name: formData.delayedRegistration.adminOfficer.name || null,
                address: formData.delayedRegistration.adminOfficer.address || null,
                position: formData.delayedRegistration.adminOfficer.position || null,
              }
            } : {}),
            ...(formData.delayedRegistration.ctcInfo ? {
              ctcInfo: {
                dayOf: dateToJSON(formData.delayedRegistration.ctcInfo.dayOf) || null,
                placeAt: formData?.delayedRegistration?.ctcInfo?.placeAt,
                number: formData.delayedRegistration.ctcInfo.number || null,
                issuedOn: dateToJSON(formData.delayedRegistration.ctcInfo.issuedOn) || null,
                issuedAt: formData.delayedRegistration.ctcInfo.issuedAt || null
              }
            } : {})
          }
          : { isDelayed: false },

        // Disposal Information
        corpseDisposal: formData.corpseDisposal,
        burialPermit: {
          number: formData.burialPermit?.number,
          dateIssued: formData.burialPermit?.dateIssued!,
        } as Prisma.JsonObject,

        transferPermit: formData.transferPermit
          ? ({
            number: formData.transferPermit.number,
            dateIssued: formData.transferPermit.dateIssued!,
          } as Prisma.JsonObject)
          : Prisma.JsonNull,

        cemeteryOrCrematory: {
          name: formData.cemeteryOrCrematory?.name,
          address: {
            ...formData.cemeteryOrCrematory?.address
          } as Prisma.JsonObject,
        } as Prisma.JsonObject,

        // Informant Information
        informant: {
          nameInPrint: formData.informant?.nameInPrint,
          relationshipToDeceased: formData.informant?.relationshipToDeceased,
          address: formData.informant?.address,
          date: formData.informant?.date!,
        } as Prisma.JsonObject,

        remarks: formData.remarks,
      },
    });

    revalidatePath('/civil-registry');

    return {
      data: {
        id: deathCert.id,
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