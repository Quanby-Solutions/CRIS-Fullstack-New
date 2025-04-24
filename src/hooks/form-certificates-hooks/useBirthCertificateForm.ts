

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
          time: '10:30 AM',

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