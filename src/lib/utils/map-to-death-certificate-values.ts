import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';

// Define a type for the death certificate form structure based on your Prisma model
interface DeathCertificateFormData {
  id?: string;
  baseFormId?: string;
  deceasedName?: any;
  sex?: any;
  dateOfDeath?: Date;
  timeOfDeath?: Date;
  dateOfBirth?: Date;
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
  // Extract the death certificate form data with proper typing
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
      'Divorced',
    ];
    if (status && validStatuses.includes(status)) {
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

  // Map deceased information based on the actual Prisma model structure
  const deceasedInfo = {
    name: deathForm.deceasedName || { first: '', middle: '', last: '' },
    sex: deathForm.sex,
    dateOfDeath: parseDateSafely(deathForm.dateOfDeath),
    timeOfDeath: parseDateSafely(deathForm.timeOfDeath),
    dateOfBirth: parseDateSafely(deathForm.dateOfBirth),
    ageAtDeath: deathForm.ageAtDeath || {
      years: '',
      months: '',
      days: '',
      hours: '',
    },
    placeOfDeath: deathForm.placeOfDeath || {
      hospitalInstitution: '',
      houseNo: '',
      st: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
    },
    civilStatus: validateCivilStatus(deathForm.civilStatus),
    religion: deathForm.religion || '',
    citizenship: deathForm.citizenship || '',
    residence: deathForm.residence || {
      houseNo: '',
      st: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    },
    occupation: deathForm.occupation || '',
    birthInformation: deathForm.birthInformation || {
      ageOfMother: '',
      methodOfDelivery: 'Normal spontaneous vertex',
      lengthOfPregnancy: undefined,
      typeOfBirth: 'Single',
      birthOrder: undefined,
    },
  };

  // Map parent information from the parentInfo JSON field
  const parentInfo = {
    parents: deathForm.parentInfo || {
      fatherName: { first: '', middle: '', last: '' },
      motherName: { first: '', middle: '', last: '' },
    },
  };

  // Map causes of death directly from the causesOfDeath19b JSON field
  const causesOfDeath = {
    causesOfDeath19b: deathForm.causesOfDeath19b || {
      immediate: { cause: '', interval: '' },
      antecedent: { cause: '', interval: '' },
      underlying: { cause: '', interval: '' },
      otherSignificantConditions: '',
    },
  };

  // Map medical certificate directly from the medicalCertificate JSON field
  const medicalCertificateInfo = {
    medicalCertificate: deathForm.medicalCertificate || {
      causesOfDeath: {
        immediate: { cause: '', interval: '' },
        antecedent: { cause: '', interval: '' },
        underlying: { cause: '', interval: '' },
        otherSignificantConditions: '',
      },
      maternalCondition: {
        pregnantNotInLabor: false,
        pregnantInLabor: false,
        lessThan42Days: false,
        daysTo1Year: false,
        noneOfTheAbove: false,
      },
      externalCauses: { mannerOfDeath: '', placeOfOccurrence: '' },
      attendant: {
        type: undefined,
        othersSpecify: '',
        duration: undefined,
        certification: undefined,
      },
      autopsy: false,
    },
  };

  // Map certifications from their respective JSON fields
  const certificationInfo = {
    certificationOfDeath: deathForm.certificationOfDeath || {
      hasAttended: false,
      signature: '',
      nameInPrint: '',
      titleOfPosition: '',
      address: {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      },
      date: undefined,
      healthOfficerSignature: '',
      healthOfficerNameInPrint: '',
    },
    reviewedBy: deathForm.reviewedBy || {
      signature: '',
      date: undefined,
    },
    postmortemCertificate: deathForm.postmortemCertificate,
    embalmerCertification: deathForm.embalmerCertification,
    delayedRegistration: deathForm.delayedRegistration,
  };

  // Map disposal information from their respective fields
  const disposalInfo = {
    corpseDisposal: deathForm.corpseDisposal || '',
    burialPermit: deathForm.burialPermit || {
      number: '',
      dateIssued: undefined,
    },
    transferPermit: deathForm.transferPermit,
    cemeteryOrCrematory: deathForm.cemeteryOrCrematory || {
      name: '',
      address: {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      },
    },
  };

  // Map informant information from the informant JSON field
  const informantInfo = {
    informant: deathForm.informant || {
      signature: '',
      nameInPrint: '',
      relationshipToDeceased: '',
      address: {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      },
      date: undefined,
    },
  };

  // Map processing details from the BaseRegistryForm
  const processingInfo = {
    preparedBy: {
      signature: '',
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
      signature: '',
      nameInPrint:
        typeof form.receivedBy === 'string'
          ? form.receivedBy
          : ensureString(form.receivedBy),
      titleOrPosition: ensureString(form.receivedByPosition),
      date: parseDateSafely(form.receivedByDate),
    },
    registeredByOffice: {
      signature: '',
      nameInPrint:
        typeof form.registeredBy === 'string'
          ? form.registeredBy
          : ensureString(form.registeredBy),
      titleOrPosition: ensureString(form.registeredByPosition),
      date: parseDateSafely(form.registeredByDate),
    },
  };

  // Combine all sections and return the mapped data
  return {
    ...registryInfo,
    ...deceasedInfo,
    ...parentInfo,
    ...causesOfDeath,
    ...medicalCertificateInfo,
    ...certificationInfo,
    ...disposalInfo,
    ...informantInfo,
    ...processingInfo,
    // Don't include id as it's not part of DeathCertificateFormValues
  };
};
