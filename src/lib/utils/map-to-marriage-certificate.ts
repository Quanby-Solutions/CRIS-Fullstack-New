import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { MarriageCertificateFormValues } from '../types/zod-form-certificate/marriage-certificate-form-schema';


// Define a type for the Marriage certificate form structure based on your Prisma model
interface MarriageCertificateFormData {
    id?: string;
    baseFormId?: string;
    husbandFirstName?: string;
    husbandMiddleName?: string;
    husbandLastName?: string;
    husbandDateOfBirth?: Date;
    husbandAge?: number;
    husbandPlaceOfBirth?: any; // Use a more specific type instead of `any` if possible
    husbandSex?: string;
    husbandCitizenship?: string;
    husbandResidence?: string;
    husbandReligion?: string;
    husbandCivilStatus?: string;
    husbandFatherName?: any;
    husbandFatherCitizenship?: string;
    husbandMotherMaidenName?: any;
    husbandMotherCitizenship?: string;
    husbandConsentPerson?: any;

    wifeFirstName?: string;
    wifeMiddleName?: string;
    wifeLastName?: string;
    wifeDateOfBirth?: Date;
    wifeAge?: number;
    wifePlaceOfBirth?: any;
    wifeSex?: string;
    wifeCitizenship?: string;
    wifeResidence?: string;
    wifeReligion?: string;
    wifeCivilStatus?: string;
    wifeFatherName?: any;
    wifeFatherCitizenship?: string;
    wifeMotherMaidenName?: any;
    wifeMotherCitizenship?: string;
    wifeConsentPerson?: any;
    remarks?: string;

    placeOfMarriage?: any;
    dateOfMarriage?: Date;
    timeOfMarriage?: Date;
    contractDay?: Date;

    marriageSettlement?: boolean;
    contractingPartiesSignature?: any[];
    marriageLicenseDetails?: any;
    marriageArticle?: any;
    executiveOrderApplied?: boolean;
    solemnizingOfficer?: any;
    witnesses?: any[];
    registeredByOffice?: any;
    affidavitOfSolemnizingOfficer?: any;
    affidavitOfdelayedRegistration?: any;
    baseForm?: any;
}

// Helper function to map BaseRegistryFormWithRelations to MarriageCertificateFormValues
export const mapToMarriageCertificateValues = (
    form: BaseRegistryFormWithRelations
): Partial<MarriageCertificateFormValues> => {
    // Extract the Marriage certificate form data with proper typing
    const marriageForm =
        (form.marriageCertificateForm as MarriageCertificateFormData) || {};

    // Helper for parsing dates safely
    const parseDateSafely = (
        dateValue: Date | string | null | undefined
    ): Date | undefined => {
        if (!dateValue) return undefined;
        try {
            return new Date(dateValue);
        } catch (error) {
            console.error('Error parsing date:', error);
            return undefined;
        }
    };

    // Helper to ensure non-null string values
    const ensureString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value);
    };

    // Helper to validate civil status values
    // Helper to validate civil status values
    const validateCivilStatus = (
        status: any
    ):
        | 'Single'
        | 'Married'
        | 'Widow'
        | 'Widower'
        | 'Annulled'
        | 'Divorced'
        | undefined => {
        const validStatuses = [
            'Single',
            'Married',
            'Widow',
            'Widower',
            'Annulled',
            'Divorced'
        ];

        if (validStatuses.includes(status)) {
            return status as
                | 'Single'
                | 'Married'
                | 'Widow'
                | 'Widower'
                | 'Annulled'
                | 'Divorced';
        }

        return undefined;
    };

    const validateSex = (sex: any): 'Male' | 'Female' | undefined => {
        const validSexes = ['Male', 'Female'];

        if (validSexes.includes(sex)) {
            return sex as 'Male' | 'Female';
        }

        return undefined;
    }

    const validateSector = (sector: any):
        | 'religious-ceremony'
        | 'civil-ceremony'
        | 'Muslim-rites'
        | 'tribal-rites' | undefined => {
        const validSectors = [
            'religious-ceremony',
            'civil-ceremony',
            'Muslim-rites',
            'tribal-rites',
        ];

        if (validSectors.includes(sector)) {
            return sector as
                | 'religious-ceremony'
                | 'civil-ceremony'
                | 'Muslim-rites'
                | 'tribal-rites';
        }

        return undefined;
    }

    // Map basic registry information
    const registryInfo = {
        registryNumber: ensureString(form.registryNumber),
        province: ensureString(form.province),
        cityMunicipality: ensureString(form.cityMunicipality),
        pagination: {
            pageNumber: ensureString(form.pageNumber),
            bookNumber: ensureString(form.bookNumber),
        },
        remarks: ensureString(form.remarks),
    };

    // Map husband information
    const husbandInfo = {
        husbandFirstName: ensureString(marriageForm.husbandFirstName),
        husbandMiddleName: ensureString(marriageForm.husbandMiddleName),
        husbandLastName: ensureString(marriageForm.husbandLastName),
        husbandDateOfBirth: parseDateSafely(marriageForm.husbandDateOfBirth),
        husbandAge: marriageForm.husbandAge,
        husbandPlaceOfBirth: {
            houseNo: ensureString(marriageForm.husbandPlaceOfBirth?.houseNo),
            street: ensureString(marriageForm.husbandPlaceOfBirth?.street),
            barangay: ensureString(marriageForm.husbandPlaceOfBirth?.barangay),
            cityMunicipality: ensureString(marriageForm.husbandPlaceOfBirth?.cityMunicipality),
            province: ensureString(marriageForm.husbandPlaceOfBirth?.province),
            country: ensureString(marriageForm.husbandPlaceOfBirth?.country),
        },
        husbandSex: validateSex(marriageForm.husbandSex),
        husbandCitizenship: ensureString(marriageForm.husbandCitizenship),
        husbandResidence: ensureString(marriageForm.husbandResidence),
        husbandReligion: ensureString(marriageForm.husbandReligion),
        husbandCivilStatus: validateCivilStatus(marriageForm.husbandCivilStatus),
    };

    // Map husband parents information
    const husbandParentsInfo = {
        husbandFatherName: marriageForm.husbandFatherName || {
            first: ensureString(marriageForm.husbandFatherName?.first),
            middle: ensureString(marriageForm.husbandFatherName?.middle),
            last: ensureString(marriageForm.husbandFatherName?.last),
        },
        husbandFatherCitizenship: ensureString(marriageForm.husbandFatherCitizenship),
        husbandMotherMaidenName: marriageForm.husbandMotherMaidenName || {
            first: ensureString(marriageForm.husbandMotherMaidenName?.first),
            middle: ensureString(marriageForm.husbandMotherMaidenName?.middle),
            last: ensureString(marriageForm.husbandMotherMaidenName?.last),
        },
        husbandMotherCitizenship: ensureString(marriageForm.husbandMotherCitizenship),
    };

    // Map husband consent person information
    const husbandConsentPerson = {
        husbandConsentPerson: marriageForm.husbandConsentPerson || {
            name: {
                first: ensureString(marriageForm.husbandConsentPerson?.name?.first),
                middle: ensureString(marriageForm.husbandConsentPerson?.name?.middle),
                last: ensureString(marriageForm.husbandConsentPerson?.name?.last),
            },
            relationship: ensureString(marriageForm.husbandConsentPerson?.relationship),
            residence: {
                houseNo: ensureString(marriageForm.husbandConsentPerson?.residence?.houseNo),
                street: ensureString(marriageForm.husbandConsentPerson?.residence?.street),
                barangay: ensureString(marriageForm.husbandConsentPerson?.residence?.barangay),
                cityMunicipality: ensureString(marriageForm.husbandConsentPerson?.residence?.cityMunicipality),
                province: ensureString(marriageForm.husbandConsentPerson?.residence?.province),
                country: ensureString(marriageForm.husbandConsentPerson?.residence?.country),
            },
        },
    };

    // Map wife information
    const wifeInfo = {
        wifeFirstName: ensureString(marriageForm.wifeFirstName),
        wifeMiddleName: ensureString(marriageForm.wifeMiddleName),
        wifeLastName: ensureString(marriageForm.wifeLastName),
        wifeDateOfBirth: parseDateSafely(marriageForm.wifeDateOfBirth),
        wifeAge: marriageForm.wifeAge,
        wifePlaceOfBirth: marriageForm.wifePlaceOfBirth || {
            houseNo: ensureString(marriageForm.wifePlaceOfBirth?.houseNo),
            street: ensureString(marriageForm.wifePlaceOfBirth?.street),
            barangay: ensureString(marriageForm.wifePlaceOfBirth?.barangay),
            cityMunicipality: ensureString(marriageForm.wifePlaceOfBirth?.cityMunicipality),
            province: ensureString(marriageForm.wifePlaceOfBirth?.province),
            country: ensureString(marriageForm.wifePlaceOfBirth?.country),
        },
        wifeSex: validateSex(marriageForm.wifeSex),
        wifeCitizenship: ensureString(marriageForm.wifeCitizenship),
        wifeResidence: ensureString(marriageForm.wifeResidence),
        wifeReligion: ensureString(marriageForm.wifeReligion),
        wifeCivilStatus: validateCivilStatus(marriageForm.wifeCivilStatus),
    };

    // Map wife parents information
    const wifeParentsInfo = {
        wifeFatherName: marriageForm.wifeFatherName || {
            first: ensureString(marriageForm.wifeFatherName?.first),
            middle: ensureString(marriageForm.wifeFatherName?.middle),
            last: ensureString(marriageForm.wifeFatherName?.last),
        },
        wifeFatherCitizenship: ensureString(marriageForm.wifeFatherCitizenship),
        wifeMotherMaidenName: marriageForm.wifeMotherMaidenName || {
            first: ensureString(marriageForm.wifeMotherMaidenName?.first),
            middle: ensureString(marriageForm.wifeMotherMaidenName?.middle),
            last: ensureString(marriageForm.wifeMotherMaidenName?.last),
        },
        wifeMotherCitizenship: ensureString(marriageForm.wifeMotherCitizenship),
    };

    // Map wife consent person information
    const wifeConsentPerson = {
        wifeConsentPerson: marriageForm.wifeConsentPerson || {
            name: {
                first: ensureString(marriageForm.wifeConsentPerson?.name?.first),
                middle: ensureString(marriageForm.wifeConsentPerson?.name?.middle),
                last: ensureString(marriageForm.wifeConsentPerson?.name?.last),
            },
            relationship: ensureString(marriageForm.wifeConsentPerson?.relationship),
            residence: {
                houseNo: ensureString(marriageForm.wifeConsentPerson?.residence?.houseNo),
                street: ensureString(marriageForm.wifeConsentPerson?.residence?.street),
                barangay: ensureString(marriageForm.wifeConsentPerson?.residence?.barangay),
                cityMunicipality: ensureString(marriageForm.wifeConsentPerson?.residence?.cityMunicipality),
                province: ensureString(marriageForm.wifeConsentPerson?.residence?.province),
                country: ensureString(marriageForm.wifeConsentPerson?.residence?.country),
            },
        },
    };

    // Map marriage details
    const marriageDetails = {
        placeOfMarriage: marriageForm.placeOfMarriage || {
            houseNo: ensureString(marriageForm.placeOfMarriage?.houseNo),
            street: ensureString(marriageForm.placeOfMarriage?.street),
            barangay: ensureString(marriageForm.placeOfMarriage?.barangay),
            cityMunicipality: ensureString(marriageForm.placeOfMarriage?.cityMunicipality),
            province: ensureString(marriageForm.placeOfMarriage?.province),
            country: ensureString(marriageForm.placeOfMarriage?.country),
        },
        dateOfMarriage: parseDateSafely(marriageForm.dateOfMarriage),
        timeOfMarriage: parseDateSafely(marriageForm.timeOfMarriage),
        contractDay: parseDateSafely(marriageForm.contractDay),
    };

    // Map marriage license details
    const marriageLicenseDetails = {
        dateIssued: parseDateSafely(marriageForm.marriageLicenseDetails?.dateIssued),
        placeIssued: ensureString(marriageForm.marriageLicenseDetails?.placeIssued),
        licenseNumber: ensureString(marriageForm.marriageLicenseDetails?.licenseNumber),
        marriageAgreement: marriageForm.marriageLicenseDetails?.marriageAgreement || false,
    };

    // Map marriage article
    const marriageArticle = {
        article: ensureString(marriageForm.marriageArticle?.article),
        marriageArticle: marriageForm.marriageArticle?.marriageArticle || false,
    };

    // Map solemnizing officer information
    const solemnizingOfficer = {
        name: ensureString(marriageForm.solemnizingOfficer?.name),
        position: ensureString(marriageForm.solemnizingOfficer?.position),
        signature: ensureString(marriageForm.solemnizingOfficer?.signature),
        registryNoExpiryDate: ensureString(marriageForm.solemnizingOfficer?.registryNoExpiryDate),
    };

    // Map witnesses
    const witnesses = marriageForm.witnesses?.map((witness: any) => ({
        name: ensureString(witness.name),
        signature: ensureString(witness.signature),
    })) || [];

    // Map registered by office information
    const registeredByOffice = marriageForm.registeredByOffice || {
        date: parseDateSafely(marriageForm.registeredByOffice?.date),
        nameInPrint: ensureString(marriageForm.registeredByOffice?.nameInPrint),
        signature: ensureString(marriageForm.registeredByOffice?.signature),
        titleOrPosition: ensureString(marriageForm.registeredByOffice?.titleOrPosition),
    };

    // Map affidavit of solemnizing officer
    const affidavitOfSolemnizingOfficer = marriageForm.affidavitOfSolemnizingOfficer || {
        administeringInformation: {
            nameOfOfficer: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.nameOfOfficer),
            signatureOfOfficer: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.signatureOfOfficer),
            position: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.position),
            addressOfOffice: {
                st: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.addressOfOffice?.st),
                barangay: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.addressOfOffice?.barangay),
                cityMunicipality: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.addressOfOffice?.cityMunicipality),
                province: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.addressOfOffice?.province),
                country: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.administeringInformation?.addressOfOffice?.country),
            },
        },
        nameOfPlace: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.nameOfPlace),
        addressAt: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.addressAt),
        a: {
            nameOfHusband: {
                first: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfHusband?.first),
                middle: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfHusband?.middle),
                last: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfHusband?.last),
            },
            nameOfWife: {
                first: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfWife?.first),
                middle: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfWife?.middle),
                last: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.a?.nameOfWife?.last),
            },
        },
        b: {
            a: marriageForm.affidavitOfSolemnizingOfficer?.b?.a || false,
            b: marriageForm.affidavitOfSolemnizingOfficer?.b?.b || false,
            c: marriageForm.affidavitOfSolemnizingOfficer?.b?.c || false,
            d: marriageForm.affidavitOfSolemnizingOfficer?.b?.d || false,
            e: marriageForm.affidavitOfSolemnizingOfficer?.b?.e || false,
        },
        c: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.c),
        d: {
            dayOf: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.d?.dayOf),
            atPlaceOfMarriage: {
                st: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceOfMarriage?.st),
                barangay: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceOfMarriage?.barangay),
                cityMunicipality: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceOfMarriage?.cityMunicipality),
                province: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceOfMarriage?.province),
                country: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.d?.atPlaceOfMarriage?.country),
            },
        },
        dateSworn: {
            dayOf: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.dayOf),
            atPlaceOfSworn: {
                st: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn?.st),
                barangay: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn?.barangay),
                cityMunicipality: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn?.cityMunicipality),
                province: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn?.province),
                country: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.atPlaceOfSworn?.country),
            },
            ctcInfo: {
                number: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.number),
                dateIssued: parseDateSafely(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.dateIssued),
                placeIssued: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.ctcInfo?.placeIssued),
            },
            nameOfAdmin:  {
                address: undefined,
                signature: {
                    signature: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.nameOfAdmin?.signature?.signature),
                    position: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.nameOfAdmin?.signature?.position),
                    name2: ensureString(marriageForm.affidavitOfSolemnizingOfficer?.dateSworn?.nameOfAdmin?.signature?.name2),
                }
            }
        },
    };

    const affidavitOfdelayedRegistration = {
        affidavitOfdelayedRegistration: marriageForm.affidavitOfdelayedRegistration || {
            applicantInformation: {
                signatureOfApplicant: '',
                nameOfApplicant: '',
                postalCode: '',
                applicantAddress: marriageForm.affidavitOfdelayedRegistration?.applicantInformation?.applicantAddress || {
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
                    dateOfMarriage: parseDateSafely(marriageForm.affidavitOfdelayedRegistration?.a?.b?.dateOfMarriage) || undefined,
                }
            },
            b: {
                solemnizedBy: '',
                sector: validateSector(marriageForm.affidavitOfdelayedRegistration?.b?.sector) || '',
            },
            c: {
                a: {
                    licenseNo: '',
                    dateIssued: parseDateSafely(marriageForm.affidavitOfdelayedRegistration?.c?.a?.dateIssued) || undefined,
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
                date: parseDateSafely(marriageForm.affidavitOfdelayedRegistration?.f?.date) || undefined,
                place: {
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: ''
                }
            },
            dateSworn: {
                dayOf: parseDateSafely(marriageForm.affidavitOfdelayedRegistration?.dateSworn?.dayOf) || undefined,
                atPlaceOfSworn: {
                    st: '',
                    barangay: '',
                    cityMunicipality: '',
                    province: '',
                    country: ''
                },
                ctcInfo: {
                    number: '',
                    dateIssued: parseDateSafely(marriageForm.affidavitOfdelayedRegistration?.dateSworn?.ctcInfo?.dateIssued) || undefined,
                    placeIssued: '',
                }
            }
        },
    }


    // Return the mapped marriage certificate values
    return {
        ...registryInfo,
        ...husbandInfo,
        ...husbandParentsInfo,
        ...husbandConsentPerson,
        ...wifeInfo,
        ...wifeParentsInfo,
        ...wifeConsentPerson,
        ...marriageDetails,
        ...marriageLicenseDetails,
        ...marriageArticle,
        ...solemnizingOfficer,
        ...witnesses,
        ...registeredByOffice,
        ...affidavitOfSolemnizingOfficer,
        ...affidavitOfdelayedRegistration,
    };
};