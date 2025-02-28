// src\app\actions\certificate-actions\marriage-certificate-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import {
    marriageCertificateSchema,
    MarriageCertificateFormValues,
} from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { DocumentStatus, FormType, Prisma } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitMarriageCertificateForm(
    formData: MarriageCertificateFormValues
) {
    try {
        if (!formData) {
            throw new Error('No form data provided');
        }

        // Validate the form data against the Zod schema
        try {
            marriageCertificateSchema.parse(formData);
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
                const isLateRegistered = formData.affidavitForDelayed ? true : false;

                // Create the BaseRegistryForm record
                const baseForm = await tx.baseRegistryForm.create({
                    data: {
                        pageNumber,
                        bookNumber,
                        formNumber: '103', // Death certificate form number
                        formType: FormType.MARRIAGE,
                        registryNumber: formData.registryNumber,
                        province: formData.province,
                        cityMunicipality: formData.cityMunicipality,

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

                // Create the MarriageCertificateForm record
                await tx.marriageCertificateForm.create({
                    data: {
                      baseFormId: baseForm.id,
                      // Husband Information
                      husbandFirstName: formData.husbandName.first,
                      husbandMiddleName: formData.husbandName.middle,
                      husbandLastName: formData.husbandName.last,
                      husbandAge: formData.husbandAge,
                      husbandDateOfBirth: dateToJSON(formData.husbandBirth),
                      husbandSex: formData.husbandSex,
                      husbandCitizenship: formData.husbandCitizenship,
                      husbandResidence: formData.husbandResidence,
                      husbandReligion: formData.husbandReligion || null,
                      husbandCivilStatus: formData.husbandCivilStatus,
                      husbandPlaceOfBirth: formData.husbandPlaceOfBirth as Prisma.JsonObject,
                  
                      // Husband Parents Information
                      husbandFatherName: formData.husbandParents.fatherName as Prisma.JsonObject,
                      husbandFatherCitizenship: formData.husbandParents.fatherCitizenship,
                      husbandMotherMaidenName: formData.husbandParents.motherName as Prisma.JsonObject,
                      husbandMotherCitizenship: formData.husbandParents.motherCitizenship,
                  
                      // Husband Consent Person
                      husbandConsentPerson: {
                        ...formData.husbandConsentPerson,
                        name: formData.husbandConsentPerson.name,
                        relationship: formData.husbandConsentPerson.relationship,
                        residence: formData.husbandConsentPerson.residence as Prisma.JsonObject,
                      } as Prisma.JsonObject,
                  
                      // Wife Information
                      wifeFirstName: formData.wifeName.first,
                      wifeMiddleName: formData.wifeName.middle,
                      wifeLastName: formData.wifeName.last,
                      wifeAge: formData.wifeAge,
                      wifeDateOfBirth: dateToJSON(formData.wifeBirth),
                      wifeSex: formData.wifeSex,
                      wifeCitizenship: formData.wifeCitizenship,
                      wifeResidence: formData.wifeResidence,
                      wifeReligion: formData.wifeReligion || null,
                      wifeCivilStatus: formData.wifeCivilStatus,
                      wifePlaceOfBirth: formData.wifePlaceOfBirth as Prisma.JsonObject,
                  
                      // Wife Parents Information
                      wifeFatherName: formData.wifeParents.fatherName as Prisma.JsonObject,
                      wifeFatherCitizenship: formData.wifeParents.fatherCitizenship,
                      wifeMotherMaidenName: formData.wifeParents.motherName as Prisma.JsonObject,
                      wifeMotherCitizenship: formData.wifeParents.motherCitizenship,
                  
                      // Wife Consent Person
                      wifeConsentPerson: {
                        ...formData.wifeConsentPerson,
                        name: formData.wifeConsentPerson.name,
                        relationship: formData.wifeConsentPerson.relationship,
                        residence: formData.wifeConsentPerson.residence as Prisma.JsonObject,
                      } as Prisma.JsonObject,
                  
                      // Contract Party
                      contractDay: formData.contractDay,
                      contractingPartiesSignature: [
                        {
                          party: 'husband',
                          signature: formData.husbandContractParty.signature instanceof File
                            ? await fileToBase64(formData.husbandContractParty.signature)
                            : formData.husbandContractParty.signature,
                          agreement: formData.husbandContractParty.agreement,
                        },
                        {
                          party: 'wife',
                          signature: formData.wifeContractParty.signature instanceof File
                            ? await fileToBase64(formData.wifeContractParty.signature)
                            : formData.wifeContractParty.signature,
                          agreement: formData.wifeContractParty.agreement,
                        },
                      ] as InputJsonValue[],
                  
                      // Marriage Details
                      placeOfMarriage: formData.placeOfMarriage as Prisma.JsonObject,
                      dateOfMarriage: dateToJSON(formData.dateOfMarriage),
                      timeOfMarriage: dateToJSON(formData.timeOfMarriage),
                  
                      // Witnesses
                      witnesses: formData.husbandWitnesses as InputJsonValue[],
                  
                      // Solemnizing Officer
                      solemnizingOfficer: formData.solemnizingOfficer as Prisma.JsonObject,
                  
                      // Marriage License Details
                      marriageLicenseDetails: {
                        ...formData.marriageLicenseDetails,
                        licenseNumber: formData.marriageLicenseDetails.licenseNumber,
                        dateIssued: dateToJSON(formData.marriageLicenseDetails.dateIssued),
                        placeIssued: formData.marriageLicenseDetails.placeIssued,
                        marriageAgreement: formData.marriageLicenseDetails.marriageAgreement,
                      } as Prisma.JsonObject,
                  
                      // Marriage Article
                      marriageArticle: {
                        ...formData.marriageArticle,
                        marriageArticle: formData.marriageArticle.marriageArticle,
                        article: formData.marriageArticle.article,
                      } as Prisma.JsonObject,
                  
                      marriageSettlement: formData.marriageSettlement,
                  
                      // Registered At Civil Registrar
                      registeredByOffice: {
                        ...formData.registeredByOffice,
                        date: dateToJSON(formData.registeredByOffice.date),
                        nameInPrint: formData.registeredByOffice.nameInPrint,
                        signature: formData.registeredByOffice.signature instanceof File
                          ? await fileToBase64(formData.registeredByOffice.signature)
                          : formData.registeredByOffice.signature,
                        title: formData.registeredByOffice.titleOrPosition,
                      } as Prisma.JsonObject,
                  
                      remarks: formData.remarks,
                  
                      // Affidavit of Solemnizing Officer
                      affidavitOfSolemnizingOfficer: {
                        administeringInformation: {
                          nameOfOfficer: formData.affidavitOfSolemnizingOfficer.administeringInformation.nameOfOfficer,
                          signatureOfOfficer: formData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer instanceof File
                            ? await fileToBase64(formData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer)
                            : formData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer,
                          position: formData.affidavitOfSolemnizingOfficer.administeringInformation.position,
                          addressOfOffice: {
                            st: formData.affidavitOfSolemnizingOfficer.administeringInformation.addressOfOffice.st,
                            barangay: formData.affidavitOfSolemnizingOfficer.administeringInformation.addressOfOffice.barangay,
                            cityMunicipality: formData.affidavitOfSolemnizingOfficer.administeringInformation.addressOfOffice.cityMunicipality,
                            province: formData.affidavitOfSolemnizingOfficer.administeringInformation.addressOfOffice.province,
                            country: formData.affidavitOfSolemnizingOfficer.administeringInformation.addressOfOffice.country,
                          } as Prisma.JsonObject,
                        } as Prisma.JsonObject,
                        nameOfPlace: formData.affidavitOfSolemnizingOfficer.nameOfPlace,
                        addressAt: formData.affidavitOfSolemnizingOfficer.addressAt,
                        a: {
                          nameOfHusband: formData.affidavitOfSolemnizingOfficer.a.nameOfHusband as Prisma.JsonObject,
                          nameOfWife: formData.affidavitOfSolemnizingOfficer.a.nameOfWife as Prisma.JsonObject,
                        } as Prisma.JsonObject,
                        b: {
                          a: formData.affidavitOfSolemnizingOfficer.b.a,
                          b: formData.affidavitOfSolemnizingOfficer.b.b,
                          c: formData.affidavitOfSolemnizingOfficer.b.c,
                          d: formData.affidavitOfSolemnizingOfficer.b.d,
                          e: formData.affidavitOfSolemnizingOfficer.b.e,
                        } as Prisma.JsonObject,
                        c: formData.affidavitOfSolemnizingOfficer.c,
                        d: {
                          dayOf: dateToJSON(formData.affidavitOfSolemnizingOfficer.d.dayOf),
                          atPlaceOfMarriage: {
                            st: formData.affidavitOfSolemnizingOfficer.d.atPlaceOfMarriage.st,
                            barangay: formData.affidavitOfSolemnizingOfficer.d.atPlaceOfMarriage.barangay,
                            cityMunicipality: formData.affidavitOfSolemnizingOfficer.d.atPlaceOfMarriage.cityMunicipality,
                            province: formData.affidavitOfSolemnizingOfficer.d.atPlaceOfMarriage.province,
                            country: formData.affidavitOfSolemnizingOfficer.d.atPlaceOfMarriage.country,
                          } as Prisma.JsonObject,
                        } as Prisma.JsonObject,
                        dateSworn: {
                          dayOf: dateToJSON(formData.affidavitOfSolemnizingOfficer.dateSworn.dayOf),
                          atPlaceOfSworn: {
                            st: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.st,
                            barangay: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.barangay,
                            cityMunicipality: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.cityMunicipality,
                            province: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.province,
                            country: formData.affidavitOfSolemnizingOfficer.dateSworn.atPlaceOfSworn.country,
                          } as Prisma.JsonObject,
                          ctcInfo: {
                            number: formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.number,
                            dateIssued: dateToJSON(formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.dateIssued),
                            placeIssued: formData.affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.placeIssued,
                          } as Prisma.JsonObject,
                        } as Prisma.JsonObject,
                        nameOfAdmin: {
                          address: formData.affidavitOfSolemnizingOfficer.nameOfAdmin.address,
                          signature: {
                            signature: formData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.signature instanceof File
                              ? await fileToBase64(formData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.signature)
                              : formData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.signature,
                            position: formData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.position,
                            name2: formData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.name2,
                          } as Prisma.JsonObject,
                        } as Prisma.JsonObject,
                      } as Prisma.JsonObject,
                  
                      // Affidavit of Delayed Registration
                      affidavitOfdelayedRegistration: formData.affidavitForDelayed?.delayedRegistration === 'Yes'
                        ? ({
                            ...formData.affidavitForDelayed,
                            delayedRegistration: 'Yes',
                            // Administering Information
                            administeringInformation: {
                              signatureOfAdmin: formData.affidavitForDelayed.administeringInformation.signatureOfAdmin instanceof File
                                ? await fileToBase64(formData.affidavitForDelayed.administeringInformation.signatureOfAdmin)
                                : formData.affidavitForDelayed.administeringInformation.signatureOfAdmin,
                              nameOfOfficer: formData.affidavitForDelayed.administeringInformation.nameOfOfficer,
                              position: formData.affidavitForDelayed.administeringInformation.position,
                              addressOfOfficer: {
                                cityMunicipality: formData.affidavitForDelayed.administeringInformation.addressOfOfficer.cityMunicipality,
                                province: formData.affidavitForDelayed.administeringInformation.addressOfOfficer.province,
                                country: formData.affidavitForDelayed.administeringInformation.addressOfOfficer.country,
                                st: formData.affidavitForDelayed.administeringInformation.addressOfOfficer.st,
                                barangay: formData.affidavitForDelayed.administeringInformation.addressOfOfficer.barangay,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                            // Applicant Information
                            applicantInformation: {
                              signatureOfApplicant: formData.affidavitForDelayed.applicantInformation.signatureOfApplicant instanceof File
                                ? await fileToBase64(formData.affidavitForDelayed.applicantInformation.signatureOfApplicant)
                                : formData.affidavitForDelayed.applicantInformation.signatureOfApplicant,
                              nameOfApplicant: formData.affidavitForDelayed.applicantInformation.nameOfApplicant,
                              postalCode: formData.affidavitForDelayed.applicantInformation.postalCode,
                              applicantAddress: {
                                cityMunicipality: formData.affidavitForDelayed.applicantInformation.applicantAddress.cityMunicipality,
                                province: formData.affidavitForDelayed.applicantInformation.applicantAddress.province,
                                country: formData.affidavitForDelayed.applicantInformation.applicantAddress.country,
                                st: formData.affidavitForDelayed.applicantInformation.applicantAddress.st,
                                barangay: formData.affidavitForDelayed.applicantInformation.applicantAddress.barangay,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                            // Section A
                            a: {
                              a: {
                                agreement: formData.affidavitForDelayed.a.a.agreement,
                                nameOfPartner: formData.affidavitForDelayed.a.a.nameOfPartner,
                                placeOfMarriage: formData.affidavitForDelayed.a.a.placeOfMarriage,
                                dateOfMarriage: formData.affidavitForDelayed.a.a.dateOfMarriage
                                  ? dateToJSON(formData.affidavitForDelayed.a.a.dateOfMarriage)
                                  : null,
                              } as Prisma.JsonObject,
                              b: {
                                agreement: formData.affidavitForDelayed.a.b.agreement,
                                nameOfHusband: formData.affidavitForDelayed.a.b.nameOfHusband,
                                nameOfWife: formData.affidavitForDelayed.a.b.nameOfWife,
                                placeOfMarriage: formData.affidavitForDelayed.a.b.placeOfMarriage,
                                dateOfMarriage: formData.affidavitForDelayed.a.b.dateOfMarriage
                                  ? dateToJSON(formData.affidavitForDelayed.a.b.dateOfMarriage)
                                  : null,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                            // Section B
                            b: {
                              solemnizedBy: formData.affidavitForDelayed.b.solemnizedBy,
                              sector: formData.affidavitForDelayed.b.sector,
                            } as Prisma.JsonObject,
                            // Section C
                            c: {
                              a: {
                                licenseNo: formData.affidavitForDelayed.c.a.licenseNo,
                                dateIssued: dateToJSON(formData.affidavitForDelayed.c.a.dateIssued),
                                placeOfSolemnizedMarriage: formData.affidavitForDelayed.c.a.placeOfSolemnizedMarriage,
                              } as Prisma.JsonObject,
                              b: {
                                underArticle: formData.affidavitForDelayed.c.b.underArticle,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                            // Section D
                            d: {
                              husbandCitizenship: formData.affidavitForDelayed.d.husbandCitizenship,
                              wifeCitizenship: formData.affidavitForDelayed.d.wifeCitizenship,
                            } as Prisma.JsonObject,
                            // Section E
                            e: formData.affidavitForDelayed.e,
                            // Section F
                            f: {
                              date: formData.affidavitForDelayed.f.date
                                ? dateToJSON(formData.affidavitForDelayed.f.date)
                                : null,
                              place: {
                                cityMunicipality: formData.affidavitForDelayed.f.place.cityMunicipality,
                                province: formData.affidavitForDelayed.f.place.province,
                                country: formData.affidavitForDelayed.f.place.country,
                                barangay: formData.affidavitForDelayed.f.place.barangay,
                                st: formData.affidavitForDelayed.f.place.st,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                            // Date Sworn
                            dateSworn: {
                              dayOf: dateToJSON(formData.affidavitForDelayed.dateSworn.dayOf),
                              atPlaceOfSworn: {
                                cityMunicipality: formData.affidavitForDelayed.dateSworn.atPlaceOfSworn.cityMunicipality,
                                province: formData.affidavitForDelayed.dateSworn.atPlaceOfSworn.province,
                                country: formData.affidavitForDelayed.dateSworn.atPlaceOfSworn.country,
                                barangay: formData.affidavitForDelayed.dateSworn.atPlaceOfSworn.barangay,
                                st: formData.affidavitForDelayed.dateSworn.atPlaceOfSworn.st,
                              } as Prisma.JsonObject,
                              ctcInfo: {
                                number: formData.affidavitForDelayed.dateSworn.ctcInfo.number,
                                dateIssued: dateToJSON(formData.affidavitForDelayed.dateSworn.ctcInfo.dateIssued),
                                placeIssued: formData.affidavitForDelayed.dateSworn.ctcInfo.placeIssued,
                              } as Prisma.JsonObject,
                            } as Prisma.JsonObject,
                          } as Prisma.JsonObject)
                        : Prisma.JsonNull,
                    },
                  });

                // Revalidate the path for updated content
                revalidatePath('/marriage-certificates');

                return {
                    success: true,
                    message: 'Marriage certificate submitted successfully',
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
                    : 'Failed to submit marriage certificate form',
        };
    }
}