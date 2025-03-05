import { submitDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/death-certificate-actions';
import {
  DeathCertificateFormValues,
  deathCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
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
  registryNumber: '3412',
  province: 'Sample Province',
  cityMunicipality: 'Sample City',
  name: {
    first: 'Josh',
    middle: 'Morris',
    last: 'Aguilar',
  },
  sex: undefined,
  dateOfDeath: new Date('2022-01-01'),
  timeOfDeath: undefined,
  dateOfBirth: new Date('2022-04-01'),
  ageAtDeath: {
    years: '2',
    months: '5',
    days: '1',
    hours: '52',
  },
  placeOfDeath: {
    hospitalInstitution: 'qweqwe',
    houseNo: 'ewqes',
    st: 'sadaw',
    barangay: '',
    cityMunicipality: 'asdwd',
    province: 'asfafs',
  },
  civilStatus: undefined,
  religion: 'Catolic',
  citizenship: 'Filipino',
  residence: {
    houseNo: '213',
    st: '535qweqwe',
    barangay: 'qweqweqw',
    cityMunicipality: 'qwe',
    province: 'qwe',
    country: 'qwe',
  },
  occupation: 'qweqwe',
  birthInformation: {
    ageOfMother: 'qweqwe',
    methodOfDelivery: 'Normal spontaneous vertex',
    lengthOfPregnancy: undefined,
    typeOfBirth: 'Single',
    birthOrder: undefined,
  },
  parents: {
    fatherName: {
      first: 'FFF',
      middle: 'qQQWW',
      last: 'FWQFQ',
    },
    motherName: {
      first: 'qwerqs',
      middle: 'SAFASFW',
      last: 'fqwasfw',
    },
  },
  causesOfDeath19b: {
    immediate: { cause: 'qwersaf', interval: '4' },
    antecedent: { cause: 'asfwf', interval: '2' },
    underlying: { cause: 'safqwf', interval: '15' },
    otherSignificantConditions: '',
  },
  medicalCertificate: {
    causesOfDeath: {
      immediate: { cause: 'qqqq', interval: '' },
      antecedent: { cause: 'qqqq', interval: '' },
      underlying: { cause: 'qqqq', interval: '' },
      otherSignificantConditions: 'qwasdwd',
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
    nameInPrint: '',
    titleOfPosition: '',
    address: {
      houseNo: '5254125',
      st: '123123qweqw',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    },
    date: undefined,
    healthOfficerNameInPrint: '',
  },
  reviewedBy: { date: undefined },
  postmortemCertificate: undefined,
  embalmerCertification: undefined,
  // Provide default value matching the non-delayed case:
  delayedRegistration: { isDelayed: false },
  corpseDisposal: '',
  burialPermit: { number: '', dateIssued: undefined },
  transferPermit: undefined,
  cemeteryOrCrematory: {
    name: '',
    address: {
      houseNo: '465124',
      st: '15qwqweqwe',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    },
  },
  informant: {
    nameInPrint: '',
    relationshipToDeceased: '',
    address: {
      houseNo: '123123',
      st: 'qweqweqwe',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    },
    date: undefined,
  },
  preparedBy: {
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  receivedBy: {
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  registeredByOffice: {
    nameInPrint: '',
    titleOrPosition: '',
    date: undefined,
  },
  remarks: 'No Remarks',
  pagination: { pageNumber: '21', bookNumber: '112' },
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

      // (If you need to convert any file fields to Base64, add conversion logic here.
      // The current Zod schema does not include any "signature" fields, so this conversion has been removed.)

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

          const documentRead = Permission.DOCUMENT_READ;
          const Title = 'New uploaded Death Certificate';
          const message = `New Death Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`;
          notifyUsersWithPermission(documentRead, Title, message);

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
    console.log('All validation errors as JSON:', JSON.stringify(errors, null, 2));
    toast.error('Please check form for errors');
  };

  return { formMethods, onSubmit, handleError };
}
