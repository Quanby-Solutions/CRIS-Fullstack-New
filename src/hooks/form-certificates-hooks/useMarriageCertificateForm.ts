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
    scrollAreaRef?: React.RefObject<HTMLDivElement>;
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
    registryNumber: '2023-12345',
    province: 'Metro Manila',
    cityMunicipality: 'Quezon City',

    pagination: {
        pageNumber: '15',
        bookNumber: '10'
    },

    // Husband Information
    husbandName: {
        first: 'Juan',
        middle: 'Dela',
        last: 'Cruz'
    },
    husbandAge: 30,
    husbandBirth: new Date('1993-05-15'),
    husbandPlaceOfBirth: {
        houseNo: '123',
        street: 'Main Street',
        barangay: 'Barangay 1',
        cityMunicipality: 'Manila',
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
            barangay: 'Barangay 1',
            cityMunicipality: 'Manila',
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
        middle: 'Santos',
        last: 'Reyes'
    },
    wifeAge: 28,
    wifeBirth: new Date('1995-08-20'),
    wifePlaceOfBirth: {
        houseNo: '456',
        street: 'Second Street',
        barangay: 'Barangay 2',
        cityMunicipality: 'Makati',
        province: 'Metro Manila',
        country: 'Philippines'
    },
    wifeSex: 'Female',
    wifeCitizenship: 'Filipino',
    wifeResidence: 'Makati',
    wifeReligion: 'Roman Catholic',
    wifeCivilStatus: 'Single',
    wifeConsentPerson: {
        name: {
            first: 'Juan',
            middle: 'Santos',
            last: 'Reyes'
        },
        relationship: 'Father',
        residence: {
            houseNo: '456',
            street: 'Second Street',
            barangay: 'Barangay 2',
            cityMunicipality: 'Makati',
            province: 'Metro Manila',
            country: 'Philippines'
        }
    },
    wifeParents: {
        fatherName: {
            first: 'Juan',
            middle: 'Santos',
            last: 'Reyes'
        },
        fatherCitizenship: 'Filipino',
        motherName: {
            first: 'Ana',
            middle: 'Santos',
            last: 'Reyes'
        },
        motherCitizenship: 'Filipino'
    },

    // Marriage Details
    placeOfMarriage: {
        houseNo: '789',
        street: 'Third Street',
        barangay: 'Barangay 3',
        cityMunicipality: 'Taguig',
        province: 'Metro Manila',
        country: 'Philippines'
    },
    dateOfMarriage: new Date('2023-10-15'),
    timeOfMarriage: new Date('2023-10-15T14:00:00'),

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
    contractDay: new Date('2023-10-15'),

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
        placeIssued: 'Quezon City',
        licenseNumber: 'LIC-12345',
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
        name: 'Fr. Jose Gomez',
        position: 'Priest',
        registryNoExpiryDate: '2025-12-31'
    },

    // Registered at Civil Registrar
    preparedBy: {
        date: new Date('2023-10-16'),
        nameInPrint: 'Clerk Juan Dela Cruz',
        titleOrPosition: 'Civil Registrar Clerk'
    },
    receivedBy: {
        date: new Date('2023-10-16'),
        nameInPrint: 'Clerk Maria Santos',
        titleOrPosition: 'Civil Registrar Clerk'
    },
    registeredByOffice: {
        date: new Date('2023-10-16'),
        nameInPrint: 'Office of the Civil Registrar',
        titleOrPosition: 'Civil Registrar Office'
    },

    // Optional Sections
    remarks: 'No remarks.',

    // Affidavit of Solemnizing Officer
    affidavitOfSolemnizingOfficer: {
        solemnizingOfficerInformation: {
            officerName: {
                first: 'Jose',
                middle: 'Gomez',
                last: 'Fr.'
            },
            officeName: 'St. Peter Parish',
            address: 'Quezon City, Philippines'
        },
        a: {
            nameOfHusband: {
                first: 'Juan',
                middle: 'Dela',
                last: 'Cruz'
            },
            nameOfWife: {
                first: 'Maria',
                middle: 'Santos',
                last: 'Reyes'
            }
        },
        b: {
            a: true,
            b: true,
            c: true,
            d: true,
            e: true
        },
        c: 'All details are correct.',
        d: {
            dayOf: new Date('2023-10-15'),
            atPlaceExecute: {
                street: 'Third Street',
                barangay: 'Barangay 3',
                cityMunicipality: 'Taguig',
                province: 'Metro Manila',
                country: 'Philippines'
            }
        },
        dateSworn: {
            dayOf: new Date('2023-10-16'),
            atPlaceOfSworn: {
                street: 'Third Street',
                barangay: 'Barangay 3',
                cityMunicipality: 'Taguig',
                province: 'Metro Manila',
                country: 'Philippines'
            },
            ctcInfo: {
                number: 'CTC-12345',
                dateIssued: new Date('2023-10-16'),
                placeIssued: 'Taguig City Hall'
            }
        },
        administeringOfficerInformation: {
            adminName: {
                first: 'Maria',
                middle: 'Santos',
                last: 'Reyes'
            },
            address: 'Taguig City Hall',
            position: 'Civil Registrar'
        }
    },

    // Affidavit for Delayed Registration
    affidavitForDelayed: {
        delayedRegistration: 'No',
        administeringInformation: {
            adminName: 'Maria Santos',
            position: 'Civil Registrar',
            adminAddress: 'Taguig City Hall'
        },
        applicantInformation: {
            nameOfApplicant: 'Juan Dela Cruz',
            postalCode: '1630',
            applicantAddress: {
                st: 'Main Street',
                barangay: 'Barangay 1',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            }
        },
        a: {
            a: {
                agreement: true,
                nameOfPartner: {
                    first: 'Maria',
                    middle: 'Santos',
                    last: 'Reyes'
                },
                placeOfMarriage: 'Taguig City',
                dateOfMarriage: new Date('2023-10-15')
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
                    middle: 'Santos',
                    last: 'Reyes'
                },
                placeOfMarriage: 'Taguig City',
                dateOfMarriage: new Date('2023-10-15')
            }
        },
        b: {
            solemnizedBy: 'Fr. Jose Gomez',
            sector: 'religious-ceremony'
        },
        c: {
            a: {
                licenseNo: 'LIC-12345',
                dateIssued: new Date('2023-09-01'),
                placeOfSolemnizedMarriage: 'Taguig City'
            },
            b: {
                underArticle: 'Article 1'
            }
        },
        d: {
            husbandCitizenship: 'Filipino',
            wifeCitizenship: 'Filipino'
        },
        e: 'No additional information.',
        f: {
            date: new Date('2023-10-16'),
            place: {
                st: 'Main Street',
                barangay: 'Barangay 1',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            }
        },
        dateSworn: {
            dayOf: new Date('2023-10-16'),
            atPlaceOfSworn: {
                st: 'Main Street',
                barangay: 'Barangay 1',
                cityMunicipality: 'Quezon City',
                province: 'Metro Manila',
                country: 'Philippines'
            },
            ctcInfo: {
                number: 'CTC-12345',
                dateIssued: new Date('2023-10-16'),
                placeIssued: 'Taguig City Hall'
            }
        }
    }
};

export function useMarriageCertificateForm({
    onOpenChange,
    defaultValues,
    scrollAreaRef
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
        if (!data.affidavitForDelayed ||
            data.affidavitForDelayed.delayedRegistration === 'No' ||
            data.affidavitForDelayed.delayedRegistration === undefined ||
            data.affidavitForDelayed.delayedRegistration === undefined) {

            data.affidavitForDelayed = {
                delayedRegistration: 'No'
            };
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

    // Enhanced handleError function for useMarriageCertificateForm.ts
    const handleError = (errors: any) => {
        console.error("❌ Form Errors:", errors);

        // Get all error field names to determine which section to scroll to
        const errorFields = Object.keys(errors);

        if (errorFields.length === 0) return;

        // Define the field prefix to card ID mapping for scrolling
        const fieldToCardMap: Record<string, string> = {
            'registry': 'registry-information-card',
            'pagination': 'registry-information-card',

            'husband': 'husband-info-card',
            'husbandName': 'husband-info-card',
            'husbandParents': 'husband-parents-info-card',
            'husbandContractParty': 'contracting-parties-certification-card',
            'husbandWitnesses': 'witnesses-section-card',

            'wife': 'wife-info-card',
            'wifeName': 'wife-info-card',
            'wifeParents': 'wife-parents-info-card',
            'wifeContractParty': 'contracting-parties-certification-card',
            'wifeWitnesses': 'witnesses-section-card',

            'marriageDetails': 'marriage-details-card',
            'placeOfMarriage': 'marriage-details-card',
            'dateOfMarriage': 'marriage-details-card',
            'timeOfMarriage': 'marriage-details-card',

            'contractDay': 'registry-information-card',
            'marriageLicenseDetails': 'marriage-details-card',
            'marriageArticle': 'marriage-details-card',
            'marriageSettlement': 'marriage-details-card',

            'solemnizingOfficer': 'solemnizing-officer-certification-card',

            'preparedBy': 'prepared-by-card',
            'receivedBy': 'received-by-card',
            'registeredByOffice': 'registered-at-office-card',

            'remarks': 'remarks-card',

            'affidavitOfSolemnizingOfficer': 'affidavit-of-solemnizing-officer',
            'affidavitForDelayed': 'affidavit-for-delayed-marriage-registration'
        };

        // Build a hierarchy of priority - which errors to scroll to first
        const errorHierarchy = [
            'registryNumber', 'province', 'cityMunicipality', 'contractDay',
            'husbandName', 'husbandAge', 'husbandBirth', 'husbandPlaceOfBirth',
            'wifeName', 'wifeAge', 'wifeBirth', 'wifePlaceOfBirth',
            'placeOfMarriage', 'dateOfMarriage', 'timeOfMarriage',
            // Add more fields in priority order
        ];

        // Find the first field that has an error according to our hierarchy
        let firstErrorField = errorHierarchy.find(field => errorFields.includes(field));

        // If no match in hierarchy, just take the first error field
        if (!firstErrorField && errorFields.length > 0) {
            firstErrorField = errorFields[0];
        }

        // Determine which card to scroll to
        let cardToScrollTo = undefined;

        if (firstErrorField) {
            // First check for exact matches
            if (fieldToCardMap[firstErrorField]) {
                cardToScrollTo = fieldToCardMap[firstErrorField];
            } else {
                // If no exact match, check for prefixes
                for (const [prefix, cardId] of Object.entries(fieldToCardMap)) {
                    if (firstErrorField.startsWith(prefix)) {
                        cardToScrollTo = cardId;
                        break;
                    }
                }
            }
        }

        // Execute the scrolling after a short delay to ensure the DOM is ready
        setTimeout(() => {
            if (cardToScrollTo) {
                // Try to find the corresponding card element
                const cardElement = document.getElementById(cardToScrollTo) ||
                    document.querySelector(`.${cardToScrollTo}`);

                if (cardElement) {
                    // Find the scrollable container - may be the ScrollArea viewport
                    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]') ||
                        document.querySelector('.ScrollArea') ||
                        document.querySelector('.overflow-auto') ||
                        window;

                    // Different scrolling logic based on the container
                    if (scrollContainer === window) {
                        // Global window scrolling
                        cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (scrollContainer instanceof Element) {
                        // For custom scrollable containers
                        const containerRect = scrollContainer.getBoundingClientRect();
                        const cardRect = cardElement.getBoundingClientRect();

                        // Calculate the scroll position relative to the container
                        const scrollTop = cardRect.top - containerRect.top + scrollContainer.scrollTop - 20;

                        // Scroll the container
                        scrollContainer.scrollTo({
                            top: scrollTop,
                            behavior: 'smooth'
                        });
                    }

                    // Flash the card to highlight it
                    cardElement.classList.add('error-flash');
                    setTimeout(() => {
                        cardElement.classList.remove('error-flash');
                    }, 1000);
                }
            }

            // Build error messages for toast
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
        }, 100);
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