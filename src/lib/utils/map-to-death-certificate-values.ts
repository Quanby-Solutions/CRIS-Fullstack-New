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
        internationalAddress: ''
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
    dateOfDeath: parseDateSafely(deathForm.dateOfDeath),
    timeOfDeath: parseDateSafely(deathForm.timeOfDeath),
    dateOfBirth: parseDateSafely(deathForm.dateOfBirth),
    ageAtDeath: deathForm.ageAtDeath || {
      years: '',
      months: '',
      days: '',
      hours: '',
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
            from: parseDateSafely(deathForm.medicalCertificate.attendant.duration.from),
            to: parseDateSafely(deathForm.medicalCertificate.attendant.duration.to),
          }
          : undefined,
        certification: deathForm.medicalCertificate?.attendant?.certification
          ? {
            time: parseDateSafely(deathForm.medicalCertificate.attendant.certification.time),
            date: parseDateSafely(deathForm.medicalCertificate.attendant.certification.date),
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
      date: parseDateSafely(deathForm.certificationOfDeath?.date),
    },

    // Review Information
    reviewedBy: {
      date: parseDateSafely(deathForm.reviewedBy?.date),
    },

    // Optional Certificates
    postmortemCertificate: deathForm.postmortemCertificate
      ? {
        date: parseDateSafely(deathForm.postmortemCertificate.date),
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
      issuedOn: parseDateSafely(deathForm.embalmerCertification?.issuedOn),
      issuedAt: ensureString(deathForm.embalmerCertification?.issuedAt),
      expiryDate: parseDateSafely(deathForm.embalmerCertification?.expiryDate),
      address: ensureString(deathForm.embalmerCertification?.address),
      titleDesignation: ensureString(deathForm.embalmerCertification?.titleDesignation),
    },

    // Disposal Information
    corpseDisposal: validateCorpseDisposal(deathForm.corpseDisposal),
    burialPermit: {
      number: ensureString(deathForm.burialPermit?.number),
      dateIssued: parseDateSafely(deathForm.burialPermit?.dateIssued),
    },
    transferPermit: deathForm.transferPermit
      ? {
        number: ensureString(deathForm.transferPermit.number),
        dateIssued: parseDateSafely(deathForm.transferPermit.dateIssued),
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
      date: parseDateSafely(deathForm.informant?.date),
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
      date: parseDateSafely(form.preparedByDate),
    },
    receivedBy: {
      nameInPrint:
        typeof form.receivedBy === 'string'
          ? form.receivedBy
          : ensureString(form.receivedBy),
      titleOrPosition: ensureString(form.receivedByPosition),
      date: parseDateSafely(form.receivedByDate),
    },
    registeredByOffice: {
      nameInPrint:
        typeof form.registeredBy === 'string'
          ? form.registeredBy
          : ensureString(form.registeredBy),
      titleOrPosition: ensureString(form.registeredByPosition),
      date: parseDateSafely(form.registeredByDate),
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
        dateOfDeath: parseDateSafely(deathForm.delayedRegistration.deceased?.dateOfDeath),
        placeOfDeath: ensureString(deathForm.delayedRegistration.deceased?.placeOfDeath),
        burialInfo: {
          date: parseDateSafely(deathForm.delayedRegistration.deceased?.burialInfo?.date),
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
      affidavitDate: parseDateSafely(deathForm.delayedRegistration?.affidavitDate),
      affidavitDatePlace: ensureString(deathForm.delayedRegistration?.affidavitDatePlace),
      adminOfficer: {
        name: ensureString(deathForm.delayedRegistration?.adminOfficer?.name),
        address: ensureString(deathForm.delayedRegistration?.adminOfficer?.address),
        position: ensureString(deathForm.delayedRegistration?.adminOfficer?.position),
      },
      ctcInfo: {
        number: ensureString(deathForm.delayedRegistration?.ctcInfo?.number),
        issuedOn: parseDateSafely(deathForm.delayedRegistration?.ctcInfo?.issuedOn),
        issuedAt: ensureString(deathForm.delayedRegistration?.ctcInfo?.issuedAt),
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
        number: '',
        issuedOn: undefined,
        issuedAt: '',
      },

    }
  }

  return result;
};