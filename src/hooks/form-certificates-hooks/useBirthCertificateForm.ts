

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
    defaultValues:
    {
      registryNumber: '',
      province: '',
      cityMunicipality: '',
      childInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        sex: 'Male',
        dateOfBirth: undefined,
        placeOfBirth: {
          hospital: '',
          cityMunicipality: '',
          province: '',
        },
        typeOfBirth: '',
        birthOrder: '',
        weightAtBirth: '',
      },
      motherInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        citizenship: '',
        religion: '',
        occupation: '',
        age: '',
        totalChildrenBornAlive: '',
        childrenStillLiving: '',
        childrenNowDead: '',
        residence: {
          houseNo: '',
          st: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          country: '',
        },
      },
      fatherInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        citizenship: '',
        religion: '',
        occupation: '',
        age: '',
        residence: {
          houseNo: '',
          st: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          country: '',
        },
      },
      parentMarriage: {
        date: undefined,
        place: {
          houseNo: '',
          st: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          country: '',
        },
      },
      attendant: {
        type: '',
        certification: {
          time: '',
          name: '',
          title: '',
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
      },
      informant: {
        name: '',
        relationship: '',
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
      hasAffidavitOfPaternity: false,
      affidavitOfPaternityDetails: undefined,
      isDelayedRegistration: false,
      affidavitOfDelayedRegistration: undefined,
      remarks: '',
      pagination: {
        pageNumber: '',
        bookNumber: '',
      }
    }
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