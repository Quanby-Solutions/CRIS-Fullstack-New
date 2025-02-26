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
      registryNumber: '',
      province: '',
      cityMunicipality: '',
      // Deceased Information
      name: {
        first: 'John',
        middle: 'Michael',
        last: 'Doe',
      },
      sex: 'Male',
      dateOfDeath: new Date('2022-01-01'),
      timeOfDeath: new Date('2022-01-01T12:00:00'),
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
          cause: 'Acute myocardial infarction',
          interval: 'Within hours',
        },
        antecedent: {
          cause: 'Coronary artery disease',
          interval: 'Several days',
        },
        underlying: {
          cause: 'Atherosclerosis',
          interval: 'Chronic',
        },
        otherSignificantConditions: 'None',
      },
      // Medical Certificate
      medicalCertificate: {
        // Use the standard (non-infant) branch
        causesOfDeath: {
          immediate: {
            cause: 'Acute myocardial infarction',
            interval: 'Within hours',
          },
          antecedent: {
            cause: 'Coronary artery disease',
            interval: 'Several days',
          },
          underlying: {
            cause: 'Atherosclerosis',
            interval: 'Chronic',
          },
          otherSignificantConditions: 'None',
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
          duration: {
            from: new Date('2022-01-01T10:00:00'),
            to: new Date('2022-01-01T11:00:00'),
          },
          certification: {
            time: new Date('2022-01-01T12:00:00'),
            signature: 'base64-attendant-certification', // placeholder base64 string
            name: 'Dr. Attendant',
            title: 'Physician',
            address: {
              houseNo: '321',
              st: 'Secondary St',
              barangay: 'Barangay 2',
              cityMunicipality: 'Sample City',
              province: 'Sample Province',
              country: 'Sample Country',
            },
            date: new Date('2022-01-01'),
          },
        },
        autopsy: false,
      },
      // Certification of Death
      certificationOfDeath: {
        hasAttended: false,
        signature: 'base64-certification-signature', // placeholder base64 string
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
        healthOfficerSignature: 'base64-health-officer-signature', // placeholder
        healthOfficerNameInPrint: 'Health Officer',
      },
      // Review
      reviewedBy: {
        signature: 'base64-review-signature', // placeholder
        date: new Date('2022-01-01'),
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
          signature: 'base64-affidavit-signature', // placeholder
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
          signature: 'base64-admin-signature', // placeholder
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
        signature: 'base64-informant-signature', // placeholder
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
        signature: 'base64-prepared-signature', // placeholder
        nameInPrint: 'Admin User',
        titleOrPosition: 'Registrar',
        date: new Date('2022-01-01'),
      },
      receivedBy: {
        signature: 'base64-received-signature', // placeholder
        nameInPrint: 'Office Staff',
        titleOrPosition: 'Receiver',
        date: new Date('2022-01-01'),
      },
      registeredByOffice: {
        signature: 'base64-registered-signature', // placeholder
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
