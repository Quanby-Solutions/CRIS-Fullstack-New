import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';

// Define a type for the death certificate form structure based on your Prisma model
interface DeathCertificateFormData {
  id?: string;
  baseFormId?: string;
  deceasedName?: any;
  sex?: any;
  dateOfDeath?: Date | string | null;
  timeOfDeath?: Date | string | null;
  dateOfBirth?: Date | string | null;
  ageAtDeath?: any;
  placeOfDeath?: any;
  civilStatus?: string;
  religion?: string;
  citizenship?: string;
  residence?: any;
  occupation?: string;
  parentInfo?: any;
  birthInformation?: any;
  medicalCertificate?: any;
  causesOfDeath19a?: any;
  causesOfDeath19b?: any;
  certificationOfDeath?: any;
  reviewedBy?: any;
  postmortemCertificate?: any;
  embalmerCertification?: any;
  delayedRegistration?: any;
  corpseDisposal?: string;
  burialPermit?: any;
  transferPermit?: any;
  cemeteryOrCrematory?: any;
  informant?: any;
  remarks?: string;
}

// Helper function to map BaseRegistryFormWithRelations to DeathCertificateFormValues
export const mapToDeathCertificateValues = (
  form: BaseRegistryFormWithRelations
): Partial<DeathCertificateFormValues> => {
  // Extract the Death certificate form data with proper typing
  const deathForm =
    (form.deathCertificateForm as DeathCertificateFormData) || {};

  // Helper for parsing dates safely
  // Helper for parsing dates safely as strings to match the Zod schema
  const parseDate = (
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

  const parseDateSafely = (
    dateValue: Date | string | null | undefined
  ): string | undefined => {
    if (dateValue === null || dateValue === undefined) return undefined;

    // If it's already a Date object, verify it's valid and format it as string
    if (dateValue instanceof Date) {
      return !isNaN(dateValue.getTime())
        ? dateValue.toISOString() // Return full ISO string for consistency
        : undefined;
    }

    // If it's a string already
    if (typeof dateValue === 'string') {
      // First check if it's already a valid ISO date string
      if (dateValue.includes('T') && (dateValue.includes('Z') || dateValue.includes('+') || dateValue.includes('-'))) {
        return dateValue; // Keep valid ISO strings as-is
      }

      try {
        const parsedDate = new Date(dateValue);
        // If it parses as a valid date, standardize the format
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString(); // Return full ISO string
        } else {
          // Return original string for values like "Unknown", "1950s", etc.
          return dateValue;
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        return dateValue; // Return original string on error
      }
    }

    // For any other data type, convert to string
    return String(dateValue);
  };

  /**
 * Converts a value from a JSON field to either a Date object or a string
 * @param value Any value from JSON, potentially a date string or descriptive text
 * @returns Date object if the value is a valid date string, otherwise the original string
 */
  const parseJsonDate = (value: any): Date | string | undefined => {
    if (value === null || value === undefined) return undefined;

    // If it's already a Date object, return it
    if (value instanceof Date) {
      return value;
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Trim the string to remove any leading/trailing whitespace
      const trimmedValue = value.trim();

      // Check for ISO date/timestamp format with time
      const isIsoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmedValue);

      // Check for more verbose date formats like "January 24, 2025"
      const isVerboseDate = /^[A-Za-z]+ \d{1,2}, \d{4}$/.test(trimmedValue);

      // If it's an ISO datetime, convert to Date
      if (isIsoDateTime) {
        try {
          const date = new Date(trimmedValue);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch {
          // If parsing fails, continue
        }
      }

      // If it's a verbose date format or doesn't look like a machine date, return as string
      if (isVerboseDate || !isIsoDateTime) {
        return trimmedValue;
      }
    }

    // For other types, try to create a date or convert to string
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch { }

    // Fallback to string conversion
    return String(value);
  };

  const parseJsonDateDeath = (value: any): Date | string | undefined => {
    // 1) if it’s the wrapper-object with an empty date, drop it
    if (value != null && typeof value === "object") {
      const { dateOfDeath, dateOfBirth } = value as any;
      if (("dateOfDeath" in value && !dateOfDeath) ||
        ("dateOfBirth" in value && !dateOfBirth)) {
        return undefined;
      }
      // extract the real payload
      value = dateOfDeath || dateOfBirth;
    }

    // 2) now exactly the same logic as your ISO/string/date parsing
    if (value == null) return undefined;
    if (value instanceof Date) return value;

    if (typeof value === "string") {
      const trimmed = value.trim();
      const isoRx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      const verbRx = /^[A-Za-z]+ \d{1,2}, \d{4}$/;

      if (isoRx.test(trimmed)) {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d;
      }
      if (verbRx.test(trimmed)) {
        return trimmed;
      }
    }

    // 3) catch-all attempt
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    } catch { }

    // 4) fallback: undefined (not String(value))
    return undefined;
  };



  // Helper to ensure non-null string values
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Helper to create name object
  const createNameObject = (nameObj: any) => {
    if (!nameObj) return { first: '', middle: '', last: '' };
    return {
      first: ensureString(nameObj.first),
      middle: ensureString(nameObj.middle),
      last: ensureString(nameObj.last)
    };
  };

  // Helper to create address object
  const createAddressObject = (addressObj?: any) => {
    if (!addressObj || typeof addressObj !== 'object') {
      return {
        locationType: '',
        province: '',
        barangay: '',
        cityMunicipality: '',
        houseNo: '',
        st: '',
        hospitalInstitution: '',
        internationalAddress: '',
      };
    }

    const ensureString = (value: any) => (typeof value === 'string' ? value : value?.toString() ?? '');

    return {
      locationType: ensureString(addressObj.locationType?.value ?? addressObj.locationType ?? 'Hospital'),
      province: addressObj.province
        ? ensureString(addressObj.province?.value ?? addressObj.province)
        : undefined,
      barangay: addressObj.barangay
        ? ensureString(addressObj.barangay?.value ?? addressObj.barangay)
        : undefined,
      cityMunicipality: addressObj.cityMunicipality
        ? ensureString(addressObj.cityMunicipality?.value ?? addressObj.cityMunicipality)
        : undefined,
      houseNo: addressObj.houseNo
        ? ensureString(addressObj.houseNo?.value ?? addressObj.houseNo)
        : undefined,
      st: addressObj.st
        ? ensureString(addressObj.st?.value ?? addressObj.st)
        : undefined,
      hospitalInstitution: addressObj.hospitalInstitution
        ? ensureString(addressObj.hospitalInstitution?.value ?? addressObj.hospitalInstitution)
        : undefined,
      internationalAddress: addressObj.internationalAddress
        ? ensureString(addressObj.internationalAddress?.value ?? addressObj.internationalAddress)
        : undefined
    };
  };
  // Validate sex
  const validateSex = (sex: any): 'Male' | 'Female' | undefined => {
    return sex === 'Male' || sex === 'Female' ? sex : undefined;
  };

  const validateCorpseDisposal = (corpseDisposal: any): string | undefined => {
    const validMethods = [
      'Burial',
      'Cremation',
      'Embalming',
    ];

    // Accept standard methods plus any custom text entry (non-empty string)
    if (validMethods.includes(corpseDisposal) || (typeof corpseDisposal === 'string' && corpseDisposal.trim() !== '')) {
      return corpseDisposal;
    }

    return undefined;
  };


  // Validate attendant type
  const validateAttendantType = (
    type: any
  ): 'Others' | 'Private physician' | 'Public health officer' | 'Hospital authority' | 'None' | undefined => {
    const validTypes = [
      'Others',
      'Private physician',
      'Public health officer',
      'Hospital authority',
      'None',
    ];
    return validTypes.includes(type) ? type : undefined;
  };

  // Validate civil status
  // Validate civil status
  const validateCivilStatus = (
    status: any
  ):
    | 'Single'
    | 'Married'
    | 'Widow'
    | 'Widower'
    | 'Divorced'
    | undefined => {
    const validStatuses = [
      'Single',
      'Married',
      'Widow',
      'Widower',
      'Divorced',
    ];
    if (status && validStatuses.includes(status)) {
      return status as
        | 'Single'
        | 'Married'
        | 'Widow'
        | 'Widower'
        | 'Divorced';
    }
    return undefined;
  };
  // Create a properly structured result object that matches the expected schema
  const result: Partial<DeathCertificateFormValues> = {
    // Registry Information
    id: ensureString(form.id) || '',
    registryNumber: ensureString(form.registryNumber),
    province: ensureString(form.province),
    cityMunicipality: ensureString(form.cityMunicipality),
    pagination: {
      pageNumber: ensureString(form.pageNumber),
      bookNumber: ensureString(form.bookNumber),
    },
    remarks: ensureString(form.remarks),

    // Deceased Information
    name: createNameObject(deathForm.deceasedName),
    sex: validateSex(deathForm.sex) || 'Male', // Default to Male if undefined
    dateOfDeath: parseJsonDateDeath(deathForm.dateOfDeath),
    dateOfBirth: parseJsonDateDeath(deathForm.dateOfBirth),
    timeOfDeath: parseDateSafely(deathForm.timeOfDeath),
    ageAtDeath: deathForm.ageAtDeath || {
      years: '',
      months: '',
      days: '',
      hours: '',
      minutes: '',
    },
    placeOfDeath: createAddressObject(deathForm?.placeOfDeath),
    civilStatus: validateCivilStatus(deathForm.civilStatus) || 'Single',
    religion: ensureString(deathForm.religion),
    citizenship: ensureString(deathForm.citizenship),
    residence: createAddressObject(deathForm.residence),
    occupation: ensureString(deathForm.occupation),

    // Parent Information
    parents: {
      fatherName: createNameObject(deathForm.parentInfo?.fatherName),
      motherName: createNameObject(deathForm.parentInfo?.motherName),
    },

    // Birth Information
    birthInformation: {
      ageOfMother: ensureString(deathForm.birthInformation?.ageOfMother),
      methodOfDelivery: ensureString(deathForm.birthInformation?.methodOfDelivery) || 'Normal spontaneous vertex',
      lengthOfPregnancy: deathForm.birthInformation?.lengthOfPregnancy,
      typeOfBirth: deathForm.birthInformation?.typeOfBirth || 'Single',
      birthOrder: deathForm.birthInformation?.birthOrder,
    },

    // Causes of Death
    causesOfDeath19a: {
      mainDiseaseOfInfant: ensureString(deathForm.causesOfDeath19a?.mainDiseaseOfInfant),
      otherDiseasesOfInfant: ensureString(deathForm.causesOfDeath19a?.otherDiseasesOfInfant),
      mainMaternalDisease: ensureString(deathForm.causesOfDeath19a?.mainMaternalDisease),
      otherMaternalDisease: ensureString(deathForm.causesOfDeath19a?.otherMaternalDisease),
      otherRelevantCircumstances: ensureString(deathForm.causesOfDeath19a?.otherRelevantCircumstances),
    },
    causesOfDeath19b: {
      immediate: {
        cause: ensureString(deathForm.causesOfDeath19b?.immediate?.cause),
        interval: ensureString(deathForm.causesOfDeath19b?.immediate?.interval),
      },
      antecedent: {
        cause: ensureString(deathForm.causesOfDeath19b?.antecedent?.cause),
        interval: ensureString(deathForm.causesOfDeath19b?.antecedent?.interval),
      },
      underlying: {
        cause: ensureString(deathForm.causesOfDeath19b?.underlying?.cause),
        interval: ensureString(deathForm.causesOfDeath19b?.underlying?.interval),
      },
      otherSignificantConditions: ensureString(deathForm.causesOfDeath19b?.otherSignificantConditions),
    },

    // Medical Certificate
    medicalCertificate: {
      autopsy: Boolean(deathForm.medicalCertificate?.autopsy),
      causesOfDeath: {
        immediate: {
          cause: ensureString(deathForm.medicalCertificate?.causesOfDeath?.immediate?.cause),
          interval: ensureString(deathForm.medicalCertificate?.causesOfDeath?.immediate?.interval),
        },
        antecedent: {
          cause: ensureString(deathForm.medicalCertificate?.causesOfDeath?.antecedent?.cause),
          interval: ensureString(deathForm.medicalCertificate?.causesOfDeath?.antecedent?.interval),
        },
        underlying: {
          cause: ensureString(deathForm.medicalCertificate?.causesOfDeath?.underlying?.cause),
          interval: ensureString(deathForm.medicalCertificate?.causesOfDeath?.underlying?.interval),
        },
      },
      maternalCondition: {
        pregnantNotInLabor: Boolean(deathForm.medicalCertificate?.maternalCondition?.pregnantNotInLabor),
        pregnantInLabor: Boolean(deathForm.medicalCertificate?.maternalCondition?.pregnantInLabor),
        lessThan42Days: Boolean(deathForm.medicalCertificate?.maternalCondition?.lessThan42Days),
        daysTo1Year: Boolean(deathForm.medicalCertificate?.maternalCondition?.daysTo1Year),
        noneOfTheAbove: Boolean(deathForm.medicalCertificate?.maternalCondition?.noneOfTheAbove),
      },
      externalCauses: {
        mannerOfDeath: ensureString(deathForm.medicalCertificate?.externalCauses?.mannerOfDeath),
        placeOfOccurrence: ensureString(deathForm.medicalCertificate?.externalCauses?.placeOfOccurrence),
      },
      attendant: {
        type: validateAttendantType(deathForm.medicalCertificate?.attendant?.type),
        othersSpecify: ensureString(deathForm.medicalCertificate?.attendant?.othersSpecify),
        duration: deathForm.medicalCertificate?.attendant?.duration
          ? {
            from: parseJsonDate(deathForm.medicalCertificate.attendant.duration.from) || undefined,
            to: parseJsonDate(deathForm.medicalCertificate.attendant.duration.to) || undefined,
          }
          : undefined,
        certification: deathForm.medicalCertificate?.attendant?.certification
          ? {
            time: parseDate(deathForm.medicalCertificate.attendant.certification.time),
            date: parseJsonDate(deathForm.medicalCertificate.attendant.certification.date),
            name: ensureString(deathForm.medicalCertificate.attendant.certification.name),
            title: ensureString(deathForm.medicalCertificate.attendant.certification.title),
            address: ensureString(deathForm.medicalCertificate.attendant.certification.address),
          }
          : undefined,
      },

    },

    // Certification of Death
    certificationOfDeath: {
      hasAttended: Boolean(deathForm.certificationOfDeath?.hasAttended),
      nameInPrint: ensureString(deathForm.certificationOfDeath?.nameInPrint),
      titleOfPosition: ensureString(deathForm.certificationOfDeath?.titleOfPosition),
      address: ensureString(deathForm.certificationOfDeath?.address),
      reviewedBy: {
        date: parseJsonDate(deathForm.certificationOfDeath?.reviewedBy?.date),
        reviewDate: parseJsonDate(deathForm.certificationOfDeath?.reviewedBy?.reviewDate),
        healthOfficerNameInPrint: ensureString(deathForm.certificationOfDeath?.reviewedBy?.healthOfficerNameInPrint),
      }
    },

    // Review Information
    reviewedBy: {
      date: parseJsonDate(deathForm.reviewedBy?.date),
    },

    // Optional Certificates
    postmortemCertificate: deathForm.postmortemCertificate
      ? {
        date: parseJsonDate(deathForm.postmortemCertificate.date),
        nameInPrint: ensureString(deathForm.postmortemCertificate.nameInPrint),
        address: ensureString(deathForm.postmortemCertificate.address),
        causeOfDeath: ensureString(deathForm.postmortemCertificate.causeOfDeath),
        titleDesignation: ensureString(deathForm.postmortemCertificate.titleDesignation),
      }
      : {
        date: undefined,
        nameInPrint: '',
        address: '',
        causeOfDeath: '',
        titleDesignation: '',
      },

    embalmerCertification: {
      nameInPrint: ensureString(deathForm.embalmerCertification?.nameInPrint),
      nameOfDeceased: ensureString(deathForm.embalmerCertification?.nameOfDeceased),
      licenseNo: ensureString(deathForm.embalmerCertification?.licenseNo),
      issuedOn: parseJsonDate(deathForm.embalmerCertification?.issuedOn),
      issuedAt: ensureString(deathForm.embalmerCertification?.issuedAt),
      expiryDate: parseJsonDate(deathForm.embalmerCertification?.expiryDate),
      address: ensureString(deathForm.embalmerCertification?.address),
      titleDesignation: ensureString(deathForm.embalmerCertification?.titleDesignation),
    },

    // Disposal Information
    corpseDisposal: validateCorpseDisposal(deathForm.corpseDisposal),
    burialPermit: {
      number: ensureString(deathForm.burialPermit?.number),
      dateIssued: parseJsonDate(deathForm.burialPermit?.dateIssued),
    },
    transferPermit: deathForm.transferPermit
      ? {
        number: ensureString(deathForm.transferPermit.number),
        dateIssued: parseJsonDate(deathForm.transferPermit.dateIssued),
      }
      : {
        number: '',
        dateIssued: undefined,
      },
    cemeteryOrCrematory: {
      name: ensureString(deathForm.cemeteryOrCrematory?.name),
      address: createAddressObject(deathForm.cemeteryOrCrematory?.address),
    },

    // Informant Information
    informant: {
      nameInPrint: ensureString(deathForm.informant?.nameInPrint),
      relationshipToDeceased: ensureString(deathForm.informant?.relationshipToDeceased),
      address: ensureString(deathForm.informant?.address),
      date: parseJsonDate(deathForm.informant?.date),
    },



    // Processing Information
    preparedBy: {
      nameInPrint:
        typeof form.preparedBy === 'string'
          ? form.preparedBy
          : form.preparedByName
            ? ensureString(form.preparedByName)
            : form.preparedBy?.name
              ? ensureString(form.preparedBy.name)
              : '',
      titleOrPosition: ensureString(form.preparedByPosition),
      date: parseDate(form.preparedByDate),
    },
    receivedBy: {
      nameInPrint:
        typeof form.receivedBy === 'string'
          ? form.receivedBy
          : ensureString(form.receivedBy),
      titleOrPosition: ensureString(form.receivedByPosition),
      date: parseDate(form.receivedByDate),
    },
    registeredByOffice: {
      nameInPrint:
        typeof form.registeredBy === 'string'
          ? form.registeredBy
          : ensureString(form.registeredBy),
      titleOrPosition: ensureString(form.registeredByPosition),
      date: parseDate(form.registeredByDate),
    }
  };

  if (deathForm.delayedRegistration) {
    result.delayedRegistration = {
      isDelayed: Boolean(deathForm.delayedRegistration.isDelayed),
      affiant: {
        name: ensureString(deathForm.delayedRegistration.affiant?.name),
        civilStatus: ensureString(deathForm.delayedRegistration?.affiant?.civilStatus),
        residenceAddress: ensureString(deathForm.delayedRegistration.affiant?.residenceAddress),
        age: ensureString(deathForm.delayedRegistration.affiant?.age),
      },
      deceased: {
        name: ensureString(deathForm.delayedRegistration.deceased?.name),
        dateOfDeath: parseJsonDate(deathForm.delayedRegistration.deceased?.dateOfDeath),
        placeOfDeath: ensureString(deathForm.delayedRegistration.deceased?.placeOfDeath),
        diedOn: ensureString(deathForm.delayedRegistration?.deceased?.diedOn),
        burialInfo: {
          date: parseJsonDate(deathForm.delayedRegistration.deceased?.burialInfo?.date),
          place: ensureString(deathForm.delayedRegistration.deceased?.burialInfo?.place),
          method: ensureString(deathForm.delayedRegistration.deceased?.burialInfo?.method),
        },
      },
      attendance: {
        wasAttended: Boolean(deathForm.delayedRegistration.attendance?.wasAttended),
        attendedBy: ensureString(deathForm.delayedRegistration.attendance?.attendedBy),
      },
      causeOfDeath: ensureString(deathForm.delayedRegistration?.causeOfDeath),
      reasonForDelay: ensureString(deathForm.delayedRegistration?.reasonForDelay),
      affidavitDate: parseJsonDate(deathForm.delayedRegistration?.affidavitDate),
      affidavitDatePlace: ensureString(deathForm.delayedRegistration?.affidavitDatePlace),
      adminOfficer: {
        name: ensureString(deathForm.delayedRegistration?.adminOfficer?.name),
        address: ensureString(deathForm.delayedRegistration?.adminOfficer?.address),
        position: ensureString(deathForm.delayedRegistration?.adminOfficer?.position),
      },
      ctcInfo: {
        dayOf: parseJsonDate(deathForm.delayedRegistration?.ctcInfo?.dayOf),
        number: ensureString(deathForm.delayedRegistration?.ctcInfo?.number),
        issuedOn: parseJsonDate(deathForm.delayedRegistration?.ctcInfo?.issuedOn),
        issuedAt: ensureString(deathForm.delayedRegistration?.ctcInfo?.issuedAt),
        placeAt: ensureString(deathForm.delayedRegistration?.ctcInfo?.placeAt)
      },
    }
  } else {
    result.delayedRegistration = {
      isDelayed: false,
      affiant: {
        name: '',
        civilStatus: undefined,
        residenceAddress: '',
        age: '',
      },
      deceased: {
        name: '',
        dateOfDeath: undefined,
        placeOfDeath: '',
        burialInfo: {
          date: undefined,
          place: '',
          method: undefined,
        },
      },
      attendance: {
        wasAttended: false,
        attendedBy: '',
      },
      causeOfDeath: '',
      reasonForDelay: '',
      affidavitDate: undefined,
      affidavitDatePlace: '',
      adminOfficer: {
        name: '',
        address: '',
        position: '',
      },
      ctcInfo: {
        dayOf: '',        // Added missing field
        number: '',
        issuedOn: undefined,
        issuedAt: '',
        placeAt: ''       // Added missing field
      },
    }
  }

  return result;
};