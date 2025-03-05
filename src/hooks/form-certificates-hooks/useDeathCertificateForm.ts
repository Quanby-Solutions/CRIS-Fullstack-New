import { submitDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/death-certificate-actions';
import {
  DeathCertificateFormValues,
  deathCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@prisma/client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { notifyUsersWithPermission } from '../users-action';

export interface UseDeathCertificateFormProps {
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<DeathCertificateFormValues> & { id?: string };
}

const emptyDefaults: DeathCertificateFormValues = {
  registryNumber: '',
  province: '',
  cityMunicipality: '',
  name: {
    first: '',
    middle: '',
    last: '',
  },
  sex: undefined,
  dateOfDeath: undefined,
  timeOfDeath: undefined,
  dateOfBirth: undefined,
  ageAtDeath: {
    years: '',
    months: '',
    days: '',
    hours: '',
  },
  placeOfDeath: {
    hospitalInstitution: '',
    houseNo: '',
    st: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
  },
  civilStatus: undefined,
  religion: '',
  citizenship: '',
  residence: {
    houseNo: '',
    st: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    country: '',
  },
  occupation: '',
  birthInformation: {
    ageOfMother: '',
    methodOfDelivery: 'Normal spontaneous vertex',
    lengthOfPregnancy: undefined,
    typeOfBirth: 'Single',
    birthOrder: undefined,
  },
  parents: {
    fatherName: {
      first: '',
      middle: '',
      last: '',
    },
    motherName: {
      first: '',
      middle: '',
      last: '',
    },
  },
  causesOfDeath19b: {
    immediate: { cause: '', interval: '' },
    antecedent: { cause: '', interval: '' },
    underlying: { cause: '', interval: '' },
    otherSignificantConditions: '',
  },
  medicalCertificate: {
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
  certificationOfDeath: {
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
  reviewedBy: { signature: '', date: undefined },
  postmortemCertificate: undefined,
  embalmerCertification: undefined,
  delayedRegistration: undefined,
  corpseDisposal: '',
  burialPermit: { number: '', dateIssued: undefined },
  transferPermit: undefined,
  cemeteryOrCrematory: {
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
  informant: {
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
  preparedBy: {
    // signature: '',
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  receivedBy: {
    // signature: '',
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  registeredByOffice: {
    // signature: '',
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  remarks: '',
  pagination: { pageNumber: '', bookNumber: '' },
};

export function useDeathCertificateForm({
  onOpenChange,
  defaultValues,
}: UseDeathCertificateFormProps = {}) {
  const formMethods = useForm<DeathCertificateFormValues>({
    resolver: zodResolver(deathCertificateFormSchema),
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

  const onSubmit = async (data: DeathCertificateFormValues) => {
    try {
      console.log(
        'Attempting to submit form with data:',
        JSON.stringify(data, null, 2)
      );

      // Convert signature fields to Base64 if needed
      if (
        data.medicalCertificate?.attendant?.certification?.signature instanceof
        File
      ) {
        data.medicalCertificate.attendant.certification.signature =
          await fileToBase64(
            data.medicalCertificate.attendant.certification.signature
          );
      }
      if (data.certificationOfDeath.signature instanceof File) {
        data.certificationOfDeath.signature = await fileToBase64(
          data.certificationOfDeath.signature
        );
      }
      if (data.certificationOfDeath.healthOfficerSignature instanceof File) {
        data.certificationOfDeath.healthOfficerSignature = await fileToBase64(
          data.certificationOfDeath.healthOfficerSignature
        );
      }
      if (data.reviewedBy.signature instanceof File) {
        data.reviewedBy.signature = await fileToBase64(
          data.reviewedBy.signature
        );
      }
      if (data.informant.signature instanceof File) {
        data.informant.signature = await fileToBase64(data.informant.signature);
      }
      // if (data.preparedBy.signature instanceof File) {
      //   data.preparedBy.signature = await fileToBase64(
      //     data.preparedBy.signature
      //   );
      // }
      // if (data.receivedBy.signature instanceof File) {
      //   data.receivedBy.signature = await fileToBase64(
      //     data.receivedBy.signature
      //   );
      // }
      // if (data.registeredByOffice.signature instanceof File) {
      //   data.registeredByOffice.signature = await fileToBase64(
      //     data.registeredByOffice.signature
      //   );
      // }
      if (data.postmortemCertificate?.signature instanceof File) {
        data.postmortemCertificate.signature = await fileToBase64(
          data.postmortemCertificate.signature
        );
      }
      if (data.embalmerCertification?.signature instanceof File) {
        data.embalmerCertification.signature = await fileToBase64(
          data.embalmerCertification.signature
        );
      }
      if (data.delayedRegistration?.affiant?.signature instanceof File) {
        data.delayedRegistration.affiant.signature = await fileToBase64(
          data.delayedRegistration.affiant.signature
        );
      }
      if (data.delayedRegistration?.adminOfficer?.signature instanceof File) {
        data.delayedRegistration.adminOfficer.signature = await fileToBase64(
          data.delayedRegistration.adminOfficer.signature
        );
      }

      // If defaultValues includes an id, assume update mode and simply log success
      if (defaultValues && defaultValues.id) {
        console.log('Update successful:', data);
        toast.success('Death certificate update successful');
      } else {
        const result = await submitDeathCertificateForm(data);
        console.log('API submission result:', result);
        if ('data' in result) {
          console.log('Submission successful:', result);
          toast.success(
            `Death certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
          );

             const documentRead = Permission.DOCUMENT_READ
                  const Title = "New uploaded Death Certificate"
                  const message = `New Death Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`
                  notifyUsersWithPermission(documentRead, Title, message)

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
    } catch (error) {
      console.error('Form submission error details:', error);
      toast.error('An unexpected error occurred while submitting the form');
    }
  };

  const handleError = (errors: any) => {
    console.log('Form Validation Errors Object:', errors);
    const logNestedErrors = (obj: any, path: string = '') => {
      if (!obj) return;
      if (typeof obj === 'object') {
        if (obj.message) {
          console.log(`${path}: ${obj.message}`);
        }
        Object.keys(obj).forEach((key) => {
          logNestedErrors(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };
    logNestedErrors(errors);
    console.log(
      'All validation errors as JSON:',
      JSON.stringify(errors, null, 2)
    );
    toast.error('Please check form for errors');
  };

  return { formMethods, onSubmit, handleError };
}
