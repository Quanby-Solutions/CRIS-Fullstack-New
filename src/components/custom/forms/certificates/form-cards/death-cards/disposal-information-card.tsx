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
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LocationSelector from '../shared-components/location-selector';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';

const DisposalInformationCard: React.FC = () => {
  const { control, getValues, setValue } = useFormContext<DeathCertificateFormValues>();
  const [ncrMode, setNcrMode] = useState(false);

  useEffect(() => {
      // Detect NCR mode from fetched data on component mount
      const province = getValues('cemeteryOrCrematory.address.province');
      if (province === 'Metro Manila' || province === 'NCR') {
        setNcrMode(true);
      }
    }, [getValues]);
  
  
    useEffect(() => {
      if (ncrMode === true) {
        setValue('cemeteryOrCrematory.address.province', 'Metro Manila')
      }
    }, [ncrMode])


  return (
    <Card>
      <CardHeader className='pb-3'>
        <h3 className='text-sm font-semibold'>Disposal Information</h3>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Disposal Method */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={control}
            name='corpseDisposal'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corpse Disposal Method</FormLabel>
                <FormControl>
                  <Input
                    className='h-10'
                    placeholder='Burial, Cremation, etc.'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Burial/Cremation Permit Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>Burial/Cremation Permit</h4>
            <FormField
              control={control}
              name='burialPermit.number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permit Number</FormLabel>
                  <FormControl>
                    <Input
                      className='h-10'
                      placeholder='Enter permit number'
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
              name='burialPermit.dateIssued'
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? '',
                      onChange: field.onChange,
                    }}
                    label='Date Issued'
                    placeholder='Select date issued'
                    ref={field.ref}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Transfer Permit Section */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>
              Transfer Permit (if applicable)
            </h4>
            <FormField
              control={control}
              name='transferPermit.number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permit Number</FormLabel>
                  <FormControl>
                    <Input
                      className='h-10'
                      placeholder='Enter permit number'
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
              name='transferPermit.dateIssued'
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? '',
                      onChange: field.onChange,
                    }}
                    label='Date Issued'
                    placeholder='Select date issued'
                    ref={field.ref}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Cemetery or Crematory Information */}
        <div className='space-y-4'>
          <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />
          <h4 className='text-sm font-medium'>
            Cemetery or Crematory Information
          </h4>
          <div className='grid md:grid-cols-3 grid-cols-1 gap-4'>
            <FormField
              control={control}
              name='cemeteryOrCrematory.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className='h-10'
                      placeholder='Enter cemetery or crematory name'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Use LocationSelector for the cemetery/crematory address */}
            <LocationSelector
              provinceFieldName='cemeteryOrCrematory.address.province'
              municipalityFieldName='cemeteryOrCrematory.address.cityMunicipality'
              barangayFieldName='cemeteryOrCrematory.address.barangay'
              provinceLabel='Province'
              municipalityLabel='City/Municipality'
              barangayLabel='Barangay'
              provincePlaceholder='Select province...'
              municipalityPlaceholder='Select city/municipality...'
              barangayPlaceholder='Select barangay...'
              showBarangay={true}
              isNCRMode={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisposalInformationCard;
