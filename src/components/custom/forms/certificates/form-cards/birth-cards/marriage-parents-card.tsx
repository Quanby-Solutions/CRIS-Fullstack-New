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
  const { control, watch, setValue} = useFormContext<BirthCertificateFormValues>()
  const [ncrMode, setNcrMode] = useState(false)

  // Watch the province field for marriage place
  const province = watch('parentMarriage.place.province')

  // Helper function to extract province string if it comes as an object
  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === 'string') {
      return provinceValue
    } else if (provinceValue && typeof provinceValue === 'object' && provinceValue.label) {
      return provinceValue.label
    }
    return ''
  }

  // Update ncrMode based on the province value
  useEffect(() => {
    const provinceString = getProvinceString(province)
    const shouldBeNcr = provinceString.trim().toLowerCase() === 'metro manila'
    if (shouldBeNcr !== ncrMode) {
      setNcrMode(shouldBeNcr)
      setValue('parentMarriage.place.province', 'Metro Manila')
    }
  }, [province, ncrMode])
  

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>
          Marriage Information
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Marriage Place */}
        <Card className='border'>
          <CardHeader>
            <CardTitle className='text-lg font-medium'>
              Marriage Place
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
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
                  label='Marriage Date'
                  placeholder='Select marriage date'
                  ref={field.ref}
                />
                )}
              />
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
