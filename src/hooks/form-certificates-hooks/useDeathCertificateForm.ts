import { submitDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/death-certificate-actions';
import {
  DeathCertificateFormValues,
  deathCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { notifyUsersWithPermission } from '../users-action';
import { useRouter } from 'next/navigation';
import { updateDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-edit-actions/death-certificate-edit-form';

export interface UseDeathCertificateFormProps {
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<DeathCertificateFormValues> & { id?: string };
}

const emptyDefaults: DeathCertificateFormValues = {
  registryNumber: '2023-001',
  province: 'Albay',
  cityMunicipality: 'City of Tabaco',
  name: {
    first: 'Juan',
    middle: 'Dela',
    last: 'Cruz',
  },
  sex: 'Male',
  dateOfDeath: new Date('2023-10-01'),
  timeOfDeath: new Date('2023-10-10T14:30:00'),
  dateOfBirth: new Date('1980-05-15'),
  ageAtDeath: {
    years: '43',
    months: '4',
    days: '16',
    hours: '14',
  },
  placeOfDeath: {
    hospitalInstitution: 'Tabaco City Hospital',
    houseNo: '123',
    st: 'Rizal Street',
    barangay: 'Salvacion',
    cityMunicipality: 'City of Tabaco',
    province: 'Albay',
  },
  civilStatus: 'Married',
  religion: 'Roman Catholic',
  citizenship: 'Filipino',
  residence: {
    houseNo: '456',
    st: 'Luna Street',
    barangay: 'San Roque',
    cityMunicipality: 'City of Tabaco',
    province: 'Albay',
    country: 'Philippines',
  },
  occupation: 'Farmer',
  birthInformation: {
    ageOfMother: '25',
    methodOfDelivery: 'Normal spontaneous vertex',
    lengthOfPregnancy: 37,
    typeOfBirth: 'Single',
    birthOrder: 'First',
  },
  parents: {
    fatherName: {
      first: 'Pedro',
      middle: 'Dela',
      last: 'Cruz',
    },
    motherName: {
      first: 'Maria',
      middle: 'Santos',
      last: 'Dela Cruz',
    },
  },

  causesOfDeath19a: {
    mainDiseaseOfInfant: 'Cardiac Arrest',
    otherDiseasesOfInfant: 'None',
    mainMaternalDisease: 'Hypertension',
    otherMaternalDisease: 'None',
    otherRelevantCircumstances: 'None',
  },

  causesOfDeath19b: {
    immediate: { cause: 'Cardiac Arrest', interval: 'Immediate' },
    antecedent: { cause: 'Hypertension', interval: '5 years' },
    underlying: { cause: 'Diabetes', interval: '10 years' },
    otherSignificantConditions: 'None',
  },
  medicalCertificate: {
    causesOfDeath: {
      immediate: { cause: 'Cardiac Arrest', interval: 'Immediate' },
      antecedent: { cause: 'Hypertension', interval: '5 years' },
      underlying: { cause: 'Diabetes', interval: '10 years' },
      otherSignificantConditions: 'None',
    },
    maternalCondition: {
      pregnantNotInLabor: false,
      pregnantInLabor: false,
      lessThan42Days: false,
      daysTo1Year: false,
      noneOfTheAbove: true,
    },
    externalCauses: { mannerOfDeath: 'Natural', placeOfOccurrence: 'Home' },
    attendant: {
      type: 'Hospital authority',
      othersSpecify: 'None',
      duration: { from: new Date('2023-09-30'), to: new Date('2023-10-01') },
      certification: {
        date: new Date('2023-10-02'),
        name: 'Dr. Jose Reyes',
        title: 'Medical Doctor',
        time: new Date('2023-10-10T14:30:00'),
        address: {
          province: 'Albay',
          cityMunicipality: 'City of Tabaco',
          country: 'Philippines',
        },
      },
    },
    autopsy: false,
  },
  certificationOfDeath: {
    hasAttended: false,
    nameInPrint: 'Dr. Maria Santos',
    titleOfPosition: 'Medical Officer',
    address: {
      houseNo: '789',
      st: 'Mabini Street',
      barangay: 'San Lorenzo',
      cityMunicipality: 'City of Tabaco',
      province: 'Albay',
      country: 'Philippines',
    },
    date: new Date('2023-10-02'),
    healthOfficerNameInPrint: 'Dr. Juan Dela Cruz',
  },
  reviewedBy: { date: new Date('2023-10-03') },
  postmortemCertificate: {
    address: 'Tabaco City Hospital, City of Tabaco, Albay',
    nameInPrint: 'Dr. Jose Reyes',
    causeOfDeath: 'Cardiac Arrest',
    titleDesignation: 'Medical Doctor',
    date: new Date('2023-10-02'),
  },
  embalmerCertification: {
    address: 'Tabaco Funeral Homes, City of Tabaco, Albay',
    nameInPrint: 'John Doe',
    titleDesignation: 'Licensed Embalmer',
    nameOfDeceased: 'Juan Dela Cruz',
    licenseNo: 'EMB-12345',
    issuedOn: new Date('2023-09-30'),
    issuedAt: 'City of Tabaco, Albay',
    expiryDate: new Date('2024-09-30'),
  },
  delayedRegistration: {
    isDelayed: true, // Optional boolean
    affiant: {
      name: 'Juan Dela Cruz', // Required
      civilStatus: 'Married', // Required, must be one of the enum values
      residenceAddress: '123 Rizal Street, Barangay San Miguel, City of Tabaco, Albay', // Required
      age: '45', // Optional
    },
    deceased: {
      name: 'Maria Santos Dela Cruz', // Required
      dateOfDeath: new Date('2023-09-15'), // Optional date
      placeOfDeath: 'Tabaco City Hospital, Albay', // Optional
      burialInfo: {
        date: new Date('2023-09-20'), // Optional date
        place: 'Tabaco Public Cemetery, Albay', // Optional
        method: 'Buried', // Optional, must be one of the enum values
      },
    },
    attendance: {
      wasAttended: true, // Required boolean
      attendedBy: 'Dr. Jose Reyes', // Optional
    },
    causeOfDeath: 'Cardiac Arrest', // Required
    reasonForDelay: 'Delayed reporting due to family being abroad', // Required
    affidavitDate: new Date('2023-09-25'), // Required date
    affidavitDatePlace: 'City of Tabaco, Albay', // Required
    adminOfficer: 'City Health Officer', // Required
    ctcInfo: {
      number: 'CTC-123456', // Required
      issuedOn: new Date('2023-09-25'), // Required date
      issuedAt: 'City of Tabaco, Albay', // Required
    },
  },
  corpseDisposal: 'Burial',
  burialPermit: { number: 'BP-2023-001', dateIssued: new Date('2023-10-03') },
  transferPermit: { number: 'TP-2023-001', dateIssued: new Date('2023-10-03') },
  cemeteryOrCrematory: {
    name: 'Tabaco Public Cemetery',
    address: {
      houseNo: 'N/A',
      st: 'Cemetery Road',
      barangay: 'San Roque',
      cityMunicipality: 'City of Tabaco',
      province: 'Albay',
      country: 'Philippines',
    },
  },
  informant: {
    nameInPrint: 'Maria Dela Cruz',
    relationshipToDeceased: 'Spouse',
    address: {
      houseNo: '456',
      st: 'Luna Street',
      barangay: 'San Roque',
      cityMunicipality: 'City of Tabaco',
      province: 'Albay',
      country: 'Philippines',
    },
    date: new Date('2023-10-02'),
  },
  preparedBy: {
    nameInPrint: 'Clerk 1',
    titleOrPosition: 'Clerk 1',
    date: new Date('2023-10-02'),
  },
  receivedBy: {
    nameInPrint: 'Clerk 2',
    titleOrPosition: 'Clerk 2',
    date: new Date('2023-10-03'),
  },
  registeredByOffice: {
    nameInPrint: 'Clerk 3',
    titleOrPosition: 'Clerk 3',
    date: new Date('2023-10-03'),
  },
  remarks: 'None',
  pagination: { pageNumber: '1', bookNumber: '2023-001' },
};


export function useDeathCertificateForm({
  onOpenChange,
  defaultValues,
}: UseDeathCertificateFormProps = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const formMethods = useForm<DeathCertificateFormValues>({
    resolver: zodResolver(deathCertificateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || emptyDefaults,
  });


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


  const router = useRouter();

  // Reset the form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues && !isInitialized) {
      // Set the form values once and mark as initialized
      formMethods.reset(defaultValues);
      setIsInitialized(true);
    }
  }, [defaultValues, formMethods, isInitialized]);

  const onSubmit = async (data: DeathCertificateFormValues) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Check and simplify affidavitForDelayed if it's false
    if (!data.delayedRegistration ||
      data.delayedRegistration.isDelayed === false ||
      data.delayedRegistration.isDelayed === null ||
      data.delayedRegistration.isDelayed === undefined) {

      data.delayedRegistration
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
        result = await updateDeathCertificateForm(defaultValues?.id || '', data);

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
        // Check and simplify affidavitForDelayed if it's false
        if (!data.delayedRegistration ||
          data.delayedRegistration.isDelayed === false ||
          data.delayedRegistration.isDelayed === null ||
          data.delayedRegistration.isDelayed === undefined) {

          data.delayedRegistration = undefined;
        }

        result = await updateDeathCertificateForm(defaultValues.id, processedData);

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
        result = await submitDeathCertificateForm(processedData);

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