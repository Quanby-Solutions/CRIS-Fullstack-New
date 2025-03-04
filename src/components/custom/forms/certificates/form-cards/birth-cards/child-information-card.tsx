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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema'
import { useEffect, useState } from 'react'
import LocationSelector from '../shared-components/location-selector'
import NCRModeSwitch from '../shared-components/ncr-mode-switch'
import { useFormContext } from 'react-hook-form'
const ChildInformationCard: React.FC = () => {
  const { control, watch, setValue, trigger } = useFormContext<BirthCertificateFormValues>()
  const [ncrMode, setNcrMode] = useState(false)

  // Watch the province value
  const province = watch('childInfo.placeOfBirth.province')

  // Helper: Extract the province string
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
    setValue('childInfo.placeOfBirth.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
      shouldValidate: true, // Trigger validation immediately
      shouldDirty: true,     // Mark the field as dirty to ensure validation
    })
  
    // Manually trigger revalidation of the province field after setting the value
    trigger('childInfo.placeOfBirth.province')
  }, [province]) // Runs whenever province changes
  
  


  

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>
          Child Information
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Personal Information Section */}
        <Card>
          <CardHeader className='pb-3'>
            <h3 className='text-sm font-semibold'>Personal Information</h3>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='childInfo.firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter first name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='childInfo.middleName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter middle name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='childInfo.lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter last name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Information Section */}
        <div className='flex gap-4 w-full'>
        <Card>
          <CardHeader className='pb-3'>
            <h3 className='text-sm font-semibold'>Physical Information</h3>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={control}
                name='childInfo.sex'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger
                          ref={field.ref}
                          className='h-10 px-3 text-base md:text-sm'
                        >
                          <SelectValue placeholder='Select sex' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Male'>Male</SelectItem>
                        <SelectItem value='Female'>Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='childInfo.weightAtBirth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight at Birth (kilograms)</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter weight (e.g., 3.5)'
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*\.?\d*$/.test(value) || value === '') {
                            field.onChange(value)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='w-[49%]'>
          <CardHeader className='pb-3'>
            <h3 className='text-sm font-semibold'>Birth Date</h3>
          </CardHeader>
          <CardContent className='w-52'>
            <FormField
              control={control}
              name='childInfo.dateOfBirth'
              render={({ field }) => (
                <DatePickerField
                  field={{
                    value: field.value!,
                    onChange: field.onChange,
                  }}
                  label='Date'
                  placeholder='Please select a date'
                  ref={field.ref}
                />
              )}
            />
          </CardContent>
        </Card>
        </div>
        {/* Place of Birth */}
        <Card>
          <CardHeader className='pb-3'>
            <h3 className='text-sm font-semibold'>Place of Birth</h3>
          </CardHeader>
          <CardContent>
            <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='childInfo.placeOfBirth.hospital'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital/Clinic/Institution</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter place of birth'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LocationSelector
                provinceFieldName='childInfo.placeOfBirth.province'
                municipalityFieldName='childInfo.placeOfBirth.cityMunicipality'
                provinceLabel='Province'
                municipalityLabel='City/Municipality'
                provincePlaceholder='Select province'
                municipalityPlaceholder='Select city/municipality'
                isNCRMode={ncrMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Birth Order Information Section */}
        <Card>
          <CardHeader className='pb-3'>
            <h3 className='text-sm font-semibold'>Birth Order Information</h3>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={control}
                name='childInfo.typeOfBirth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Birth</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          ref={field.ref}
                          className='h-10 px-3 text-base md:text-sm'
                        >
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Single'>Single</SelectItem>
                        <SelectItem value='Twin'>Twin</SelectItem>
                        <SelectItem value='Triplet'>Triplet</SelectItem>
                        <SelectItem value='Other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='childInfo.multipleBirthOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>If Multiple Birth</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger
                          ref={field.ref}
                          className='h-10 px-3 text-base md:text-sm'
                        >
                          <SelectValue placeholder='Select order' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='First'>First</SelectItem>
                        <SelectItem value='Second'>Second</SelectItem>
                        <SelectItem value='Third'>Third</SelectItem>
                        <SelectItem value='Other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='childInfo.birthOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Order</FormLabel>
                    <FormControl>
                      <Input
                        className='h-10'
                        placeholder='Enter birth order'
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value) || value === '') {
                            field.onChange(value)
                          }
                        }}
                      />
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

export default ChildInformationCard
