'use client'

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema'
import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import LocationSelector from '../shared-components/location-selector'
import NCRModeSwitch from '../shared-components/ncr-mode-switch'

export default function MarriageInformationCard() {
  const { control, watch, setValue, trigger} = useFormContext<BirthCertificateFormValues>()
  const [ncrMode, setNcrMode] = useState(false)

  // Watch the province field for marriage place
  const province = watch('parentMarriage.place.province')

  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === 'string') {
      return provinceValue
    } else if (provinceValue && typeof provinceValue === 'object' && provinceValue.label) {
      return provinceValue.label
    }
    return ''
  }




  useEffect(() => {
    const provinceString = getProvinceString(province) || 'Metro Manila'
    
    // Determine if the province should be NCR (Metro Manila) or not
    const shouldBeNCR = provinceString.trim().toLowerCase() === 'metro manila'
    setNcrMode(shouldBeNCR)
  
    // Set the province value based on whether NCR mode is true or false
    setValue('parentMarriage.place.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
      shouldValidate: true, // Trigger validation immediately
      shouldDirty: true,     // Mark the field as dirty to ensure validation
    })
  
    // Manually trigger revalidation of the province field after setting the value
    trigger('parentMarriage.place.province')
  }, [province]) // Runs whenever province changes

  

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>
          Marriage of Parents
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Card className='border p-4'> {/* Adjusted padding for better card size */}
          <CardContent className='space-y-6'>
            {/* Marriage Date */}
            <div className='text-lg'>
              <strong>20a.</strong> Marriage Date
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='parentMarriage.date'
                render={({ field }) => (
                  <DatePickerField
                    field={{
                      value: field.value ?? null,
                      onChange: field.onChange,
                    }}
                    label='Date'
                    placeholder='Select marriage date'
                    ref={field.ref}
                  />
                )}
              />
            </div>

            {/* Marriage Place */}
            <div className='text-lg'>
              <strong>20b.</strong> Marriage Place
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='parentMarriage.place.houseNo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House No.</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter house number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='parentMarriage.place.st'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter street' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NCR Mode Switch & Location Selector */}
            <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <LocationSelector
                provinceFieldName='parentMarriage.place.province'
                municipalityFieldName='parentMarriage.place.cityMunicipality'
                barangayFieldName='parentMarriage.place.barangay'
                provinceLabel='Province'
                municipalityLabel='City/Municipality'
                barangayLabel='Barangay'
                isNCRMode={ncrMode}
                showBarangay={true}
                provincePlaceholder='Select province'
                municipalityPlaceholder='Select city/municipality'
                barangayPlaceholder='Select barangay'
              />
              <FormField
                control={control}
                name='parentMarriage.place.country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter country' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
