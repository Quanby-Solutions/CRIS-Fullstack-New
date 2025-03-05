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
import { updateMarriageCertificateForm } from '@/components/custom/civil-registry/actions/certificate-edit-actions/marriage-certificate-edit-form';

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

    pagination:{
        pageNumber: '',
        bookNumber: ''
    },

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
        nameInPrint: 'Clerk 1',
        titleOrPosition: 'Clerk 1'
    },
    receivedBy: {
        date: new Date('2023-10-11'),
        nameInPrint: 'Clerk 2',
        titleOrPosition: 'Clerk 2'
    },
    registeredByOffice: {
        date: new Date('2023-10-11'),
        nameInPrint: 'Clerk 3',
        titleOrPosition: 'Clerk 3'
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
        delayedRegistration: undefined,
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
                agreement: undefined,
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Updated submission function with proper data preparation
    const onSubmit = async (data: MarriageCertificateFormValues) => {
        // Prevent multiple submissions
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Check and simplify affidavitForDelayed if it's "No"
        if (data.affidavitForDelayed?.delayedRegistration === 'No') {
            data.affidavitForDelayed = {
                delayedRegistration: 'No'
            };
        }

        if (!formMethods.formState.isValid) {
            console.error("Form is invalid, submission blocked");
            setIsSubmitting(false);
            return;
        }

        try {
            // Check if we're in update mode
            const isUpdateMode = Boolean(defaultValues && defaultValues.id);
            console.log('dapat na id:', defaultValues?.id || '');
            
            let result;
            
            if (isUpdateMode) {
                console.log('Updating marriage certificate with ID:', defaultValues?.id);
                console.log('Form values being sent:', data);
                
                // Call update function
                result = await updateMarriageCertificateForm(defaultValues?.id || '', data);
                
                // Log the result
                console.log('Update result:', result);
                
                if ('data' in result) {
                    toast.success(`Marriage certificate updated successfully`);
                    onOpenChange?.(false);
                } else if ('error' in result) {
                    toast.error(`Update failed: ${result.error}`);
                }
            } else {
                console.log('Preparing to submit new marriage certificate');
            }

            const preparedData = preparePrismaData(data);
            const processedData = await preparedData;

            console.log('Processed data before submission:', processedData);
            
            // Call the appropriate action based on create or edit mode
            if (isUpdateMode && defaultValues?.id) {
                result = await updateMarriageCertificateForm(defaultValues.id, processedData);
                
                if ('data' in result) {
                    toast.success(`Marriage certificate updated successfully (Book ${result?.data?.bookNumber}, Page ${result?.data?.pageNumber})`);
                    notifyUsersWithPermission(
                        Permission.DOCUMENT_READ,
                        "Marriage Certificate Updated",
                        `Marriage Certificate with the details (Book ${result?.data?.bookNumber}, Page ${result?.data?.pageNumber}, Registry Number ${data.registryNumber}) has been updated.`
                    );
                    
                    router.refresh();
                    onOpenChange?.(false);
                }
            } else {
                result = await submitMarriageCertificateForm(processedData);
                
                if ('data' in result) {
                    toast.success(`Marriage certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`);
                    notifyUsersWithPermission(
                        Permission.DOCUMENT_READ,
                        "New uploaded Marriage Certificate",
                        `New Marriage Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`
                    );
                    
                    router.refresh();
                    onOpenChange?.(false);
                    formMethods.reset(emptyDefaults);
                }
            }
            
            if ('error' in result) {
                console.log('Submission error:', result.error);
                toast.error(result.error.includes('No user found with name') 
                    ? 'Invalid prepared by user. Please check the name.' 
                    : result.error);
            }
        } catch (error) {
            console.error('Error in submitMarriageCertificateForm:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
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

    return { formMethods, onSubmit, handleError, isSubmitting };
}