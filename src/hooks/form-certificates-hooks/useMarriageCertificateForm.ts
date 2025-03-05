import { submitMarriageCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/marriage-certificate-actions';
import { MarriageCertificateFormValues, marriageCertificateSchema } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { notifyUsersWithPermission } from '../users-action';
import { useRouter } from 'next/navigation';

interface UseMarriageCertificateFormProps {
    onOpenChange?: (open: boolean) => void;
    defaultValues?: Partial<MarriageCertificateFormValues> & { id?: string };
}

// Helper function to prepare data for Prisma
const preparePrismaData = (data: any) => {
    const formatTimeString = (date: Date) => {
        return date instanceof Date ?
            date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }) : date;
    };
    const processedData = { ...data };
    return processedData;
};

const emptyDefaults: MarriageCertificateFormValues = {
    // Registry Information
    registryNumber: '',
    province: 'Metro Manila',
    cityMunicipality: 'Quezon City',

    // Husband Information
    husbandName: {
        first: 'Juan',
        middle: 'Dela',
        last: 'Cruz'
    },
    husbandAge: 30,
    husbandBirth: new Date('1990-01-01'),
    husbandPlaceOfBirth: {
        houseNo: '123',
        street: 'Main Street',
        barangay: 'Capri',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila',
        country: 'Philippines'
    },
    husbandSex: 'Male',
    husbandCitizenship: 'Filipino',
    husbandResidence: 'Quezon City',
    husbandReligion: 'Roman Catholic',
    husbandCivilStatus: 'Single',
    husbandConsentPerson: {
        name: {
            first: 'Pedro',
            middle: 'Dela',
            last: 'Cruz'
        },
        relationship: 'Father',
        residence: {
            houseNo: '123',
            street: 'Main Street',
            barangay: 'Capri',
            cityMunicipality: 'Quezon City',
            province: 'Metro Manila',
            country: 'Philippines'
        }
    },
    husbandParents: {
        fatherName: {
            first: 'Pedro',
            middle: 'Dela',
            last: 'Cruz'
        },
        fatherCitizenship: 'Filipino',
        motherName: {
            first: 'Maria',
            middle: 'Dela',
            last: 'Cruz'
        },
        motherCitizenship: 'Filipino'
    },

    // Wife Information
    wifeName: {
        first: 'Maria',
        middle: 'Dela',
        last: 'Cruz'
    },
    wifeAge: 28,
    wifeBirth: new Date('1992-02-02'),
    wifePlaceOfBirth: {
        houseNo: '456',
        street: 'Second Street',
        barangay: 'Capri',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila',
        country: 'Philippines'
    },
    wifeSex: 'Female',
    wifeCitizenship: 'Filipino',
    wifeResidence: 'Quezon City',
    wifeReligion: 'Roman Catholic',
    wifeCivilStatus: 'Single',
    wifeConsentPerson: {
        name: {
            first: 'Juanita',
            middle: 'Dela',
            last: 'Cruz'
        },
        relationship: 'Mother',
        residence: {
            houseNo: '456',
            street: 'Second Street',
            barangay: 'Capri',
            cityMunicipality: 'Quezon City',
            province: 'Metro Manila',
            country: 'Philippines'
        }
    },
    wifeParents: {
        fatherName: {
            first: 'Jose',
            middle: 'Dela',
            last: 'Cruz'
        },
        fatherCitizenship: 'Filipino',
        motherName: {
            first: 'Ana',
            middle: 'Dela',
            last: 'Cruz'
        },
        motherCitizenship: 'Filipino'
    },

    // Marriage Details
    placeOfMarriage: {
        houseNo: '789',
        street: 'Third Street',
        barangay: 'Capri',
        cityMunicipality: 'Quezon City',
        province: 'Metro Manila',
        country: 'Philippines'
    },
    dateOfMarriage: new Date('2023-10-10'),
    timeOfMarriage: new Date('2023-10-10T14:30:00'),

    // Witnesses
    husbandWitnesses: [
        {
            name: 'John Doe'
        },
        {
            name: 'Jane Doe'
        }
    ],
    wifeWitnesses: [
        {
            name: 'Alice Smith'
        },
        {
            name: 'Bob Johnson'
        }
    ],

    // Contract Details
    contractDay: new Date('2023-10-10'),

    // Contracting Parties
    husbandContractParty: {
        agreement: true
    },
    wifeContractParty: {
        agreement: true
    },

    // Marriage License Details
    marriageLicenseDetails: {
        dateIssued: new Date('2023-09-01'),
        placeIssued: 'Manila City Hall',
        licenseNumber: 'LIC123456',
        marriageAgreement: true
    },

    // Marriage Article
    marriageArticle: {
        article: 'Article 1',
        marriageArticle: true
    },

    // Marriage Settlement
    marriageSettlement: true,

    // Solemnizing Officer
    solemnizingOfficer: {
        name: 'Rev. Father Santos',
        position: 'Priest',
        registryNoExpiryDate: '2025-12-31'
    },

    // Registered at Civil Registrar
    preparedBy: {
        date: new Date('2023-10-11'),
        nameInPrint: 'Clerk Juan',
        titleOrPosition: 'Clerk'
    },
    receivedBy: {
        date: new Date('2023-10-11'),
        nameInPrint: 'Registrar Maria',
        titleOrPosition: 'Registrar'
    },
    registeredByOffice: {
        date: new Date('2023-10-11'),
        nameInPrint: 'Office Clerk',
        titleOrPosition: 'Office Clerk'
    },

    // Optional Sections
    remarks: 'No remarks',

    // Back page data - Affidavit of Solemnizing Officer
    affidavitOfSolemnizingOfficer: {
        solemnizingOfficerInformation: {
            officerName: {
                first: 'Rev. Father',
                middle: 'Dela',
                last: 'Santos'
            },
            officeName: 'Manila Parish',
            address: 'Manila, Philippines'
        },

        a: {
            nameOfHusband: {
                first: 'Juan',
                middle: 'Dela',
                last: 'Cruz'
            },
            nameOfWife: {
                first: 'Maria',
                middle: 'Dela',
                last: 'Cruz'
            },
        },
        b: {
            a: true,
            b: false,
            c: false,
            d: false,
            e: false,
        },
        c: '', //wala man to
        d: {
            dayOf: new Date('2023-10-10'),
            atPlaceExecute: {
                st: 'Third Street',
                barangay: 'Capri',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            },
        },
        dateSworn: {
            dayOf: new Date('2023-10-11'),
            atPlaceOfSworn: {
                st: 'Third Street',
                barangay: 'Capri',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            },
            ctcInfo: {
                number: 'CTC123456',
                dateIssued: new Date('2023-10-11'),
                placeIssued: 'Manila City Hall'
            },
        },
        administeringOfficerInformation: {
            adminName: {
                first: 'Clerk',
                middle: 'Dela',
                last: 'Juan'
            },
            address: 'Manila, Philippines',
            position: 'Clerk'
        },
    },

    // Affidavit for Delayed Registration
    affidavitForDelayed: {
        delayedRegistration: 'No',
        administeringInformation: {
            adminName: 'Admin Juan',
            position: 'Admin',
            adminAddress: 'Manila, Philippines'
        },
        applicantInformation: {
            nameOfApplicant: 'Juan Cruz',
            postalCode: '1234',
            applicantAddress: {
                st: 'Main Street',
                barangay: 'Capri',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            }
        },
        a: {
            a: {
                agreement: false,
                nameOfPartner: {
                    first: '',
                    middle: '',
                    last: ''
                },
                placeOfMarriage: '',
                dateOfMarriage: undefined,
            },
            b: {
                agreement: true,
                nameOfHusband: {
                    first: 'Juan',
                    middle: 'Dela',
                    last: 'Cruz'
                },
                nameOfWife: {
                    first: 'Maria',
                    middle: 'Dela',
                    last: 'Cruz'
                },
                placeOfMarriage: 'Manila',
                dateOfMarriage: new Date('2023-10-10'),
            }
        },
        b: {
            solemnizedBy: 'Rev. Father Santos',
            sector: 'religious-ceremony',
        },
        c: {
            a: {
                licenseNo: 'LIC123456',
                dateIssued: new Date('2023-09-01'),
                placeOfSolemnizedMarriage: 'Manila'
            },
            b: {
                underArticle: 'Article 1'
            }
        },
        d: {
            husbandCitizenship: 'Filipino',
            wifeCitizenship: 'Filipino'
        },
        e: 'No reason provided',
        f: {
            date: new Date('2023-10-11'),
            place: {
                st: 'Third Street',
                barangay: 'Capri',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            }
        },
        dateSworn: {
            dayOf: new Date('2023-10-11'),
            atPlaceOfSworn: {
                st: 'Third Street',
                barangay: 'Capri',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            },
            ctcInfo: {
                number: 'CTC123456',
                dateIssued: new Date('2023-10-11'),
                placeIssued: 'Manila City Hall'
            }
        }
    }
};

export function useMarriageCertificateForm({
    onOpenChange,
    defaultValues
}: UseMarriageCertificateFormProps = {}) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initialValues, setInitialValues] = useState<Partial<MarriageCertificateFormValues> | undefined>(undefined);

    const formMethods = useForm<MarriageCertificateFormValues>({
        resolver: zodResolver(marriageCertificateSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues || emptyDefaults,
    });

    const router = useRouter();

    // Reset the form when defaultValues change (for edit mode)
    useEffect(() => {
        if (defaultValues && !isInitialized) {
            // Set the form values once and mark as initialized
            formMethods.reset(defaultValues);
            setIsInitialized(true);
        }
    }, [defaultValues, formMethods, isInitialized]);


    // const handleFileUploads = async (data: any) => {
    //     // Create a deep copy to avoid mutating the original
    //     const processedData = { ...data };

    //     // Process all signatures
    //     // Prepared By, Received By, and Registered By signatures
    //     if (processedData.preparedByOffice?.signature instanceof File) {
    //         processedData.preparedByOffice.signature = await fileToBase64(processedData.preparedByOffice.signature);
    //     }

    //     if (processedData.receivedByOffice?.signature instanceof File) {
    //         processedData.receivedByOffice.signature = await fileToBase64(processedData.receivedByOffice.signature);
    //     }

    //     if (processedData.registeredByOffice?.signature instanceof File) {
    //         processedData.registeredByOffice.signature = await fileToBase64(processedData.registeredByOffice.signature);
    //     }

    //     // Solemnizing Officer signature
    //     if (processedData.solemnizingOfficer?.signature instanceof File) {
    //         processedData.solemnizingOfficer.signature = await fileToBase64(processedData.solemnizingOfficer.signature);
    //     }

    //     // Contracting Parties signatures
    //     if (processedData.husbandContractParty?.signature instanceof File) {
    //         processedData.husbandContractParty.signature = await fileToBase64(
    //             processedData.husbandContractParty.signature
    //         );
    //     }

    //     if (processedData.wifeContractParty?.signature instanceof File) {
    //         processedData.wifeContractParty.signature = await fileToBase64(
    //             processedData.wifeContractParty.signature
    //         );
    //     }

    //     if (processedData.husbandWitnesses?.signature instanceof File) {
    //         processedData.husbandWitnesses.signature = await fileToBase64(processedData.husbandWitnesses.signature);
    //     }
    //     if (processedData.wifeWitnesses?.signature instanceof File) {
    //         processedData.wifeWitnesses.signature = await fileToBase64(processedData.wifeWitnesses.signature);
    //     }

    //     // Affidavit of Solemnizing Officer
    //     if (processedData.affidavitOfSolemnizingOfficer) {
    //         if (processedData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation?.signature instanceof File) {
    //             processedData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.signature =
    //                 await fileToBase64(processedData.affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.signature);
    //         }

    //         if (processedData.affidavitOfSolemnizingOfficer.administeringOfficerInformation?.signature instanceof File) {
    //             processedData.affidavitOfSolemnizingOfficer.administeringOfficerInformation.signature =
    //                 await fileToBase64(processedData.affidavitOfSolemnizingOfficer.administeringOfficerInformation.signature);
    //         }
    //     }
    //     // Affidavit for Delayed Registration (optional)
    //     if (processedData.affidavitForDelayed && processedData.affidavitForDelayed.delayedRegistration === 'Yes') {
    //         // Check if administeringInformation exists before accessing its properties
    //         if (processedData.affidavitForDelayed.administeringInformation) {
    //             if (processedData.affidavitForDelayed.administeringInformation.adminSignature instanceof File) {
    //                 processedData.affidavitForDelayed.administeringInformation.adminSignature =
    //                     await fileToBase64(processedData.affidavitForDelayed.administeringInformation.adminSignature);
    //             }
    //         }

    //         // Check if applicantInformation exists before accessing its properties
    //         if (processedData.affidavitForDelayed.applicantInformation) {
    //             if (processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant instanceof File) {
    //                 processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant =
    //                     await fileToBase64(processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant);
    //             }
    //         }
    //     } else if (processedData.affidavitForDelayed) {
    //         // If not a 'Yes' for delayed registration, set to null or a minimal object
    //         processedData.affidavitForDelayed = {
    //             delayedRegistration: 'No'
    //         };
    //     }

    //     return processedData;
    // };

    // Updated submission function with proper data preparation
    const onSubmit = async (data: MarriageCertificateFormValues) => {
        console.log('🔍 Initial Form Data Submission Started');
        console.log('📋 Full Form Data:', JSON.stringify(data, null, 2));

        // Log form state details
        console.log('📊 Form State Details:', {
            isValid: formMethods.formState.isValid,
            isDirty: formMethods.formState.isDirty,
            isSubmitting: formMethods.formState.isSubmitting,
            submitCount: formMethods.formState.submitCount,
        });

        // Detailed validation check
        const validationResult = marriageCertificateSchema.safeParse(data);
        console.log('🕵️ Zod Validation Result:', {
            success: validationResult.success,
            ...(validationResult.success ? {} : {
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }))
            })
        });

        // Comprehensive form validity check
        if (!formMethods.formState.isValid) {
            console.error("❌ Form is INVALID - Submission Blocked");

            // Detailed error logging
            const errors = formMethods.formState.errors;
            console.error("🚨 Detailed Form Errors:", JSON.stringify(errors, null, 2));

            // Log specific invalid fields
            Object.keys(errors).forEach(field => {
                console.error(`🔴 Invalid Field: ${field}`, (errors as any)[field]);
            });

            // Trigger error handling
            handleError(errors);
            return;
        }

        try {
            console.log('🚀 Preparing to submit form data');

            // Check and simplify affidavitForDelayed if it's "No"
            if (data.affidavitForDelayed?.delayedRegistration === 'No') {
                console.log('🔍 Simplifying Delayed Registration Data');
                data.affidavitForDelayed = {
                    delayedRegistration: 'No'
                };
            }

            // Check if we're in update mode
            const isUpdateMode = Boolean(defaultValues && defaultValues.id);

            if (isUpdateMode) {
                console.log('🖊️ Update Mode Detected', {
                    currentId: defaultValues?.id,
                    updateData: JSON.stringify(data, null, 2)
                });
            } else {
                console.log('📝 New Record Submission');
            }

            // Data preparation
            const preparedData = preparePrismaData(data);
            console.log('🔧 Prepared Data:', JSON.stringify(preparedData, null, 2));

            // For update mode, just show the toast and log
            if (isUpdateMode) {
                console.log('🟢 Update data is correct and ready to be saved');
                toast.success('Marriage certificate data prepared successfully for update');
                return;
            }

            // Actual submission
            console.log('📤 Submitting Marriage Certificate Form');
            const result = await submitMarriageCertificateForm(preparedData);

            console.log('📥 Submission Result:', JSON.stringify(result, null, 2));

            if ('data' in result) {
                console.log('✅ Successful Submission', {
                    bookNumber: result.data.bookNumber,
                    pageNumber: result.data.pageNumber,
                    registryNumber: data.registryNumber
                });

                toast.success(`Marriage certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`);

                notifyUsersWithPermission(
                    Permission.DOCUMENT_READ,
                    "New uploaded Marriage Certificate",
                    `New Marriage Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`
                );

                onOpenChange?.(false);
                formMethods.reset();
            } else if ('error' in result) {
                console.error('❌ Submission Error:', result.error);
                toast.error(
                    result.error.includes('No user found with name')
                        ? 'Invalid prepared by user. Please check the name.'
                        : result.error
                );
            }

            // Reset form to default values
            formMethods.reset(emptyDefaults);

        } catch (error) {
            console.error('🔥 Catastrophic Submission Error:', error);
            toast.error('Submission failed, please try again');
            return { success: false, error: 'Internal server error' };
        }
    };

    const handleError = (errors: any) => {
        console.error("❌ Form Errors:", errors);
        console.log("handleError triggered, preventing submission");

        const errorMessages: string[] = [];

        Object.entries(errors).forEach(([fieldName, error]: any) => {
            if (error?.message) {
                errorMessages.push(`${formatFieldName(fieldName)}: ${error.message}`);
            } else if (typeof error === "object") {
                Object.entries(error).forEach(([subField, subError]: any) => {
                    if (subError?.message) {
                        errorMessages.push(`${formatFieldName(fieldName)} → ${formatFieldName(subField)}: ${subError.message}`);
                    }
                });
            }
        });

        if (errorMessages.length > 0) {
            toast.error(errorMessages.join("\n"));
        } else {
            toast.error("Please check the form for errors");
        }
    };


    // const onSubmit = async (data: MarriageCertificateFormValues) => {
    //     try {
    //         console.log('✅ Form Data Submitted:', JSON.stringify(data, null, 2)); // Pretty-print JSON data
    //         console.log('✅ Form Current State:', JSON.stringify(formMethods.getValues(), null, 2)); // Debug current state

    //         toast.success('Form submitted successfully');
    //         onOpenChange?.(false);
    //     } catch (error) {
    //         console.error('❌ Error submitting form:', error);
    //         toast.error('Submission failed, please try again');
    //     }
    // };

    // Extract file upload processing to a separate function

    // Helper function to make field names user-friendly
    const formatFieldName = (fieldName: string) => {
        return fieldName
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/\./g, " → ") // Replace dots with arrows
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
    };

    // ✅ Watch changes in husband's and wife's names
    const husbandName = useWatch({ control: formMethods.control, name: 'husbandName' });
    const wifeName = useWatch({ control: formMethods.control, name: 'wifeName' });

    // ✅ Sync husband's name to affidavit
    React.useEffect(() => {
        if (husbandName) {
            formMethods.setValue('affidavitOfSolemnizingOfficer.a.nameOfHusband', {
                first: husbandName.first || '',
                middle: husbandName.middle || '',
                last: husbandName.last || '',
            });
        }
    }, [husbandName, formMethods]);

    // ✅ Sync wife's name to affidavit
    React.useEffect(() => {
        if (wifeName) {
            formMethods.setValue('affidavitOfSolemnizingOfficer.a.nameOfWife', {
                first: wifeName.first || '',
                middle: wifeName.middle || '',
                last: wifeName.last || '',
            });
        }
    }, [wifeName, formMethods]);

    return { formMethods, onSubmit, handleError };
}