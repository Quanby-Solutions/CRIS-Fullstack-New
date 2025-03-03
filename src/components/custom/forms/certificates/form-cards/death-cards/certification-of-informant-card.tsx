'use client';

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DeathCertificateFormValues } from '@/lib/types/zod-form-certificate/death-certificate-form-schema';
import { useFormContext } from 'react-hook-form';
import LocationSelector from '../shared-components/location-selector';
import SignatureUploader from '../shared-components/signature-uploader';

const CertificationInformantCard: React.FC = () => {
  const { control, setValue } = useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader className='pb-3'>
        <h3 className='text-sm font-semibold'>Certification of Informant</h3>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-4'>
          {/* Signature */}
          <FormField
            control={control}
            name='informant.signature'
            render={({ field, formState: { errors } }) => (
              <FormItem>
                <FormLabel>Signature</FormLabel>
                <FormControl>
                  <SignatureUploader
                    name='informant.signature'
                    label='Upload Signature'
                    onChange={(value: File | string) => {
                      if (value instanceof File) {
                        setValue('informant.signature', value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      } else {
                        setValue('informant.signature', value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage>
                  {typeof errors?.informant?.signature?.message === 'string'
                    ? errors.informant.signature.message
                    : ''}
                </FormMessage>
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={control}
            name='informant.nameInPrint'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Enter name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Relationship to Deceased */}
          <FormField
            control={control}
            name='informant.relationshipToDeceased'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship to the Deceased</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Enter relationship'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <LocationSelector
            provinceFieldName='informant.address.province'
            municipalityFieldName='informant.address.cityMunicipality'
            barangayFieldName='informant.address.barangay'
            provinceLabel='Province'
            municipalityLabel='City/Municipality'
            barangayLabel='Barangay'
            provincePlaceholder='Select province...'
            municipalityPlaceholder='Select city/municipality...'
            barangayPlaceholder='Select barangay...'
            showBarangay={true}
            isNCRMode={false}
          />

          {/* House No. */}
          <FormField
            control={control}
            name='informant.address.houseNo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>House No.</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Enter house number'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Street */}
          <FormField
            control={control}
            name='informant.address.st'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Enter street'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country */}
          <FormField
            control={control}
            name='informant.address.country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Enter country'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Informant Date */}
          <FormField
            control={control}
            name='informant.date'
            render={({ field }) => (
              <FormItem>
                <DatePickerField
                  field={{
                    value: field.value ?? '',
                    onChange: field.onChange,
                  }}
                  label='Date'
                  placeholder='Select date'
                  ref={field.ref}
                />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationInformantCard;
