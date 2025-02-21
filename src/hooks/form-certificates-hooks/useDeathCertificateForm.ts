// useDeathCertificateForm.ts

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
      registryNumber: '2022-12345',
      province: 'Sample Province',
      cityMunicipality: 'Sample City',
      // Deceased Information
      name: {
        first: 'John',
        middle: 'Michael',
        last: 'Doe',
      },
      sex: 'Male',
      dateOfDeath: new Date('2022-01-01'),
      timeOfDeath: undefined,
      dateOfBirth: new Date('2022-01-01'),
      ageAtDeath: {
        years: '0',
        months: '0',
        days: '1',
        hours: '0',
      },
      placeOfDeath: {
        houseNo: '123',
        st: 'Main St',
        barangay: 'Barangay 1',
        cityMunicipality: 'Sample City',
        province: 'Sample Province',
        country: 'Sample Country',
      },
      civilStatus: 'Single',
      religion: 'Religion',
      citizenship: 'Country',
      residence: {
        houseNo: '123',
        st: 'Main St',
        barangay: 'Barangay 1',
        cityMunicipality: 'Sample City',
        province: 'Sample Province',
        country: 'Sample Country',
      },
      occupation: 'Engineer',
      // Parent Information
      parents: {
        fatherName: {
          first: 'Robert',
          middle: 'James',
          last: 'Doe',
        },
        motherName: {
          first: 'Jane',
          middle: 'Alice',
          last: 'Doe',
        },
      },
      // Causes of Death 19b (8 days and over)
      causesOfDeath19b: {
        immediate: {
          cause: 'Cause of Death',
          interval: '1 day',
        },
        antecedent: {
          cause: 'Cause',
          interval: '1 day',
        },
        underlying: {
          cause: 'Underlying cause',
          interval: '2 days',
        },
        otherSignificantConditions: 'No other conditions',
      },
      // Medical Certificate
      medicalCertificate: {
        causesOfDeath: {
          mainDiseaseOfInfant: '',
          otherDiseasesOfInfant: '',
          mainMaternalDisease: '',
          otherMaternalDisease: '',
          otherRelevantCircumstances: '',
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
        externalCauses: {
          mannerOfDeath: '',
          placeOfOccurrence: '',
        },
        attendant: {
          type: 'Private physician',
          othersSpecify: '',
          duration: { from: undefined, to: undefined },
        },
        autopsy: false,
      },
      // Certification of Death
      certificationOfDeath: {
        hasAttended: false,
        signature: undefined,
        nameInPrint: 'Health Officer',
        titleOfPosition: 'Doctor',
        address: {
          houseNo: '123',
          st: 'Main St',
          barangay: 'Barangay 1',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
        date: new Date('2022-01-01'),
        healthOfficerSignature: undefined,
        healthOfficerNameInPrint: 'Health Officer',
      },
      // Review
      reviewedBy: {
        signature: undefined,
        date: undefined,
      },
      // Certificates (optional)
      postmortemCertificate: undefined,
      embalmerCertification: undefined,
      // Delayed Registration (optional)
      delayedRegistration: {
        affiant: {
          name: 'Affiant Name',
          civilStatus: 'Single',
          residenceAddress: 'Affiant Address',
          age: '30',
          signature: undefined,
        },
        deceased: {
          name: 'Deceased Name',
          dateOfDeath: '2022-01-01',
          placeOfDeath: 'Sample City',
          burialInfo: {
            date: '2022-01-02',
            place: 'Cemetery',
            method: 'Buried',
          },
        },
        attendance: {
          wasAttended: true,
          attendedBy: 'Doctor',
        },
        causeOfDeath: 'Cause of Death',
        reasonForDelay: 'Reason for delay',
        affidavitDate: new Date('2022-01-01'),
        affidavitDatePlace: 'Place of Affidavit',
        adminOfficer: {
          signature: undefined,
          position: 'Officer',
        },
        ctcInfo: {
          number: '1234',
          issuedOn: '2022-01-01',
          issuedAt: 'Office',
        },
      },
      // Disposal Information
      corpseDisposal: 'Buried',
      burialPermit: {
        number: '12345',
        dateIssued: new Date('2022-01-01'),
      },
      transferPermit: undefined,
      cemeteryOrCrematory: {
        name: 'Cemetery Name',
        address: {
          houseNo: '456',
          st: 'Cemetery St',
          barangay: 'Barangay 2',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
      },
      // Informant
      informant: {
        signature: undefined,
        nameInPrint: 'Informant Name',
        relationshipToDeceased: 'Relation',
        address: {
          houseNo: '789',
          st: 'Street',
          barangay: 'Barangay 3',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
        date: new Date('2022-01-01'),
      },
      // Processing Information
      preparedBy: {
        signature: undefined,
        nameInPrint: 'Admin User',
        titleOrPosition: 'Registrar',
        date: new Date('2022-01-01'),
      },
      receivedBy: {
        signature: undefined,
        nameInPrint: 'Office Staff',
        titleOrPosition: 'Receiver',
        date: new Date('2022-01-01'),
      },
      registeredByOffice: {
        signature: undefined,
        nameInPrint: 'Registrar Office',
        titleOrPosition: 'Registrar',
        date: new Date('2022-01-01'),
      },
      remarks: 'No remarks',
      // Pagination
      pagination: {
        pageNumber: '1',
        bookNumber: '1',
      },
    },
  });

  const onSubmit = async (data: DeathCertificateFormValues) => {
    try {
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

      const result = await submitDeathCertificateForm(data);

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
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred while submitting the form');
    }
  };

  const handleError = (errors: any) => {
    console.log('Form Validation Errors:', JSON.stringify(errors, null, 2));
    toast.error('Please check form for errors');
  };

  return { formMethods, onSubmit, handleError };
}

// For testing

// import { submitDeathCertificateForm } from '@/hooks/form-certificate-actions';
// import {
//   DeathCertificateFormValues,
//   deathCertificateFormSchema,
// } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';

// interface UseDeathCertificateFormProps {
//   onOpenChange?: (open: boolean) => void;
// }

// export function useDeathCertificateForm({
//   onOpenChange,
// }: UseDeathCertificateFormProps = {}) {
//   const formMethods = useForm<DeathCertificateFormValues>({
//     resolver: zodResolver(deathCertificateFormSchema),
//     mode: 'onChange',
//     reValidateMode: 'onChange',
//     defaultValues: {
//       registryNumber: '2024-0002',
//       province: 'Province A',
//       cityMunicipality: 'City X',
//       // Deceased Information
//       name: {
//         first: 'John',
//         middle: 'A.',
//         last: 'Doe',
//       },
//       sex: 'Male', // must be either 'Male' or 'Female'
//       dateOfDeath: new Date('2023-02-15'),
//       timeOfDeath: new Date('2023-02-15T14:30:00'),
//       dateOfBirth: new Date('1980-01-01'),
//       ageAtDeath: {
//         years: '43',
//         months: '1',
//         days: '14',
//         hours: '0',
//       },
//       placeOfDeath: {
//         houseNo: '123',
//         st: 'Main St',
//         barangay: 'Barangay 1',
//         cityMunicipality: 'City X',
//         province: 'Province A',
//         country: 'Country Y',
//       },
//       civilStatus: 'Married',
//       religion: 'Christianity',
//       citizenship: 'Country Y',
//       residence: {
//         houseNo: '123',
//         st: 'Main St',
//         barangay: 'Barangay 1',
//         cityMunicipality: 'City X',
//         province: 'Province A',
//         country: 'Country Y',
//       },
//       occupation: 'Engineer',
//       // Birth Information
//       birthInformation: {
//         ageOfMother: '35',
//         methodOfDelivery: 'Normal spontaneous vertex',
//         lengthOfPregnancy: 39,
//         typeOfBirth: 'Single',
//         birthOrder: 'First', // allowed: 'First', 'Second', etc.
//       },
//       // Parent Information
//       parents: {
//         fatherName: {
//           first: 'Robert',
//           middle: 'B.',
//           last: 'Doe',
//         },
//         motherName: {
//           first: 'Jane',
//           middle: 'C.',
//           last: 'Doe',
//         },
//       },
//       // Causes of Death 19b (8 days and over)
//       causesOfDeath19b: {
//         immediate: {
//           cause: 'Cardiac arrest',
//           interval: '30 minutes',
//         },
//         antecedent: {
//           cause: 'Heart attack',
//           interval: '1 hour',
//         },
//         underlying: {
//           cause: 'Coronary artery disease',
//           interval: '2 hours',
//         },
//         otherSignificantConditions: 'None',
//       },
//       // Medical Certificate
//       medicalCertificate: {
//         causesOfDeath: {
//           mainDiseaseOfInfant: 'N/A', // not applicable for adult deaths
//           otherDiseasesOfInfant: '',
//           mainMaternalDisease: '',
//           otherMaternalDisease: '',
//           otherRelevantCircumstances: '',
//           immediate: { cause: 'Cardiac arrest', interval: '30 minutes' },
//           antecedent: { cause: 'Heart attack', interval: '1 hour' },
//           underlying: { cause: 'Coronary artery disease', interval: '2 hours' },
//           otherSignificantConditions: 'None',
//         },
//         maternalCondition: {
//           pregnantNotInLabor: false,
//           pregnantInLabor: false,
//           lessThan42Days: false,
//           daysTo1Year: false,
//           noneOfTheAbove: true,
//         },
//         externalCauses: {
//           mannerOfDeath: '',
//           placeOfOccurrence: '',
//         },
//         attendant: {
//           type: 'PRIVATE_PHYSICIAN', // valid options: 'PRIVATE_PHYSICIAN', 'PUBLIC_HEALTH_OFFICER', 'HOSPITAL_AUTHORITY', 'NONE', 'OTHERS'
//           othersSpecify: '',
//           duration: {
//             from: new Date('2023-02-15T14:00:00'),
//             to: new Date('2023-02-15T14:45:00'),
//           },
//         },
//         autopsy: false,
//       },
//       // Certification of Death
//       certificationOfDeath: {
//         hasAttended: true,
//         signature: 'Dr. Signature',
//         nameInPrint: 'Dr. John Doe',
//         titleOfPosition: 'Medical Examiner',
//         address: {
//           houseNo: '456',
//           st: 'Second St',
//           barangay: 'Barangay 2',
//           cityMunicipality: 'City Y',
//           province: 'Province B',
//           country: 'Country Y',
//         },
//         date: new Date('2023-02-16'),
//         healthOfficerSignature: 'Health Officer Sig',
//         healthOfficerNameInPrint: 'Health Officer Name',
//       },
//       // Review
//       reviewedBy: {
//         signature: 'Reviewer Sig',
//         date: new Date('2023-02-16'),
//       },
//       // Certificates
//       postmortemCertificate: {
//         causeOfDeath: 'Cardiac arrest confirmed',
//         signature: 'Postmortem Sig',
//         nameInPrint: 'Postmortem Name',
//         date: new Date('2023-02-16'),
//         titleDesignation: 'Postmortem Officer',
//         address: 'Hospital Address',
//       },
//       embalmerCertification: {
//         nameOfDeceased: 'John Doe',
//         signature: 'Embalmer Sig',
//         nameInPrint: 'Embalmer Name',
//         address: 'Funeral Home Address',
//         titleDesignation: 'Embalmer',
//         licenseNo: 'LIC12345',
//         issuedOn: '2022-01-01',
//         issuedAt: 'Local Authority',
//         expiryDate: '2025-01-01',
//       },
//       // Delayed Registration - pre-filled with sample data
//       delayedRegistration: {
//         affiant: {
//           name: 'Affiant Name',
//           civilStatus: 'Single',
//           residenceAddress: 'Affiant Address',
//           age: '40',
//           signature: 'Affiant Sig',
//         },
//         deceased: {
//           name: 'John Doe',
//           dateOfDeath: '2023-02-15',
//           placeOfDeath: 'City X',
//           burialInfo: {
//             date: '2023-02-17',
//             place: 'Cemetery Y',
//             method: 'Buried',
//           },
//         },
//         attendance: {
//           wasAttended: true,
//           attendedBy: 'Attendant Name',
//         },
//         causeOfDeath: 'Natural',
//         reasonForDelay: 'Administrative delays',
//         affidavitDate: new Date('2023-02-18'),
//         affidavitDatePlace: 'City X',
//         adminOfficer: {
//           signature: 'Admin Sig',
//           position: 'Registrar',
//         },
//         ctcInfo: {
//           number: 'CTC123',
//           issuedOn: '2023-02-18',
//           issuedAt: 'City X',
//         },
//       },
//       // Disposal Information
//       corpseDisposal: 'Burial', // if you need to test embalming, change this to "Embalming"
//       burialPermit: {
//         number: 'BP123456',
//         dateIssued: new Date('2023-02-15'),
//       },
//       transferPermit: {
//         number: 'TP123',
//         dateIssued: new Date('2023-02-15').toISOString(),
//       },
//       cemeteryOrCrematory: {
//         name: 'Cemetery Y',
//         address: {
//           houseNo: '789',
//           st: 'Cemetery St',
//           barangay: 'Barangay 3',
//           cityMunicipality: 'City X', // note: if this differs from placeOfDeath, ensure transferPermit is provided
//           province: 'Province A',
//           country: 'Country Y',
//         },
//       },
//       // Informant
//       informant: {
//         signature: 'Informant Sig',
//         nameInPrint: 'Informant Name',
//         relationshipToDeceased: 'Friend',
//         address: {
//           houseNo: '101',
//           st: 'Informant St',
//           barangay: 'Barangay 4',
//           cityMunicipality: 'City Z',
//           province: 'Province C',
//           country: 'Country Y',
//         },
//         date: new Date('2023-02-16'),
//       },
//       // Processing Information
//       preparedBy: {
//         signature: 'Preparer Sig',
//         nameInPrint: 'Preparer Name',
//         titleOrPosition: 'Officer',
//         date: new Date('2023-02-16'),
//       },
//       receivedBy: {
//         signature: 'Receiver Sig',
//         nameInPrint: 'Receiver Name',
//         titleOrPosition: 'Officer',
//         date: new Date('2023-02-16'),
//       },
//       registeredByOffice: {
//         signature: 'Registrar Sig',
//         nameInPrint: 'Registrar Name',
//         titleOrPosition: 'Registrar',
//         date: new Date('2023-02-16'),
//       },
//       remarks: 'Test remarks',
//     },

//     // defaultValues: {
//     //   registryNumber: '',
//     //   province: '',
//     //   cityMunicipality: '',
//     //   // Deceased Information
//     //   name: {
//     //     first: '',
//     //     middle: '',
//     //     last: '',
//     //   },
//     //   sex: undefined,
//     //   dateOfDeath: undefined,
//     //   timeOfDeath: undefined,
//     //   dateOfBirth: undefined,
//     //   ageAtDeath: {
//     //     years: '',
//     //     months: '',
//     //     days: '',
//     //     hours: '',
//     //   },
//     //   placeOfDeath: {
//     //     houseNo: '',
//     //     st: '',
//     //     barangay: '',
//     //     cityMunicipality: '',
//     //     province: '',
//     //     country: '',
//     //   },
//     //   civilStatus: '',
//     //   religion: '',
//     //   citizenship: '',
//     //   residence: {
//     //     houseNo: '',
//     //     st: '',
//     //     barangay: '',
//     //     cityMunicipality: '',
//     //     province: '',
//     //     country: '',
//     //   },
//     //   occupation: '',
//     //   // Birth Information
//     //   birthInformation: {
//     //     ageOfMother: '',
//     //     methodOfDelivery: 'Normal spontaneous vertex',
//     //     lengthOfPregnancy: undefined,
//     //     typeOfBirth: 'Single',
//     //     birthOrder: undefined,
//     //   },
//     //   // Parent Information
//     //   parents: {
//     //     fatherName: {
//     //       first: '',
//     //       middle: '',
//     //       last: '',
//     //     },
//     //     motherName: {
//     //       first: '',
//     //       middle: '',
//     //       last: '',
//     //     },
//     //   },
//     //   // Causes of Death 19b (8 days and over)
//     //   causesOfDeath19b: {
//     //     immediate: {
//     //       cause: '',
//     //       interval: '',
//     //     },
//     //     antecedent: {
//     //       cause: '',
//     //       interval: '',
//     //     },
//     //     underlying: {
//     //       cause: '',
//     //       interval: '',
//     //     },
//     //     otherSignificantConditions: '',
//     //   },
//     //   // Medical Certificate
//     //   medicalCertificate: {
//     //     causesOfDeath: {
//     //       mainDiseaseOfInfant: '',
//     //       otherDiseasesOfInfant: '',
//     //       mainMaternalDisease: '',
//     //       otherMaternalDisease: '',
//     //       otherRelevantCircumstances: '',
//     //       immediate: { cause: '', interval: '' },
//     //       antecedent: { cause: '', interval: '' },
//     //       underlying: { cause: '', interval: '' },
//     //       otherSignificantConditions: '',
//     //     },
//     //     maternalCondition: {
//     //       pregnantNotInLabor: false,
//     //       pregnantInLabor: false,
//     //       lessThan42Days: false,
//     //       daysTo1Year: false,
//     //       noneOfTheAbove: false,
//     //     },
//     //     externalCauses: {
//     //       mannerOfDeath: '',
//     //       placeOfOccurrence: '',
//     //     },
//     //     attendant: {
//     //       type: undefined,
//     //       othersSpecify: '',
//     //       duration: { from: undefined, to: undefined },
//     //     },
//     //     autopsy: false,
//     //   },
//     //   // Certification of Death
//     //   certificationOfDeath: {
//     //     hasAttended: false,
//     //     signature: '',
//     //     nameInPrint: '',
//     //     titleOfPosition: '',
//     //     address: {
//     //       houseNo: '',
//     //       st: '',
//     //       barangay: '',
//     //       cityMunicipality: '',
//     //       province: '',
//     //       country: '',
//     //     },
//     //     date: undefined,
//     //     healthOfficerSignature: '',
//     //     healthOfficerNameInPrint: '',
//     //   },
//     //   // Review
//     //   reviewedBy: {
//     //     signature: '',
//     //     date: undefined,
//     //   },
//     //   // Certificates
//     //   postmortemCertificate: undefined,
//     //   embalmerCertification: undefined,
//     //   // Delayed Registration - pre-filled with blank defaults
//     //   delayedRegistration: {
//     //     affiant: {
//     //       name: '',
//     //       civilStatus: 'Single',
//     //       residenceAddress: '',
//     //       age: '',
//     //       signature: '',
//     //     },
//     //     deceased: {
//     //       name: '',
//     //       dateOfDeath: '',
//     //       placeOfDeath: '',
//     //       burialInfo: {
//     //         date: '',
//     //         place: '',
//     //         method: undefined,
//     //       },
//     //     },
//     //     attendance: {
//     //       wasAttended: false,
//     //       attendedBy: '',
//     //     },
//     //     causeOfDeath: '',
//     //     reasonForDelay: '',
//     //     affidavitDate: undefined,
//     //     affidavitDatePlace: '',
//     //     adminOfficer: {
//     //       signature: '',
//     //       position: '',
//     //     },
//     //     ctcInfo: {
//     //       number: '',
//     //       issuedOn: '',
//     //       issuedAt: '',
//     //     },
//     //   },
//     //   // Disposal Information
//     //   corpseDisposal: '',
//     //   burialPermit: {
//     //     number: '',
//     //     dateIssued: undefined,
//     //   },
//     //   transferPermit: undefined,
//     //   cemeteryOrCrematory: {
//     //     name: '',
//     //     address: {
//     //       houseNo: '',
//     //       st: '',
//     //       barangay: '',
//     //       cityMunicipality: '',
//     //       province: '',
//     //       country: '',
//     //     },
//     //   },
//     //   // Informant
//     //   informant: {
//     //     signature: '',
//     //     nameInPrint: '',
//     //     relationshipToDeceased: '',
//     //     address: {
//     //       houseNo: '',
//     //       st: '',
//     //       barangay: '',
//     //       cityMunicipality: '',
//     //       province: '',
//     //       country: '',
//     //     },
//     //     date: undefined,
//     //   },
//     //   // Processing Information
//     //   preparedBy: {
//     //     signature: '',
//     //     nameInPrint: '',
//     //     titleOrPosition: '',
//     //     date: undefined,
//     //   },
//     //   receivedBy: {
//     //     signature: '',
//     //     nameInPrint: '',
//     //     titleOrPosition: '',
//     //     date: undefined,
//     //   },
//     //   registeredByOffice: {
//     //     signature: '',
//     //     nameInPrint: '',
//     //     titleOrPosition: '',
//     //     date: undefined,
//     //   },
//     //   remarks: '',
//     // },
//   });

//   const onSubmit = async (data: DeathCertificateFormValues) => {
//     try {
//       await submitDeathCertificateForm(data);
//       toast.success('Form submitted successfully');
//       onOpenChange?.(false);
//     } catch {
//       toast.error('Submission failed, please try again');
//     }
//   };

//   const handleError = (errors: any) => {
//     console.error('Validation Errors:', errors);
//     toast.error('Please check form for errors');
//   };

//   return { formMethods, onSubmit, handleError };
// }
