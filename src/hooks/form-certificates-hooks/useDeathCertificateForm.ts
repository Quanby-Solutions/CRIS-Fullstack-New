// useDeathCertificateForm.ts - Updated with fresh, empty form defaults

import { submitDeathCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/death-certificate-actions';
import {
  DeathCertificateFormValues,
  deathCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { fileToBase64 } from '@/lib/utils/fileToBase64';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UseDeathCertificateFormProps {
  onOpenChange?: (open: boolean) => void;
}

export function useDeathCertificateForm({
  onOpenChange,
}: UseDeathCertificateFormProps = {}) {
  const formMethods = useForm<DeathCertificateFormValues>({
    resolver: zodResolver(deathCertificateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      // Basic Information - Empty to be filled by user
      registryNumber: '',
      province: '',
      cityMunicipality: '',

      // Deceased Information - Empty to be filled by user
      name: {
        first: '',
        middle: '',
        last: '',
      },
      sex: undefined, // Will trigger validation as required
      dateOfDeath: undefined, // Will trigger validation as required
      timeOfDeath: undefined, // Will trigger validation as required
      dateOfBirth: undefined, // Will trigger validation as required
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

      // Birth Information (only relevant for infant deaths)
      birthInformation: {
        ageOfMother: '',
        methodOfDelivery: 'Normal spontaneous vertex',
        lengthOfPregnancy: undefined,
        typeOfBirth: 'Single',
        birthOrder: undefined,
      },

      // Parent Information
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

      // Causes of Death 19b (8 days and over)
      causesOfDeath19b: {
        immediate: {
          cause: '',
          interval: '',
        },
        antecedent: {
          cause: '',
          interval: '',
        },
        underlying: {
          cause: '',
          interval: '',
        },
        otherSignificantConditions: '',
      },

      // Medical Certificate
      medicalCertificate: {
        // Use the standard (non-infant) branch by default
        causesOfDeath: {
          immediate: {
            cause: '',
            interval: '',
          },
          antecedent: {
            cause: '',
            interval: '',
          },
          underlying: {
            cause: '',
            interval: '',
          },
          otherSignificantConditions: '',
        },
        maternalCondition: {
          pregnantNotInLabor: false,
          pregnantInLabor: false,
          lessThan42Days: false,
          daysTo1Year: false,
          noneOfTheAbove: false,
        },
        externalCauses: {
          mannerOfDeath: '',
          placeOfOccurrence: '',
        },
        attendant: {
          type: undefined, // Will trigger validation as required
          othersSpecify: '',
          duration: undefined, // Will be required if attendant type is not "None"
          certification: undefined, // Will be required based on attendant type
        },
        autopsy: false,
      },

      // Certification of Death
      certificationOfDeath: {
        hasAttended: false,
        signature: '', // Will need to be populated with signature base64 or File
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
        date: undefined, // Will trigger validation as required
        healthOfficerSignature: '', // Will need to be populated
        healthOfficerNameInPrint: '',
      },

      // Review
      reviewedBy: {
        signature: '', // Will need to be populated
        date: undefined, // Will trigger validation as required
      },

      // Optional Certificates - undefined by default
      postmortemCertificate: undefined,
      embalmerCertification: undefined,
      delayedRegistration: undefined,

      // Disposal Information
      corpseDisposal: '',
      burialPermit: {
        number: '',
        dateIssued: undefined, // Will trigger validation as required
      },
      transferPermit: undefined, // Optional unless burial location differs from death location
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

      // Informant
      informant: {
        signature: '', // Will need to be populated
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
        date: undefined, // Will trigger validation as required
      },

      // Processing Information
      preparedBy: {
        signature: '', // Will need to be populated
        nameInPrint: '',
        titleOrPosition: '',
        date: undefined, // Will trigger validation as required
      },
      receivedBy: {
        signature: '', // Will need to be populated
        nameInPrint: '',
        titleOrPosition: '',
        date: undefined, // Will trigger validation as required
      },
      registeredByOffice: {
        signature: '', // Will need to be populated
        nameInPrint: '',
        titleOrPosition: '',
        date: undefined, // Will trigger validation as required
      },

      // Additional fields
      remarks: '',

      // Pagination - Optional
      pagination: {
        pageNumber: '',
        bookNumber: '',
      },
    },
  });

  const onSubmit = async (data: DeathCertificateFormValues) => {
    try {
      console.log(
        'Attempting to submit form with data:',
        JSON.stringify(data, null, 2)
      );

      // Convert all signature fields to Base64 if they're File objects
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

      if (data.preparedBy.signature instanceof File) {
        data.preparedBy.signature = await fileToBase64(
          data.preparedBy.signature
        );
      }

      if (data.receivedBy.signature instanceof File) {
        data.receivedBy.signature = await fileToBase64(
          data.receivedBy.signature
        );
      }

      if (data.registeredByOffice.signature instanceof File) {
        data.registeredByOffice.signature = await fileToBase64(
          data.registeredByOffice.signature
        );
      }

      // Handle optional certificate signatures
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

      const result = await submitDeathCertificateForm(data);
      console.log('API submission result:', result);

      if ('data' in result) {
        console.log('Submission successful:', result);
        toast.success(
          `Death certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
        );
        onOpenChange?.(false);
      } else if ('error' in result) {
        console.log('Submission error:', result.error);
        const errorMessage = result.error.includes('No user found with name')
          ? 'Invalid prepared by user. Please check the name.'
          : result.error;
        toast.error(errorMessage);
      }
      formMethods.reset();
    } catch (error) {
      console.error('Form submission error details:', error);
      toast.error('An unexpected error occurred while submitting the form');
    }
  };

  const handleError = (errors: any) => {
    console.log('Form Validation Errors Object:', errors);

    // Log detailed errors for easier debugging
    console.log('Detailed Validation Errors:');
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

    // Also log as JSON for comprehensive view
    console.log(
      'All validation errors as JSON:',
      JSON.stringify(errors, null, 2)
    );

    toast.error('Please check form for errors');
  };
  return { formMethods, onSubmit, handleError };
}
