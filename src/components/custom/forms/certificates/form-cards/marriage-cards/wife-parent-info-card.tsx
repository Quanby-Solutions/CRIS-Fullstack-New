'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MarriageCertificateFormValues } from '@/lib/types/zod-form-certificate/marriage-certificate-form-schema';
;
import { useFormContext } from 'react-hook-form';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';
import { useEffect, useState } from 'react';
import LocationSelector from '../shared-components/location-selector';

const WifeParentsInfoCard: React.FC = () => {
  const { control, getValues, setValue } = useFormContext<MarriageCertificateFormValues>();
  const [wifeParentNcrMode, setNcrMode] = useState(false);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues('wifeConsentPerson.residence.province');
    if (province === 'Metro Manila' || province === 'NCR') {
      setNcrMode(true);
    }
  }, [getValues]);

    useEffect(() => {
      if (wifeParentNcrMode === true) {
        setValue('wifeConsentPerson.residence.province', 'Metro Manila')
      }
    })

  return (
    <Card className='border dark:border-border'>
      <CardHeader>
        <CardTitle>Wife&apos;s Parents Information</CardTitle>
      </CardHeader>
      <CardContent className='p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Father's First Name */}
          <FormField
            control={control}
            name='wifeParents.fatherName.first'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s First Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter first name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Middle Name */}
          <FormField
            control={control}
            name='wifeParents.fatherName.middle'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter middle name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Father's Last Name */}
          <FormField
            control={control}
            name='wifeParents.fatherName.last'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Last Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter last name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Maiden Mother's First Name */}
          <FormField
            control={control}
            name='wifeParents.motherName.first'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s First Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter first name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Maiden Mother's Middle Name */}
          <FormField
            control={control}
            name='wifeParents.motherName.middle'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter middle name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Maiden Mother's last Name */}
          <FormField
            control={control}
            name='wifeParents.motherName.last'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s (Maiden) Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter last name'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Father's Citizenship */}
          <FormField
            control={control}
            name='wifeParents.fatherCitizenship'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father&apos;s Citizenship</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter citizenship'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Mother's Citizenship */}
          <FormField
            control={control}
            name='wifeParents.motherCitizenship'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother&apos;s Citizenship</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter citizenship'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adviser */}
        <div className='col-span-full py-12'>
          <h3 className='font-bold '>Name of person Wali who gave consent or advise</h3>
        </div>
        <NCRModeSwitch
          isNCRMode={wifeParentNcrMode}
          setIsNCRMode={setNcrMode}
        />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <FormField
            control={control}
            name='wifeConsentPerson.name.first'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (First Name)</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter Adviser (first)'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='wifeConsentPerson.name.middle'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (Middle Name)</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter Adviser (middle)'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='wifeConsentPerson.name.last'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adviser (Last Name)</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='h-10'
                    placeholder='Enter Adviser (last)'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>



        {/* Parents Residence */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Parents Relationship */}
          <FormField
            control={control}
            name='wifeConsentPerson.relationship'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship</FormLabel>
                <FormControl>
                  <Input type='text'
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

          <LocationSelector
            provinceFieldName='wifeConsentPerson.residence.province'
            municipalityFieldName='wifeConsentPerson.residence.cityMunicipality'
            barangayFieldName='wifeConsentPerson.residence.barangay'
            provinceLabel='Province'
            municipalityLabel='City/Municipality'
            barangayLabel='Barangay'
            isNCRMode={wifeParentNcrMode}
            showBarangay={true}
            provincePlaceholder='Select province'
            municipalityPlaceholder='Select city/municipality'
            barangayPlaceholder='Select barangay'
          />
          <FormField
            control={control}
            name='wifeConsentPerson.residence.street'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                    value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Redundant na su name so s apreview is get nalang si name of officer or fillout ini auto matic */}
          <FormField
            control={control}
            name='wifeConsentPerson.residence.country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input type='text' className='h-10' placeholder='Enter complete address' {...field}
                    value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card >
  );
};

export default WifeParentsInfoCard;
