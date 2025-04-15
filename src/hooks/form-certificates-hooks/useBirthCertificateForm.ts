// useBirthCertificateForm.ts

// import { submitBirthCertificateForm } from '@/app/actions/certificate-actions/birth-certificate-actions';
// import {
//   BirthCertificateFormValues,
//   birthCertificateFormSchema,
// } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';

// interface UseBirthCertificateFormProps {
//   onOpenChange?: (open: boolean) => void;
// }

// export function useBirthCertificateForm({
//   onOpenChange,
// }: UseBirthCertificateFormProps = {}) {
//   const formMethods = useForm<BirthCertificateFormValues>({
//     resolver: zodResolver(birthCertificateFormSchema),
//     mode: 'onChange',
//     reValidateMode: 'onChange',
//     defaultValues: {
//       registryNumber: '',
//       province: '',
//       cityMunicipality: '',
//       childInfo: {
//         firstName: '',
//         middleName: '',
//         lastName: '',
//         sex: undefined,
//         dateOfBirth: undefined,
//         placeOfBirth: {
//           hospital: '',
//           cityMunicipality: '',
//           province: '',
//         },
//         typeOfBirth: undefined,
//         birthOrder: '',
//         weightAtBirth: '',
//       },
//       motherInfo: {
//         firstName: '',
//         middleName: '',
//         lastName: '',
//         citizenship: '',
//         religion: '',
//         occupation: '',
//         age: '',
//         totalChildrenBornAlive: '',
//         childrenStillLiving: '',
//         childrenNowDead: '',
//         residence: {
//           houseNo: '',
//           st: '',
//           barangay: '',
//           cityMunicipality: '',
//           province: '',
//           country: '',
//         },
//       },
//       fatherInfo: {
//         firstName: '',
//         middleName: '',
//         lastName: '',
//         citizenship: '',
//         religion: '',
//         occupation: '',
//         age: '',
//         residence: {
//           houseNo: '',
//           st: '',
//           barangay: '',
//           cityMunicipality: '',
//           province: '',
//           country: '',
//         },
//       },
//       parentMarriage: {
//         date: undefined,
//         place: {
//           houseNo: '',
//           st: '',
//           barangay: '',
//           cityMunicipality: '',
//           province: '',
//           country: '',
//         },
//       },
//       attendant: {
//         type: undefined,
//         certification: {
//           time: undefined,
//           signature: undefined,
//           name: '',
//           title: '',
//           address: {
//             houseNo: '',
//             st: '',
//             barangay: '',
//             cityMunicipality: '',
//             province: '',
//             country: '',
//           },
//           date: undefined,
//         },
//       },
//       informant: {
//         signature: undefined,
//         name: '',
//         relationship: '',
//         address: {
//           houseNo: '',
//           st: '',
//           barangay: '',
//           cityMunicipality: '',
//           province: '',
//           country: '',
//         },
//         date: undefined,
//       },
//       preparedBy: {
//         signature: undefined,
//         nameInPrint: '',
//         titleOrPosition: '',
//         date: undefined,
//       },
//       receivedBy: {
//         signature: undefined,
//         nameInPrint: '',
//         titleOrPosition: '',
//         date: undefined,
//       },
//       registeredByOffice: {
//         signature: undefined,
//         nameInPrint: '',
//         titleOrPosition: '',
//         date: undefined,
//       },
//       hasAffidavitOfPaternity: false,
//       isDelayedRegistration: false,
//       remarks: '',
//       // Added pagination default values
//       pagination: {
//         pageNumber: '',
//         bookNumber: '',
//       },
//     },
//   });

//   const onSubmit = async (data: BirthCertificateFormValues) => {
//     try {
//       const result = await submitBirthCertificateForm(data);

//       if ('data' in result) {
//         console.log('Submission successful:', result);
//         toast.success(
//           `Birth certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
//         );
//         onOpenChange?.(false);
//       } else if ('error' in result) {
//         console.log('Submission error:', result.error);
//         const errorMessage = result.error.includes('No user found with name')
//           ? 'Invalid prepared by user. Please check the name.'
//           : result.error;
//         toast.error(errorMessage);
//       }
//       formMethods.reset();
//     } catch (error) {
//       console.error('Form submission error:', error);
//       toast.error('An unexpected error occurred while submitting the form');
//     }
//   };

//   const handleError = (errors: any) => {
//     console.log('Form Validation Errors:', JSON.stringify(errors, null, 2));

//     if (errors.registryNumber || errors.province || errors.cityMunicipality) {
//       console.log('Registry Information Errors:', {
//         registryNumber: errors.registryNumber?.message,
//         province: errors.province?.message,
//         cityMunicipality: errors.cityMunicipality?.message,
//       });
//       toast.error('Please check registry information');
//     }

//     if (errors.childInfo) {
//       console.log('Child Information Errors:', errors.childInfo);
//     }

//     if (errors.motherInfo) {
//       console.log('Mother Information Errors:', errors.motherInfo);
//     }

//     if (errors.fatherInfo) {
//       console.log('Father Information Errors:', errors.fatherInfo);
//     }

//     if (errors.attendant) {
//       console.log('Attendant Information Errors:', errors.attendant);
//     }

//     if (errors.informant) {
//       console.log('Informant Information Errors:', errors.informant);
//     }

//     if (errors.preparedBy || errors.receivedBy || errors.registeredByOffice) {
//       console.log('Processing Details Errors:', {
//         preparedBy: errors.preparedBy,
//         receivedBy: errors.receivedBy,
//         registeredByOffice: errors.registeredByOffice,
//       });
//     }

//     toast.error('Please check form for errors');
//   };

//   return { formMethods, onSubmit, handleError };
// }

// import { submitBirthCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/birth-certificate-actions'
// import {
//   BirthCertificateFormValues,
//   birthCertificateFormSchema,
// } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema'
// import { fileToBase64 } from '@/lib/utils/fileToBase64'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
// import { Permission } from '@prisma/client'
// import { notifyUsersWithPermission } from '../users-action'

// interface UseBirthCertificateFormProps {
//   onOpenChange?: (open: boolean) => void
//   defaultValues?: Partial<BirthCertificateFormValues>
// }

// export function useBirthCertificateForm({
//   onOpenChange,
//   defaultValues,
// }: UseBirthCertificateFormProps = {}) {

//   const formMethods = useForm<BirthCertificateFormValues>({
//     resolver: zodResolver(birthCertificateFormSchema),
//     mode: 'onChange',
//     reValidateMode: 'onChange',
//     defaultValues: {
//       registryNumber: '2022-12345',
//       province: 'Sample Province',
//       cityMunicipality: 'Sample City',
//       childInfo: {
//         firstName: 'John',
//         middleName: 'Michael',
//         lastName: 'Doe',
//         sex: 'Male',
//         dateOfBirth: new Date('2022-01-01'),
//         placeOfBirth: {
//           hospital: 'Sample Hospital',
//           cityMunicipality: 'Sample City',
//           province: 'Sample Province',
//         },
//         typeOfBirth: 'Single',
//         birthOrder: '1',
//         weightAtBirth: '3.5',
//       },
//       motherInfo: {
//         firstName: 'Jane',
//         middleName: 'Alice',
//         lastName: 'Doe',
//         citizenship: 'Sample Country',
//         religion: 'Sample Religion',
//         occupation: 'Engineer',
//         age: '30',
//         totalChildrenBornAlive: '1',
//         childrenStillLiving: '1',
//         childrenNowDead: '0',
//         residence: {
//           houseNo: '123',
//           st: 'Main St',
//           barangay: 'Barangay 1',
//           cityMunicipality: 'Sample City',
//           province: 'Sample Province',
//           country: 'Sample Country',
//         },
//       },
//       fatherInfo: {
//         firstName: 'Robert',
//         middleName: 'James',
//         lastName: 'Doe',
//         citizenship: 'Sample Country',
//         religion: 'Sample Religion',
//         occupation: 'Doctor',
//         age: '32',
//         residence: {
//           houseNo: '123',
//           st: 'Main St',
//           barangay: 'Barangay 1',
//           cityMunicipality: 'Sample City',
//           province: 'Sample Province',
//           country: 'Sample Country',
//         },
//       },
//       parentMarriage: {
//         date: new Date('2020-06-15'),
//         place: {
//           houseNo: '456',
//           st: 'Second St',
//           barangay: 'Barangay 2',
//           cityMunicipality: 'Sample City',
//           province: 'Sample Province',
//           country: 'Sample Country',
//         },
//       },
//       attendant: {
//         type: 'Physician',
//         certification: {
//           time: new Date('2022-01-01T10:00:00'),
//           signature: undefined,
//           name: 'Dr. Smith',
//           title: 'Chief Physician',
//           address: {
//             houseNo: '789',
//             st: 'Third St',
//             barangay: 'Barangay 3',
//             cityMunicipality: 'Sample City',
//             province: 'Sample Province',
//             country: 'Sample Country',
//           },
//           date: new Date('2022-01-01'),
//         },
//       },
//       informant: {
//         signature: undefined,
//         name: 'Emily Doe',
//         relationship: 'Mother',
//         address: {
//           houseNo: '123',
//           st: 'Main St',
//           barangay: 'Barangay 1',
//           cityMunicipality: 'Sample City',
//           province: 'Sample Province',
//           country: 'Sample Country',
//         },
//         date: new Date('2022-01-01'),
//       },
//       preparedBy: {
//         // signature: undefined,
//         nameInPrint: 'Admin User',
//         titleOrPosition: 'Registrar',
//         date: new Date('2022-01-02'),
//       },
//       receivedBy: {
//         // signature: undefined,
//         nameInPrint: 'Office Staff',
//         titleOrPosition: 'Receiver',
//         date: new Date('2022-01-02'),
//       },
//       registeredByOffice: {
//         // signature: undefined,
//         nameInPrint: 'Registrar Office',
//         titleOrPosition: 'Registrar',
//         date: new Date('2022-01-03'),
//       },
//       hasAffidavitOfPaternity: false,
//       affidavitOfPaternityDetails: null,
//       isDelayedRegistration: false,
//       affidavitOfDelayedRegistration: null,
//       remarks: 'No remarks',
//       pagination: {
//         pageNumber: '1',
//         bookNumber: '1',
//       },
//       ...defaultValues,
//     },
//   })

//   const onSubmit = async (data: BirthCertificateFormValues) => {
//     try {
//       // Convert signature fields if needed
//       if (data.attendant.certification.signature instanceof File) {
//         data.attendant.certification.signature = await fileToBase64(
//           data.attendant.certification.signature
//         )
//       }
//       if (data.informant.signature instanceof File) {
//         data.informant.signature = await fileToBase64(data.informant.signature)
//       }
// if (data.preparedBy.signature instanceof File) {
//   data.preparedBy.signature = await fileToBase64(
//     data.preparedBy.signature
//   )
// }
// if (data.receivedBy.signature instanceof File) {
//   data.receivedBy.signature = await fileToBase64(
//     data.receivedBy.signature
//   )
// }
// if (data.registeredByOffice.signature instanceof File) {
//   data.registeredByOffice.signature = await fileToBase64(
//     data.registeredByOffice.signature
//   )
// }

//       const result = await submitBirthCertificateForm(data)

//       if ('data' in result) {
//         console.log('Submission successful:', result)
//         toast.success(
//           `Birth certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
//         )

//         const documentRead = Permission.DOCUMENT_READ
//         const Title = "New uploaded Birth Certificate"
//         const message = `New Birth Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`
//         notifyUsersWithPermission(documentRead, Title, message)

//         onOpenChange?.(false)
//       } else if ('error' in result) {
//         console.log('Submission error:', result.error)
//         const errorMessage = result.error.includes('No user found with name')
//           ? 'Invalid prepared by user. Please check the name.'
//           : result.error
//         toast.error(errorMessage)
//       }
//       formMethods.reset()
//     } catch (error) {
//       console.error('Form submission error:', error)
//       toast.error('An unexpected error occurred while submitting the form')
//     }
//   }

//   const handleError = (errors: any) => {
//     console.log('Form Validation Errors:', JSON.stringify(errors, null, 2))
//     toast.error('Please check form for errors')
//   }

//   return { formMethods, onSubmit, handleError }
// }



// src\hooks\form-certificates-hooks\useBirthCertificateForm.ts
import { submitBirthCertificateForm } from '@/components/custom/civil-registry/actions/certificate-actions/birth-certificate-actions';
import {
  BirthCertificateFormValues,
  birthCertificateFormSchema,
} from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Permission } from '@prisma/client';
import { notifyUsersWithPermission } from '../users-action';

interface UseBirthCertificateFormProps {
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<BirthCertificateFormValues>;
}

export function useBirthCertificateForm({
  onOpenChange,
  defaultValues,
}: UseBirthCertificateFormProps = {}) {
  const formMethods = useForm<BirthCertificateFormValues>({
    resolver: zodResolver(birthCertificateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      registryNumber: '2022-12345',
      province: 'Sample Province',
      cityMunicipality: 'Sample City',
      childInfo: {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        sex: 'Male',
        dateOfBirth: new Date('2022-01-01'),
        placeOfBirth: {
          hospital: 'Sample Hospital',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
        },
        typeOfBirth: 'Single',
        birthOrder: '1',
        weightAtBirth: '3.5',
      },
      motherInfo: {
        firstName: 'Jane',
        middleName: 'Alice',
        lastName: 'Doe',
        citizenship: 'Sample Country',
        religion: 'Sample Religion',
        occupation: 'Engineer',
        age: '30',
        totalChildrenBornAlive: '1',
        childrenStillLiving: '1',
        childrenNowDead: '0',
        residence: {
          houseNo: '123',
          st: 'Main St',
          barangay: 'Barangay 1',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
      },
      fatherInfo: {
        firstName: 'Robert',
        middleName: 'James',
        lastName: 'Doe',
        citizenship: 'Sample Country',
        religion: 'Sample Religion',
        occupation: 'Doctor',
        age: '32',
        residence: {
          houseNo: '123',
          st: 'Main St',
          barangay: 'Barangay 1',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
      },
      parentMarriage: {
        date: new Date('2020-06-15'),
        place: {
          houseNo: '456',
          st: 'Second St',
          barangay: 'Barangay 2',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
      },
      attendant: {
        type: 'Physician',
        certification: {
          time: new Date('2022-01-01T10:00:00'),

          name: 'Dr. Smith',
          title: 'Chief Physician',
          address: {
            houseNo: '789',
            st: 'Third St',
            barangay: 'Barangay 3',
            cityMunicipality: 'Sample City',
            province: 'Sample Province',
            country: 'Sample Country',
          },
          date: new Date('2022-01-01'),
        },
      },
      informant: {

        name: 'Emily Doe',
        relationship: 'Mother',
        address: {
          houseNo: '123',
          st: 'Main St',
          barangay: 'Barangay 1',
          cityMunicipality: 'Sample City',
          province: 'Sample Province',
          country: 'Sample Country',
        },
        date: new Date('2022-01-01'),
      },
      preparedBy: {
        nameInPrint: 'Admin User',
        titleOrPosition: 'Registrar',
        date: new Date('2022-01-02'),
      },
      receivedBy: {
        nameInPrint: 'Office Staff',
        titleOrPosition: 'Receiver',
        date: new Date('2022-01-02'),
      },
      registeredByOffice: {
        nameInPrint: 'Registrar Office',
        titleOrPosition: 'Registrar',
        date: new Date('2022-01-03'),
      },
      hasAffidavitOfPaternity: false,
      affidavitOfPaternityDetails: undefined,
      isDelayedRegistration: false,
      affidavitOfDelayedRegistration: undefined,
      remarks: 'No remarks',
      pagination: {
        pageNumber: '1',
        bookNumber: '1',
      },
      ...defaultValues,
    },
  });

  const onSubmit = async (data: BirthCertificateFormValues) => {
    try {
      // Explicitly set signatures to null since they’re hidden in the UI
      const updatedData = {
        ...data,
        attendant: {
          ...(data.attendant || {}),
          certification: {
            ...(data.attendant?.certification || {}),
            signature: null,
          },
        },
        informant: {
          ...data.informant,
          signature: null,
        },
      };

      const result = await submitBirthCertificateForm(updatedData);

      if ('data' in result) {
        console.log('Submission successful:', result);
        toast.success(
          `Birth certificate submitted successfully (Book ${result.data.bookNumber}, Page ${result.data.pageNumber})`
        );
        const documentRead = Permission.DOCUMENT_READ;
        const Title = "New uploaded Birth Certificate";
        const message = `New Birth Certificate with the details (Book ${result.data.bookNumber}, Page ${result.data.pageNumber}, Registry Number ${data.registryNumber}) has been uploaded.`;
        notifyUsersWithPermission(documentRead, Title, message);
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