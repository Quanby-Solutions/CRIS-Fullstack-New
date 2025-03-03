'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BaseRegistryFormWithRelations } from '@/hooks/civil-registry-action';
import { useBirthCertificateForm } from '@/hooks/form-certificates-hooks/useBirthCertificateForm';
import type { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import { FormType } from '@prisma/client';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import DelayedRegistrationForm from '../../../forms/certificates/form-cards/birth-cards/affidavit-for-delayed-registration';
import AffidavitOfPaternityForm from '../../../forms/certificates/form-cards/birth-cards/affidavit-of-paternity';
import AttendantInformationCard from '../../../forms/certificates/form-cards/birth-cards/attendant-information';
import CertificationOfInformantCard from '../../../forms/certificates/form-cards/birth-cards/certification-of-informant';
import ChildInformationCard from '../../../forms/certificates/form-cards/birth-cards/child-information-card';
import FatherInformationCard from '../../../forms/certificates/form-cards/birth-cards/father-information-card';
import MarriageInformationCard from '../../../forms/certificates/form-cards/birth-cards/marriage-parents-card';
import MotherInformationCard from '../../../forms/certificates/form-cards/birth-cards/mother-information-card';
import { PaginationInputs } from '../../../forms/certificates/form-cards/shared-components/pagination-inputs';
import {
  PreparedByCard,
  ReceivedByCard,
  RegisteredAtOfficeCard,
} from '../../../forms/certificates/form-cards/shared-components/processing-details-cards';
import RegistryInformationCard from '../../../forms/certificates/form-cards/shared-components/registry-information-card';
import RemarksCard from '../../../forms/certificates/form-cards/shared-components/remarks-card';

interface EditCivilRegistryFormInlineProps {
  form: BaseRegistryFormWithRelations;
  onSaveAction: (updatedForm: BaseRegistryFormWithRelations) => Promise<void>;
  editType: 'BIRTH' | 'DEATH' | 'MARRIAGE';
}

interface ChildName {
  first: string;
  middle: string;
  last: string;
}

interface MotherName {
  first: string;
  middle: string;
  last: string;
}

interface FatherName {
  first: string;
  middle: string;
  last: string;
}

interface PlaceOfBirth {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
  hospital: string;
}

interface MotherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface FatherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface MarriagePlace {
  houseNo: string;
  st: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface ParentMarriage {
  date: Date;
  place: MarriagePlace;
}

type PreparedBy = string | {
  name: string;
  signature?: string;
  titleOrPosition?: string;
};

export function EditBirthCivilRegistryFormInline({
  form,
  onSaveAction,
  editType,
}: EditCivilRegistryFormInlineProps) {
  const { t } = useTranslation();

  // Helper function to safely parse dates
  const parseDateSafely = (dateValue: Date | null): Date => {
    if (!dateValue) return new Date();
    return dateValue;
  };

  // Utility: parse raw residence if provided as JSON string
  const parseResidence = (rawResidence: unknown): any => {
    if (typeof rawResidence === 'string') {
      try {
        return JSON.parse(rawResidence);
      } catch {
        return {};
      }
    }
    return rawResidence;
  };

  // Map the form data to the certificate values with proper type guarding.
  const mapToBirthCertificateValues = (
    form: BaseRegistryFormWithRelations
  ): Partial<BirthCertificateFormValues> => {
    // Child name
    const rawChildName = form.birthCertificateForm?.childName;
    let childName: ChildName = { first: '', middle: '', last: '' };
    if (
      rawChildName &&
      typeof rawChildName === 'object' &&
      !Array.isArray(rawChildName) &&
      'first' in rawChildName &&
      'middle' in rawChildName &&
      'last' in rawChildName
    ) {
      childName = rawChildName as unknown as ChildName;
    }

    // Mother name
    const rawMotherName = form.birthCertificateForm?.motherMaidenName;
    let motherName: MotherName = { first: '', middle: '', last: '' };
    if (
      rawMotherName &&
      typeof rawMotherName === 'object' &&
      !Array.isArray(rawMotherName) &&
      'first' in rawMotherName &&
      'middle' in rawMotherName &&
      'last' in rawMotherName
    ) {
      motherName = rawMotherName as unknown as MotherName;
    }

    // Father name
    const rawFatherName = form.birthCertificateForm?.fatherName;
    let fatherName: FatherName = { first: '', middle: '', last: '' };
    if (
      rawFatherName &&
      typeof rawFatherName === 'object' &&
      !Array.isArray(rawFatherName) &&
      'first' in rawFatherName &&
      'middle' in rawFatherName &&
      'last' in rawFatherName
    ) {
      fatherName = rawFatherName as unknown as FatherName;
    }

    // Place of Birth mapping
    const rawPlaceOfBirth = form.birthCertificateForm?.placeOfBirth;
    let placeOfBirth: PlaceOfBirth = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
      hospital: '',
    };
    if (
      rawPlaceOfBirth &&
      typeof rawPlaceOfBirth === 'object' &&
      !Array.isArray(rawPlaceOfBirth)
    ) {
      placeOfBirth = {
        houseNo:
          typeof rawPlaceOfBirth.houseNo === 'string'
            ? rawPlaceOfBirth.houseNo
            : '',
        street:
          typeof rawPlaceOfBirth.street === 'string'
            ? rawPlaceOfBirth.street
            : '',
        barangay:
          typeof rawPlaceOfBirth.barangay === 'string'
            ? rawPlaceOfBirth.barangay
            : '',
        cityMunicipality:
          typeof rawPlaceOfBirth.cityMunicipality === 'string'
            ? rawPlaceOfBirth.cityMunicipality
            : '',
        province:
          typeof rawPlaceOfBirth.province === 'string'
            ? rawPlaceOfBirth.province
            : '',
        country:
          typeof rawPlaceOfBirth.country === 'string'
            ? rawPlaceOfBirth.country
            : '',
        hospital:
          typeof rawPlaceOfBirth.hospital === 'string'
            ? rawPlaceOfBirth.hospital
            : '',
      };
    }

    // Sex
    const rawSex = form.birthCertificateForm?.sex;
    const sex: 'Male' | 'Female' =
      rawSex === 'Male' || rawSex === 'Female' ? rawSex : 'Male';

    // Date of birth
    const rawDateOfBirth = form.birthCertificateForm?.dateOfBirth;
    const dateOfBirth: Date = rawDateOfBirth
      ? new Date(rawDateOfBirth)
      : new Date();

    // Type of birth
    const rawTypeOfBirth = form.birthCertificateForm?.typeOfBirth;
    const typeOfBirth: 'Single' | 'Twin' | 'Triplet' | 'Others' =
      rawTypeOfBirth === 'Single' ||
      rawTypeOfBirth === 'Twin' ||
      rawTypeOfBirth === 'Triplet' ||
      rawTypeOfBirth === 'Others'
        ? rawTypeOfBirth
        : 'Single';

    // Weight at birth
    const rawWeightAtBirth = form.birthCertificateForm?.weightAtBirth;
    const weightAtBirth: string =
      typeof rawWeightAtBirth === 'number'
        ? rawWeightAtBirth.toString()
        : rawWeightAtBirth || '';

    // Mother residence mapping (check for raw JSON string and support both "street" and "st")
    let rawMotherResidence = form.birthCertificateForm?.motherResidence;
    rawMotherResidence = parseResidence(rawMotherResidence);
    let motherResidence: MotherResidence = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    };
    if (
      rawMotherResidence &&
      typeof rawMotherResidence === 'object' &&
      !Array.isArray(rawMotherResidence)
    ) {
      motherResidence = {
        houseNo:
          typeof rawMotherResidence.houseNo === 'string'
            ? rawMotherResidence.houseNo
            : '',
        street:
          typeof rawMotherResidence.street === 'string'
            ? rawMotherResidence.street
            : typeof rawMotherResidence.st === 'string'
            ? rawMotherResidence.st
            : '',
        barangay:
          typeof rawMotherResidence.barangay === 'string'
            ? rawMotherResidence.barangay
            : '',
        cityMunicipality:
          typeof rawMotherResidence.cityMunicipality === 'string'
            ? rawMotherResidence.cityMunicipality
            : '',
        province:
          typeof rawMotherResidence.province === 'string'
            ? rawMotherResidence.province
            : '',
        country:
          typeof rawMotherResidence.country === 'string'
            ? rawMotherResidence.country
            : '',
      };
    }

    // Father residence mapping (similar handling)
    let rawFatherResidence = form.birthCertificateForm?.fatherResidence;
    rawFatherResidence = parseResidence(rawFatherResidence);
    let fatherResidence: FatherResidence = {
      houseNo: '',
      street: '',
      barangay: '',
      cityMunicipality: '',
      province: '',
      country: '',
    };
    if (
      rawFatherResidence &&
      typeof rawFatherResidence === 'object' &&
      !Array.isArray(rawFatherResidence)
    ) {
      fatherResidence = {
        houseNo:
          typeof rawFatherResidence.houseNo === 'string'
            ? rawFatherResidence.houseNo
            : '',
        street:
          typeof rawFatherResidence.street === 'string'
            ? rawFatherResidence.street
            : typeof rawFatherResidence.st === 'string'
            ? rawFatherResidence.st
            : '',
        barangay:
          typeof rawFatherResidence.barangay === 'string'
            ? rawFatherResidence.barangay
            : '',
        cityMunicipality:
          typeof rawFatherResidence.cityMunicipality === 'string'
            ? rawFatherResidence.cityMunicipality
            : '',
        province:
          typeof rawFatherResidence.province === 'string'
            ? rawFatherResidence.province
            : '',
        country:
          typeof rawFatherResidence.country === 'string'
            ? rawFatherResidence.country
            : '',
      };
    }

    // Validate multipleBirthOrder against allowed literals.
    const validBirthOrders = ['First', 'Second', 'Third'] as const;
    const rawMultipleBirthOrder = form.birthCertificateForm?.multipleBirthOrder;
    const multipleBirthOrder: 'First' | 'Second' | 'Third' | undefined =
      validBirthOrders.includes(rawMultipleBirthOrder as any)
        ? (rawMultipleBirthOrder as 'First' | 'Second' | 'Third')
        : undefined;

    // Parent marriage extraction.
    const rawParentMarriage = form.birthCertificateForm?.parentMarriage;
    let parentMarriage: ParentMarriage = {
      date: new Date(),
      place: {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      },
    };
    if (
      rawParentMarriage &&
      typeof rawParentMarriage === 'object' &&
      !Array.isArray(rawParentMarriage) &&
      'date' in rawParentMarriage &&
      'place' in rawParentMarriage
    ) {
      const pm = rawParentMarriage as any;
      const pmDate = pm.date ? new Date(pm.date) : new Date();
      let pmPlace: MarriagePlace = {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      };
      const rawPMPlace = pm.place;
      if (
        rawPMPlace &&
        typeof rawPMPlace === 'object' &&
        !Array.isArray(rawPMPlace) &&
        'houseNo' in rawPMPlace &&
        'street' in rawPMPlace &&
        'barangay' in rawPMPlace &&
        'cityMunicipality' in rawPMPlace &&
        'province' in rawPMPlace &&
        'country' in rawPMPlace
      ) {
        pmPlace = rawPMPlace as unknown as MarriagePlace;
      }
      parentMarriage = { date: pmDate, place: pmPlace };
    }

    // Validate and transform rawParentMarriage
    if (
      rawParentMarriage &&
      typeof rawParentMarriage === 'object' &&
      !Array.isArray(rawParentMarriage) &&
      'date' in rawParentMarriage &&
      'place' in rawParentMarriage
    ) {
      const pm = rawParentMarriage as any;
      const pmDate = pm.date ? new Date(pm.date) : new Date();
      const rawPMPlace = pm.place;

      if (
        rawPMPlace &&
        typeof rawPMPlace === 'object' &&
        !Array.isArray(rawPMPlace)
      ) {
        // Ensure all properties exist, using fallback values if necessary
        const pmPlace: MarriagePlace = {
          houseNo: rawPMPlace.houseNo ?? '',
          st: rawPMPlace.st ?? '', // Mapping "st" to "street"
          barangay: rawPMPlace.barangay ?? '',
          cityMunicipality: rawPMPlace.cityMunicipality ?? '',
          province: rawPMPlace.province ?? '',
          country: rawPMPlace.country ?? '',
        };

        parentMarriage = { date: pmDate, place: pmPlace };
      }
    }

    // Attendant extraction
    // Attendant extraction
    const rawAttendant = form.birthCertificateForm?.attendant;

    // Default structure
    let attendant: {
      type: 'Others' | 'Physician' | 'Nurse' | 'Midwife' | 'Hilot';
      certification: {
        date: Date;
        time: Date;
        signature: string | File;
        name: string;
        title: string;
        address: {
          houseNo: string;
          st: string;
          barangay: string;
          cityMunicipality: string;
          province: string;
          country: string;
        };
      };
    } = {
      type: 'Hilot',
      certification: {
        date: parentMarriage.date,
        time: parentMarriage.date,
        signature: '',
        name: '',
        title: 'MD',
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

    // Validate and transform rawAttendant if it exists
    if (
      rawAttendant &&
      typeof rawAttendant === 'object' &&
      !Array.isArray(rawAttendant) &&
      typeof rawAttendant.certification === 'object' &&
      rawAttendant.certification !== null
    ) {
      const raw = rawAttendant as any;
      const cert = raw.certification;

      // Validate and parse address
      let addrObj = {
        houseNo: '',
        st: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        country: '',
      };

      if (typeof cert.address === 'object' && cert.address !== null) {
        addrObj = {
          houseNo: cert.address.houseNo ?? '',
          st: cert.address.st ?? '',
          barangay: cert.address.barangay ?? '',
          cityMunicipality: cert.address.cityMunicipality ?? '',
          province: cert.address.province ?? '',
          country: cert.address.country ?? '',
        };
      }

      // Parse dates correctly
      const parsedDate = cert.date ? new Date(cert.date) : new Date();
      const parsedTime = cert.time ? new Date(cert.time) : new Date();

      // Assign values to the attendant object
      attendant = {
        type: raw.type as
          | 'Others'
          | 'Physician'
          | 'Nurse'
          | 'Midwife'
          | 'Hilot',
        certification: {
          date: parsedDate,
          time: parsedTime,
          signature: cert.signature ?? '',
          name: cert.name ?? '',
          title: cert.title ?? '',
          address: addrObj,
        },
      };
    }

    // Informant extraction.
    const rawInformant = form.birthCertificateForm?.informant;
    let informant: {
      name: string;
      date: Date;
      signature: string;
      address: {
        province: string;
        cityMunicipality: string;
        country: string;
        houseNo?: string;
        st?: string;
        barangay?: string;
      };
      relationship: string;
    } = {
      name: '',
      date: new Date(),
      signature: '',
      address: {
        province: '',
        cityMunicipality: '',
        country: '',
        barangay: '',
        houseNo: '',
      },
      relationship: '',
    };
    if (
      rawInformant &&
      !Array.isArray(rawInformant) &&
      typeof rawInformant === 'object'
    ) {
      const inf = rawInformant as {
        date?: string;
        name?: string;
        address?:
          | string
          | {
              province: string;
              cityMunicipality: string;
              country: string;
              houseNo?: string;
              st?: string;
              barangay?: string;
            };
        signature?: string;
        relationship?: string;
      };
      informant = {
        date: inf.date ? new Date(inf.date) : new Date(),
        name: typeof inf.name === 'string' ? inf.name : '',
        signature: typeof inf.signature === 'string' ? inf.signature : '',
        address:
          typeof inf.address === 'string'
            ? {
                province: '',
                cityMunicipality: '',
                country: '',
                houseNo: inf.address,
              }
            : inf.address || {
                province: '',
                cityMunicipality: '',
                country: '',
              },
        relationship:
          typeof inf.relationship === 'string' ? inf.relationship : '',
      };
    }



    // Inside the mapToBirthCertificateValues function:

    const rawPreparedBy = form.preparedBy;
    let preparedByValue = {
      signature: '',
      nameInPrint: '',
      titleOrPosition: '',
      date: parseDateSafely(form.preparedByDate),
    };
    
    if (rawPreparedBy && typeof rawPreparedBy === 'object' && 'signature' in rawPreparedBy && 'titleOrPosition' in rawPreparedBy) {
      preparedByValue = {
        signature: (rawPreparedBy as any).signature,
        nameInPrint: (rawPreparedBy as any).name,
        titleOrPosition: (rawPreparedBy as any).titleOrPosition,
        date: parseDateSafely(form.preparedByDate),
      };
    } else if (typeof rawPreparedBy === 'string') {
      preparedByValue.nameInPrint = rawPreparedBy;
    } else if (rawPreparedBy && typeof rawPreparedBy === 'object' && 'name' in rawPreparedBy) {
      // Fallback if only name exists
      preparedByValue.nameInPrint = (rawPreparedBy as any).name;
    }

    

    return {
      registryNumber: form.registryNumber || '',
      province: form.province || '',
      cityMunicipality: form.cityMunicipality || '',
      pagination: {
        pageNumber: form.pageNumber || '',
        bookNumber: form.bookNumber || '',
      },
      remarks: form.remarks || '',

      // Child information
      childInfo: {
        firstName: childName.first,
        middleName: childName.middle,
        lastName: childName.last,
        sex,
        dateOfBirth,
        placeOfBirth,
        typeOfBirth,
        multipleBirthOrder,
        birthOrder: form.birthCertificateForm?.birthOrder || '',
        weightAtBirth,
      },

      // Mother information with desired JSON format.
      motherInfo: {
        firstName: motherName.first,
        middleName: motherName.middle,
        lastName: motherName.last,
        citizenship: form.birthCertificateForm?.motherCitizenship || '',
        religion: form.birthCertificateForm?.motherReligion || '',
        occupation: form.birthCertificateForm?.motherOccupation || '',
        age: String(form.birthCertificateForm?.motherAge || ''),
        totalChildrenBornAlive: String(
          form.birthCertificateForm?.totalChildrenBornAlive || ''
        ),
        childrenStillLiving: String(
          form.birthCertificateForm?.childrenStillLiving || ''
        ),
        childrenNowDead: String(
          form.birthCertificateForm?.childrenNowDead || ''
        ),
        // Output residence with key "st" from the mapped "street" value.
        residence: {
          houseNo: motherResidence.houseNo,
          st: motherResidence.street,
          barangay: motherResidence.barangay,
          cityMunicipality: motherResidence.cityMunicipality,
          province: motherResidence.province,
          country: motherResidence.country,
        },
      },

      // Father information with desired JSON format.
      fatherInfo: {
        firstName: fatherName.first,
        middleName: fatherName.middle,
        lastName: fatherName.last,
        citizenship: form.birthCertificateForm?.fatherCitizenship || '',
        religion: form.birthCertificateForm?.fatherReligion || '',
        occupation: form.birthCertificateForm?.fatherOccupation || '',
        age: String(form.birthCertificateForm?.fatherAge || ''),
        residence: {
          houseNo: fatherResidence.houseNo,
          st: fatherResidence.street,
          barangay: fatherResidence.barangay,
          cityMunicipality: fatherResidence.cityMunicipality,
          province: fatherResidence.province,
          country: fatherResidence.country,
        },
      },

      // Parent marriage information
      parentMarriage: parentMarriage,

      // Attendant information
      attendant: attendant,

      // Informant information
      informant: informant,

      // Processing details
      preparedBy: {
        signature: '',
        nameInPrint:
          typeof form.preparedBy === 'string'
            ? form.preparedBy
            : form.preparedBy?.name || '',
        titleOrPosition: '',
        date: parseDateSafely(form.preparedByDate),
      },

      receivedBy: {
        signature: '',
        nameInPrint: typeof form.receivedBy === 'string' ? form.receivedBy : '',
        titleOrPosition: '',
        date: parseDateSafely(form.receivedByDate),
      },
      registeredByOffice: {
        signature: '',
        nameInPrint:
          typeof form.registeredBy === 'string' ? form.registeredBy : '',
        titleOrPosition: '',
        date: parseDateSafely(form.registeredByDate),
      },
      hasAffidavitOfPaternity: false,
      affidavitOfPaternityDetails: null,
      isDelayedRegistration: false,
      affidavitOfDelayedRegistration: null,
    };
  };

  const initialData = mapToBirthCertificateValues(form);

  const handleEditSubmit = async (
    data: BirthCertificateFormValues
  ): Promise<void> => {
    try {
      const preparedByValue = { name: data.preparedBy.nameInPrint };
      const updatedForm: BaseRegistryFormWithRelations = {
        ...form,
        registryNumber: data.registryNumber,
        province: data.province,
        cityMunicipality: data.cityMunicipality,
        pageNumber: data.pagination?.pageNumber || form.pageNumber,
        bookNumber: data.pagination?.bookNumber || form.bookNumber,
        remarks: data.remarks || null,
        preparedBy: preparedByValue,
        preparedByDate: data.preparedBy.date || null,
        receivedBy: data.receivedBy.nameInPrint || null,
        receivedByDate: data.receivedBy.date || null,
        registeredBy: data.registeredByOffice.nameInPrint || null,
        registeredByDate: data.registeredByOffice.date || null,
        updatedAt: new Date(),
      };

      await onSaveAction(updatedForm);
      toast.success(`${t('formUpdated')} ${updatedForm.id}!`);
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error(t('errorUpdatingForm'));
    }
  };

  const { formMethods, handleError } = useBirthCertificateForm({
    onOpenChange: () => {},
    defaultValues: initialData,
  });

  const handleFormSubmit = async (
    data: BirthCertificateFormValues
  ): Promise<void> => {
    const result = await formMethods.trigger();
    if (result) {
      try {
        await handleEditSubmit(data);
        formMethods.reset();
      } catch (error: unknown) {
        console.error('Error submitting form:', error);
        toast.error('Error submitting form');
        handleError(error);
      }
    } else {
      toast.warning('Please complete all required fields');
    }
  };

  const handleCancel = () => {
    formMethods.reset();
  };

  return (
    <div className='max-w-[70dvw] w-[70dvw] h-[95dvh] max-h-[95dvh] p-4'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold'>
          {t('Edit Certificate of Live Birth')}
        </h2>
      </div>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(handleFormSubmit, handleError)}
          className='space-y-6'
        >
          <div className='h-full flex flex-col'>
            <ScrollArea className='h-[calc(95vh-180px)]'>
              <div className='p-6 space-y-4'>
                <PaginationInputs />
                <RegistryInformationCard formType={FormType.BIRTH} forms={form} />
                <ChildInformationCard />
                <MotherInformationCard />
                <FatherInformationCard />
                <MarriageInformationCard />
                <AttendantInformationCard />
                <CertificationOfInformantCard />
                <PreparedByCard />
                <ReceivedByCard />
                <RegisteredAtOfficeCard
                  fieldPrefix='registeredByOffice'
                  cardTitle='Registered at the Office of Civil Registrar'
                />
                <RemarksCard
                  fieldName='remarks'
                  cardTitle='Birth Certificate Remarks'
                  label='Additional Remarks'
                  placeholder='Enter any additional remarks or annotations'
                />
                <AffidavitOfPaternityForm />
                <DelayedRegistrationForm />
              </div>
            </ScrollArea>
            <div className='flex justify-end gap-2 mt-4 mr-8'>
              <Button
                type='button'
                variant='outline'
                className='py-2 w-32 bg-muted-foreground/80 hover:bg-muted-foreground hover:text-accent text-accent'
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type='submit' variant='default' className='py-2 w-32'>
                Update
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
