'use client';

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LocationSelector from '../shared-components/location-selector';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';
import { RegisteredAtOfficeCard } from '../shared-components/processing-details-cards';

const DelayedRegistrationForm: React.FC = () => {
  const { control, watch, setValue, getValues, trigger } = useFormContext();
  const isDelayedRegistration = watch('isDelayedRegistration');

  // Local state for Affiant Address NCR mode.
  const [affiantAddressNcrMode, setAffiantAddressNcrMode] = useState(false);
  const [AffofficerAddressNcrMode, setOfficerAffiantAddressNcrMode] = useState(false);

  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === 'string') {
      return provinceValue;
    } else if (
      provinceValue &&
      typeof provinceValue === 'object' &&
      provinceValue.label
    ) {
      return provinceValue.label;
    }
    return '';
  };

  const province = watch('affidavitOfDelayedRegistration.adminOfficer.address.province')
  const province1 = watch('affidavitOfDelayedRegistration.affiant.address.province')
  useEffect(() => {
    if (isDelayedRegistration) {
        const provinceString = getProvinceString(province) || 'Metro Manila'
        const provinceString1 = getProvinceString(province1) || 'Metro Manila'

      // Determine if the province should be NCR (Metro Manila) or not
      const shouldBeNCR = provinceString.trim().toLowerCase() === 'metro manila'
      const shouldBeNCR1 = provinceString1.trim().toLowerCase() === 'metro manila'
      setAffiantAddressNcrMode(shouldBeNCR)
      setOfficerAffiantAddressNcrMode(shouldBeNCR1)

      // Set the province value based on whether NCR mode is true or false
      setValue('affidavitOfDelayedRegistration.adminOfficer.address.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
        shouldValidate: true, // Trigger validation immediately
        shouldDirty: true,     // Mark the field as dirty to ensure validation
      })

      setValue('affidavitOfDelayedRegistration.affiant.address.province', shouldBeNCR1 ? 'Metro Manila' : provinceString1, {
        shouldValidate: true, // Trigger validation immediately
        shouldDirty: true,     // Mark the field as dirty to ensure validation
      })

      // Manually trigger revalidation of the province field after setting the value
      trigger('affidavitOfDelayedRegistration.adminOfficer.address.province')
      trigger('affidavitOfDelayedRegistration.affiant.address.province')
    }
  }, [province, isDelayedRegistration, province1]) // Runs whenever province changes



  // When delayed registration is toggled on, ensure the nested object is initialized.
  useEffect(() => {
    const currentDelayedReg = getValues('affidavitOfDelayedRegistration');
    if (isDelayedRegistration && currentDelayedReg === null) {
      setValue('affidavitOfDelayedRegistration', {
        affiant: {
          name: '',
          citizenship: '',
          civilStatus: '',
          address: {
            houseNo: '',
            st: '',
            barangay: '',
            cityMunicipality: '',
            province: '',
            country: '',
          },
        },
        registrationType: '',
        reasonForDelay: '',
        dateSworn: '',
        adminOfficer: {
          nameInPrint: '',
          titleOrPosition: '',
          address: {
            houseNo: '',
            st: '',
            barangay: '',
            cityMunicipality: '',
            province: '',
            country: '',
          },
        },
        ctcInfo: {
          number: '',
          dateIssued: '',
          placeIssued: '',
        },
      });
    }
  }, [isDelayedRegistration, setValue, getValues]);


  useEffect(() => {
    if (!isDelayedRegistration) {
      setValue('affidavitOfDelayedRegistration', null)
    }
  }, [isDelayedRegistration, setValue])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affidavit for Delayed Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Toggle for Delayed Registration */}
          <FormField
            control={control}
            name='isDelayedRegistration'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='font-normal'>
                  This is a delayed registration
                </FormLabel>
              </FormItem>
            )}
          />

          {isDelayedRegistration && (
            <div className='space-y-6'>
              {/* Affiant Basic Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.affiant.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiant Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Affiant Citizenship */}
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.affiant.citizenship'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiant Citizenship</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Affiant Civil Status */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.affiant.civilStatus'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select civil status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='SINGLE'>Single</SelectItem>
                          <SelectItem value='MARRIED'>Married</SelectItem>
                          <SelectItem value='DIVORCED'>Divorced</SelectItem>
                          <SelectItem value='WIDOWED'>Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Affiant Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Affiant Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <NCRModeSwitch
                      isNCRMode={AffofficerAddressNcrMode}
                      setIsNCRMode={setOfficerAffiantAddressNcrMode}
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <LocationSelector
                        provinceFieldName='affidavitOfDelayedRegistration.affiant.address.province'
                        municipalityFieldName='affidavitOfDelayedRegistration.affiant.address.cityMunicipality'
                        barangayFieldName='affidavitOfDelayedRegistration.affiant.address.barangay'
                        provinceLabel='Province'
                        municipalityLabel='City/Municipality'
                        selectTriggerClassName='h-10 px-3 text-base md:text-sm'
                        provincePlaceholder='Select province'
                        municipalityPlaceholder='Select city/municipality'
                        className='grid grid-cols-2 gap-4'
                        isNCRMode={AffofficerAddressNcrMode}
                        showBarangay={true}
                        barangayLabel='Barangay'
                        barangayPlaceholder='Select barangay'
                      />
                      <FormField
                        control={control}
                        name='affidavitOfDelayedRegistration.affiant.address.country'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className='h-10'
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Additional Address Fields */}
                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={control}
                        name='affidavitOfDelayedRegistration.affiant.address.houseNo'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House No.</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name='affidavitOfDelayedRegistration.affiant.address.st'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Type */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.registrationType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='SELF'>Self</SelectItem>
                          <SelectItem value='OTHER'>Other Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason for Delay */}
              <FormField
                control={control}
                name='affidavitOfDelayedRegistration.reasonForDelay'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Delay</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        className='min-h-[100px]'
                        placeholder='Enter the reason for delayed registration...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Sworn */}
              <FormField
                control={control}
                name='affidavitOfDelayedRegistration.dateSworn'
                render={({ field }) => (
                  <FormItem>
                    <DatePickerField
                      field={{
                        value: field.value!,
                        onChange: field.onChange,
                      }}
                      label='Date Sworn'
                      placeholder='Please select a date'
                      ref={field.ref}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Officer Details */}
              <RegisteredAtOfficeCard
                fieldPrefix="affidavitOfDelayedRegistration.adminOfficer"
                cardTitle="Administering Officer"
                hideDate={true}
                showSignature={true}
                showNameInPrint={true}
                showTitleOrPosition={true}
              />




              {/* Admin Officer Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Officer Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <NCRModeSwitch
                      isNCRMode={affiantAddressNcrMode}
                      setIsNCRMode={setAffiantAddressNcrMode}
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <LocationSelector
                        provinceFieldName='affidavitOfDelayedRegistration.adminOfficer.address.province'
                        municipalityFieldName='affidavitOfDelayedRegistration.adminOfficer.address.cityMunicipality'
                        barangayFieldName='affidavitOfDelayedRegistration.adminOfficer.address.barangay'
                        provinceLabel='Province'
                        municipalityLabel='City/Municipality'
                        selectTriggerClassName='h-10 px-3 text-base md:text-sm'
                        provincePlaceholder='Select province'
                        municipalityPlaceholder='Select city/municipality'
                        className='grid grid-cols-2 gap-4'
                        isNCRMode={affiantAddressNcrMode}
                        showBarangay={true}
                        barangayLabel='Barangay'
                        barangayPlaceholder='Select barangay'
                      />
                      <FormField
                        control={control}
                        name='affidavitOfDelayedRegistration.adminOfficer.address.country'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className='h-10'
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* CTC Information */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.ctcInfo.number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTC Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.ctcInfo.dateIssued'
                  render={({ field }) => (
                    <FormItem>
                      <DatePickerField
                        field={{
                          value: field.value,
                          onChange: field.onChange,
                        }}
                        label='Date Issued'
                        placeholder='Select date issued'
                        ref={field.ref} // Forward ref for auto-focus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='affidavitOfDelayedRegistration.ctcInfo.placeIssued'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place Issued</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DelayedRegistrationForm;
