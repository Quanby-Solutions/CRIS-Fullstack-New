import { submitMarriageCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/marriage-certificate-actions';
import { MarriageCertificateFormValues, marriageCertificateSchema } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

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
    province: '',
    cityMunicipality: '',

    // Husband Information
    husbandName: {
        first: '',
        middle: '',
        last: ''
    },
    husbandAge: 0,
    husbandBirth: undefined,
    husbandPlaceOfBirth: {
        houseNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: ''
    },
    husbandSex: 'Male',
    husbandCitizenship: '',
    husbandResidence: '',
    husbandReligion: '',
    husbandCivilStatus: 'Single',
    husbandConsentPerson: {
        name: {
            first: '',
            middle: '',
            last: ''
        },
        relationship: '',
        residence: {
            houseNo: '',
            street: '',
            barangay: '',
            cityMunicipality: '',
            province: '',
            country: ''
        }
    },
    husbandParents: {
        fatherName: {
            first: '',
            middle: '',
            last: ''
        },
        fatherCitizenship: '',
        motherName: {
            first: '',
            middle: '',
            last: ''
        },
        motherCitizenship: ''
    },

    // Wife Information
    wifeName: {
        first: '',
        middle: '',
        last: ''
    },
    wifeAge: 0,
    wifeBirth: undefined,
    wifePlaceOfBirth: {
        houseNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: ''
    },
    wifeSex: 'Female',
    wifeCitizenship: '',
    wifeResidence: '',
    wifeReligion: '',
    wifeCivilStatus: 'Single',
    wifeConsentPerson: {
        name: {
            first: '',
            middle: '',
            last: ''
        },
        relationship: '',
        residence: {
            houseNo: '',
            street: '',
            barangay: '',
            cityMunicipality: '',
            province: '',
            country: ''
        }
    },
    wifeParents: {
        fatherName: {
            first: '',
            middle: '',
            last: ''
        },
        fatherCitizenship: '',
        motherName: {
            first: '',
            middle: '',
            last: ''
        },
        motherCitizenship: ''
    },

    // Marriage Details
    placeOfMarriage: {
        houseNo: '',
        street: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: ''
    },
    dateOfMarriage: undefined,
    timeOfMarriage: undefined,

    // Witnesses
    husbandWitnesses: [
        {
            name: '',
            signature: ''
        },
        {
            name: '',
            signature: ''
        }
    ],
    wifeWitnesses: [
        {
            name: '',
            signature: ''
        },
        {
            name: '',
            signature: ''
        }
    ],

    // Contract Details
    contractDay: undefined,

    // Contracting Parties
    husbandContractParty: {
        signature: '',
        agreement: false
    },
    wifeContractParty: {
        signature: '',
        agreement: false
    },

    // Marriage License Details
    marriageLicenseDetails: {
        dateIssued: undefined,
        placeIssued: '',
        licenseNumber: '',
        marriageAgreement: false
    },

    // Marriage Article
    marriageArticle: {
        article: '',
        marriageArticle: false
    },

    // Marriage Settlement
    marriageSettlement: false,

    // Solemnizing Officer
    solemnizingOfficer: {
        name: '',
        position: '',
        signature: '',
        registryNoExpiryDate: ''
    },

    // Registered at Civil Registrar
    preparedBy: {
        date: undefined,
        nameInPrint: '',
        signature: '',
        titleOrPosition: ''
    },
    receivedBy: {
        date: undefined,
        nameInPrint: '',
        signature: '',
        titleOrPosition: ''
    },
    registeredByOffice: {
        date: undefined,
        nameInPrint: '',
        signature: '',
        titleOrPosition: ''
    },

    // Optional Sections
    remarks: '',
    pagination: {
        pageNumber: '',
        bookNumber: ''
    },

    // Back page data - Affidavit of Solemnizing Officer
    affidavitOfSolemnizingOfficer: {
        administeringInformation: {
            nameOfOfficer: '',
            signatureOfOfficer: '',
            position: '',
            addressOfOffice: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            },
        },
        nameOfPlace: '',
        addressAt: '',
        a: {
            nameOfHusband: {
                first: '',
                middle: '',
                last: ''
            },
            nameOfWife: {
                first: '',
                middle: '',
                last: ''
            },
        },
        b: {
            a: false,
            b: false,
            c: false,
            d: false,
            e: false,
        },
        c: '',
        d: {
            dayOf: undefined,
            atPlaceOfMarriage: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            },
        },
        dateSworn: {
            dayOf: undefined,
            atPlaceOfSworn: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            },
            ctcInfo: {
                number: '',
                dateIssued: undefined,
                placeIssued: '',
            },
        },
        nameOfAdmin: {
            address: '',
            signature: {
                signature: '',
                position: '',
                name2: '',
            }
        },
    },

    // Affidavit for Delayed Registration
    affidavitForDelayed: {
        delayedRegistration: 'No',
        administeringInformation: {
            signatureOfAdmin: '',
            nameOfOfficer: '',
            position: '',
            addressOfOfficer: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            }
        },
        applicantInformation: {
            signatureOfApplicant: '',
            nameOfApplicant: '',
            postalCode: '',
            applicantAddress: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
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
                agreement: false,
                nameOfHusband: {
                    first: '',
                    middle: '',
                    last: ''
                },
                nameOfWife: {
                    first: '',
                    middle: '',
                    last: ''
                },
                placeOfMarriage: '',
                dateOfMarriage: undefined,
            }
        },
        b: {
            solemnizedBy: '',
            sector: 'religious-ceremony',
        },
        c: {
            a: {
                licenseNo: '',
                dateIssued: undefined,
                placeOfSolemnizedMarriage: '',
            },
            b: {
                underArticle: ''
            },
        },
        d: {
            husbandCitizenship: '',
            wifeCitizenship: '',
        },
        e: '',
        f: {
            date: undefined,
            place: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            }
        },
        dateSworn: {
            dayOf: undefined,
            atPlaceOfSworn: {
                st: '',
                barangay: '',
                cityMunicipality: '',
                province: '',
                country: ''
            },
            ctcInfo: {
                number: '',
                dateIssued: undefined,
                placeIssued: '',
            }
        }
    }
}

export function useMarriageCertificateForm({
    onOpenChange,
    defaultValues
}: UseMarriageCertificateFormProps = {}) {
    const formMethods = useForm<MarriageCertificateFormValues>({
        resolver: zodResolver(marriageCertificateSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues || emptyDefaults,
    });

    // Reset the form when defaultValues change (for edit mode)
    React.useEffect(() => {
        if (defaultValues) {
            formMethods.reset({ ...emptyDefaults, ...defaultValues });
        }
    }, [defaultValues, formMethods]);


    const handleFileUploads = async (data: any) => {
        // Create a deep copy to avoid mutating the original
        const processedData = { ...data };

        // Process all signatures
        // Prepared By, Received By, and Registered By signatures
        if (processedData.preparedBy?.signature instanceof File) {
            processedData.preparedBy.signature = await fileToBase64(processedData.preparedBy.signature);
        }

        if (processedData.receivedBy?.signature instanceof File) {
            processedData.receivedBy.signature = await fileToBase64(processedData.receivedBy.signature);
        }

        if (processedData.registeredByOffice?.signature instanceof File) {
            processedData.registeredByOffice.signature = await fileToBase64(processedData.registeredByOffice.signature);
        }

        // Solemnizing Officer signature
        if (processedData.solemnizingOfficer?.signature instanceof File) {
            processedData.solemnizingOfficer.signature = await fileToBase64(processedData.solemnizingOfficer.signature);
        }

        // Contracting Parties signatures
        if (processedData.husbandContractParty?.signature instanceof File) {
            processedData.husbandContractParty.signature = await fileToBase64(
                processedData.husbandContractParty.signature
            );
        }

        if (processedData.wifeContractParty?.signature instanceof File) {
            processedData.wifeContractParty.signature = await fileToBase64(
                processedData.wifeContractParty.signature
            );
        }

        // Witnesses signatures
        if (processedData.husbandWitnesses) {
            processedData.husbandWitnesses = await Promise.all(
                processedData.husbandWitnesses.map(async (witness: any) => ({
                    ...witness,
                    signature: witness.signature instanceof File
                        ? await fileToBase64(witness.signature)
                        : witness.signature
                }))
            );
        }

        if (processedData.wifeWitnesses) {
            processedData.wifeWitnesses = await Promise.all(
                processedData.wifeWitnesses.map(async (witness: any) => ({
                    ...witness,
                    signature: witness.signature instanceof File
                        ? await fileToBase64(witness.signature)
                        : witness.signature
                }))
            );
        }

        // Affidavit of Solemnizing Officer
        if (processedData.affidavitOfSolemnizingOfficer) {
            if (processedData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer instanceof File) {
                processedData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer =
                    await fileToBase64(processedData.affidavitOfSolemnizingOfficer.administeringInformation.signatureOfOfficer);
            }

            if (processedData.affidavitOfSolemnizingOfficer.nameOfAdmin?.signature?.signature instanceof File) {
                processedData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.signature =
                    await fileToBase64(processedData.affidavitOfSolemnizingOfficer.nameOfAdmin.signature.signature);
            }
        }

        // Affidavit for Delayed Registration (optional)
        if (processedData.affidavitForDelayed) {
            if (processedData.affidavitForDelayed.administeringInformation.signatureOfAdmin instanceof File) {
                processedData.affidavitForDelayed.administeringInformation.signatureOfAdmin =
                    await fileToBase64(processedData.affidavitForDelayed.administeringInformation.signatureOfAdmin);
            }

            if (processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant instanceof File) {
                processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant =
                    await fileToBase64(processedData.affidavitForDelayed.applicantInformation.signatureOfApplicant);
            }
        }

        return processedData;
    };

    // Updated submission function with proper data preparation
    const onSubmit = async (data: MarriageCertificateFormValues) => {
        try {
            console.log(
                'Attempting to submit form with data:',
                JSON.stringify(data, null, 2)
            );

            // First prepare the data structure
            const preparedData = preparePrismaData(data);

            // Process file uploads and convert to base64
            const processedData = await handleFileUploads(preparedData);

            console.log('Processed data before submission:', processedData);


            // Submit the processed data
            const result = await submitMarriageCertificateForm(processedData);

            // If defaultValues includes an id, assume update mode and simply log success
            if (defaultValues && defaultValues.id) {
                console.log('Update successful:', data);
                toast.success('Marriage certificate update successful');
            } else {
                const result = await submitMarriageCertificateForm(data);
                console.log('API submission result:', result);
                if ('data' in result) {
                    console.log('Submission successful:', result);
                    toast.success(
                        `Marriage certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
                    );
                    onOpenChange?.(false);
                } else if ('error' in result) {
                    console.log('Submission error:', result.error);
                    const errorMessage = result.error.includes('No user found with name')
                        ? 'Invalid prepared by user. Please check the name.'
                        : result.error;
                    toast.error(errorMessage);
                }
            }
            formMethods.reset(emptyDefaults);
        }
        catch (error) {
            console.error('Error in submitMarriageCertificateForm:', error);
            return {
                success: false,
                error: 'Internal server error',
            };
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


    const handleError = (errors: any) => {
        console.error("❌ Form Errors:", errors); // Log errors for debugging

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
            toast.error(errorMessages.join("\n")); // Show all errors in a single toast
        } else {
            toast.error("Please check the form for errors");
        }
    };

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