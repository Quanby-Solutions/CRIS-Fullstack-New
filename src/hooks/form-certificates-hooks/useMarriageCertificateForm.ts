import { submitMarriageCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/marriage-certificate-actions';
import { MarriageCertificateFormValues, marriageCertificateSchema } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface UseMarriageCertificateFormProps {
    onOpenChange?: (open: boolean) => void;
}

// Helper function to prepare data for Prisma
const preparePrismaData = (data: any) => {
    // Convert Date objects to ISO strings for JSON fields
    const formatTimeString = (date: Date) => {
        return date instanceof Date ? 
            date.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }) : date;
    };

    // Create a deep copy to avoid mutating the original
    const processedData = {...data};


    return processedData;
};

export function useMarriageCertificateForm({
    onOpenChange,
}: UseMarriageCertificateFormProps = {}) {
    
    const formMethods = useForm<MarriageCertificateFormValues>({
        resolver: zodResolver(marriageCertificateSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            // Registry Information
            registryNumber: '2025-000123',
            province: 'Albay',
            cityMunicipality: 'City of Tabaco',
    
            // Husband Information
            husbandName: {
                first: 'Juan Miguel',
                middle: 'Dela Cruz',
                last: 'Santos'
            },
            husbandAge: 32,
            husbandBirth: new Date('1993-08-15'),
            husbandPlaceOfBirth: {
                houseNo: '142',
                street: 'Rizal Avenue',
                barangay: 'San Isidro',
                cityMunicipality: 'City of Legazpi',
                province: 'Albay',
                country: 'Philippines'
            },
            husbandSex: 'Male',
            husbandCitizenship: 'Filipino',
            husbandResidence: '27 Sampaguita Street, Brgy. San Roque, Tabaco City, Albay',
            husbandReligion: 'Roman Catholic',
            husbandCivilStatus: 'Single',
            husbandConsentPerson: {
                name: {
                    first: 'Roberto',
                    middle: 'Gonzales',
                    last: 'Santos'
                },
                relationship: 'Father',
                residence: '27 Sampaguita Street, Brgy. San Roque, Tabaco City, Albay'
            },
            husbandParents: {
                fatherName: {
                    first: 'Roberto',
                    middle: 'Gonzales',
                    last: 'Santos'
                },
                fatherCitizenship: 'Filipino',
                motherName: {
                    first: 'Carmela',
                    middle: 'Villareal',
                    last: 'Santos'
                },
                motherCitizenship: 'Filipino'
            },
    
            // Wife Information
            wifeName: {
                first: 'Maria Cristina',
                middle: 'Fernandez',
                last: 'Reyes'
            },
            wifeAge: 29,
            wifeBirth: new Date('1996-04-23'),
            wifePlaceOfBirth: {
                houseNo: '78',
                street: 'Mabini Street',
                barangay: 'Rizal',
                cityMunicipality: 'Legazpi City',
                province: 'Albay',
                country: 'Philippines'
            },
            wifeSex: 'Female',
            wifeCitizenship: 'Filipino',
            wifeResidence: '103 Maharlika Highway, Brgy. Binanuahan, Legazpi City, Albay',
            wifeReligion: 'Roman Catholic',
            wifeCivilStatus: 'Single',
            wifeConsentPerson: {
                name: {
                    first: 'Elena',
                    middle: 'Rodriguez',
                    last: 'Fernandez'
                },
                relationship: 'Mother',
                residence: '103 Maharlika Highway, Brgy. Binanuahan, Legazpi City, Albay',
            },
            wifeParents: {
                fatherName: {
                    first: 'Antonio',
                    middle: 'Gomez',
                    last: 'Reyes'
                },
                fatherCitizenship: 'Filipino',
                motherName: {
                    first: 'Elena',
                    middle: 'Rodriguez',
                    last: 'Fernandez'
                },
                motherCitizenship: 'Filipino'
            },
    
            // Marriage Details
            placeOfMarriage: {
                houseNo: '',
                street: 'Ziga Avenue',
                barangay: 'San Roque',
                cityMunicipality: 'City of Tabaco',
                province: 'Albay',
                country: 'Philippines'
            },
            dateOfMarriage: new Date('2025-05-14'),
            timeOfMarriage: new Date(),
    
            // Witnesses
            husbandWitnesses: [
                {
                    name: 'Carlos Manuel Dizon',
                    signature: 'Carlos M. Dizon'
                },
                {
                    name: 'Frederick James Lim',
                    signature: 'Frederick J. Lim'
                }
            ],
            wifeWitnesses: [
                {
                    name: 'Patricia Anne Santos',
                    signature: 'Patricia A. Santos'
                },
                {
                    name: 'Angelica Marie Torres',
                    signature: 'Angelica M. Torres'
                }
            ],
    
            // Contracting Parties
            husbandContractParty: {
                signature: 'Juan Miguel D. Santos',
                agreement: true
            },
            wifeContractParty: {
                signature: 'Maria Cristina F. Reyes',
                agreement: true
            },
    
            // Marriage License Details
            marriageLicenseDetails: {
                
                dateIssued: new Date('2025-04-15'),
                placeIssued: 'Office of the Civil Registrar, Tabaco City, Albay',
                licensenumber: 'ML-2025-0452',
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
                name: 'Rev. Fr. Miguel Antonio Santos',
                position: 'Parish Priest, St. John the Baptist Parish',
                signature: 'Fr. Miguel A. Santos',
                registryNoExpiryDate: '2027-12-31'
            },
    
            // Registered at Civil Registrar
            preparedBy: {
                date: new Date('2025-01-15'),
                nameInPrint: 'Gloria P. Mendoza',
                signature: 'Gloria P. Mendoza',
                titleOrPosition: 'Registration Officer II'
            },
            receivedBy: {
                date: new Date('2025-01-15'),
                nameInPrint: 'Eduardo R. Velasco',
                signature: 'Eduardo R. Velasco',
                titleOrPosition: 'Administrative Assistant III'
            },
            registeredByOffice: {
                date: new Date('2025-01-16'),
                nameInPrint: 'Maria Corazon G. Bautista',
                signature: 'Maria Corazon G. Bautista',
                titleOrPosition: 'City Civil Registrar'
            },
    
            // Optional Sections
            remarks: 'Marriage ceremony conducted in accordance with Catholic rites. Reception held at Tabaco City Convention Center.',
            pagination: {
                pageNumber: '42',
                bookNumber: '7'
            },
            
            // Back page data - Affidavit of Solemnizing Officer
            affidavitOfSolemnizingOfficer: {
                administeringInformation: {
                    nameOfOfficer: 'Atty. Leonardo V. Reyes',
                    signatureOfOfficer: 'Atty. Leonardo V. Reyes',
                    position: 'Notary Public',
                    addressOfOffice: {
                        st: 'Rizal Avenue',
                        barangay: 'Centro',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    },
                },
                nameOfPlace: 'City of Tabaco',
                addressAt: 'St. John the Baptist Parish Church, Ziga Avenue, Tabaco City',
                a: {
                    nameOfHusband: {
                        first: 'Juan Miguel',
                        middle: 'Dela Cruz',
                        last: 'Santos'
                    },
                    nameOfWife: {
                        first: 'Maria Cristina',
                        middle: 'Fernandez',
                        last: 'Reyes'
                    },
                },
                b: {
                    a: true,
                    b: false,
                    c: false,
                    d: false,
                    e: false,
                },
                c: 'The marriage was solemnized in accordance with the Family Code of the Philippines and the Catholic rites.',
                d: {
                    dayOf: new Date('2025-05-14'),
                    atPlaceOfMarriage: {
                        st: 'Ziga Avenue',
                        barangay: 'San Roque',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    },
                },
                dateSworn: {
                    dayOf: new Date('2025-05-15'),
                    atPlaceOfSworn: {
                        st: 'Rizal Avenue',
                        barangay: 'Centro',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    },
                    ctcInfo: {
                        number: 'CTC-55987123',
                        dateIssued: new Date('2025-01-15'),
                        placeIssued: 'Tabaco City Treasurer\'s Office',
                    },
                },
                nameOfAdmin: {
                    address: 'Office of the City Civil Registrar, Tabaco City Hall, Tabaco City',
                    signature: {
                        signature: 'Fr. Miguel A. Santos',
                        position: 'Parish Priest',
                        name2: 'Rev. Fr. Miguel Antonio Santos',
                    }
                }
            },
    
            // Affidavit for Delayed Registration
            affidavitForDelayed: {
                administeringInformation: {
                    signatureOfAdmin: 'Atty. Roberto C. Magno',
                    nameOfOfficer: 'Atty. Roberto Carlos Magno',
                    position: 'Notary Public',
                    addressOfOfficer: {
                        st: 'Magallanes Street',
                        barangay: 'Centro',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    }
                },
                applicantInformation: {
                    signatureOfApplicant: 'Juan Miguel D. Santos',
                    nameOfApplicant: 'Juan Miguel Dela Cruz Santos',
                    postalCode: '4511',
                    applicantAddress: {
                        st: 'Sampaguita Street',
                        barangay: 'San Roque',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    }
                },
                a: {
                    a: {
                        agreement: true,
                        nameOfPartner: {
                            first: 'Maria Cristina',
                            middle: 'Fernandez',
                            last: 'Reyes'
                        },
                        placeOfMarriage: 'St. John the Baptist Parish Church, Tabaco City',
                        dateOfMarriage: new Date('2025-05-14'),
                    },
                    b: {
                        agreement: false,
                        nameOfHusband: {
                            first: 'Juan Miguel',
                            middle: 'Dela Cruz',
                            last: 'Santos'
                        },
                        nameOfWife: {
                            first: 'Maria Cristina',
                            middle: 'Fernandez',
                            last: 'Reyes'
                        },
                        placeOfMarriage: 'St. John the Baptist Parish Church, Tabaco City',
                        dateOfMarriage: new Date('2025-05-14'),
                    }
                },
                b: {
                    solemnizedBy: 'Rev. Fr. Miguel Antonio Santos',
                    sector: 'religious-ceremony',
                },
                c: {
                    a: {
                        licenseNo: 'ML-2025-0452',
                        dateIssued: new Date('2025-04-15'),
                        placeOfSolemnizedMarriage: 'St. John the Baptist Parish Church, Tabaco City',
                    },
                    b: { 
                        underArticle: 'Article 1 of the Family Code of the Philippines' 
                    },
                },
                d: {
                    husbandCitizenship: 'Filipino',
                    wifeCitizenship: 'Filipino',
                },
                e: 'The delay in registration was due to an administrative oversight. The solemnizing officer failed to submit the marriage certificate to the Local Civil Registrar within the prescribed period due to illness.',
                f: {
                    date: new Date('2025-07-15'),
                    place: {
                        st: 'Rizal Avenue',
                        barangay: 'Centro',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    }
                },
                dateSworn: {
                    dayOf: new Date('2025-07-16'),
                    atPlaceOfSworn: {
                        st: 'Magallanes Street',
                        barangay: 'Centro',
                        cityMunicipality: 'City of Tabaco',
                        province: 'Albay',
                        country: 'Philippines'
                    },
                    ctcInfo: {
                        number: 'CTC-55987124',
                        dateIssued: new Date('2025-01-16'),
                        placeIssued: 'Tabaco City Treasurer\'s Office',
                    }
                }
            }
        }
    });

    // Updated submission function with proper data preparation
    const onSubmit = async (data: MarriageCertificateFormValues) => {
        try {
            console.log('Raw form data:', data);
            
            // First prepare the data structure
            const preparedData = preparePrismaData(data);
            
            // Process file uploads and convert to base64
            const processedData = await handleFileUploads(preparedData);
            
            console.log('Processed data before submission:', processedData);
            
            // Submit the processed data
            const result = await submitMarriageCertificateForm(processedData);

            if ('data' in result) {
                toast.success(
                    `Marriage certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
                );
                onOpenChange?.(false);
                formMethods.reset();
            } else if ('error' in result) {
                const errorMessage = result.error.includes('No user found with name')
                    ? 'Invalid prepared by user. Please check the name.'
                    : result.error;
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('An unexpected error occurred while submitting the form');
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
    const handleFileUploads = async (data: any) => {
        // Create a deep copy to avoid mutating the original
        const processedData = {...data};
        
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