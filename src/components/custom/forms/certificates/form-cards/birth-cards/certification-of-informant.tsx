'use client';

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LocationSelector from '../shared-components/location-selector';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';
import SignatureUploader from '../shared-components/signature-uploader';

// Helper function to convert a File object to a base64 string.
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const CertificationOfInformantCard: React.FC = () => {
  const { control, setValue, watch, trigger } =
    useFormContext<BirthCertificateFormValues>();
  const [ncrMode, setNcrMode] = useState(false);

  const province = watch('informant.address.province');

  // Extract province string safely.
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


  useEffect(() => {
    const provinceString = getProvinceString(province) || 'Metro Manila'
    
    // Determine if the province should be NCR (Metro Manila) or not
    const shouldBeNCR = provinceString.trim().toLowerCase() === 'metro manila'
    setNcrMode(shouldBeNCR)
  
    // Set the province value based on whether NCR mode is true or false
    setValue('informant.address.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
      shouldValidate: true, // Trigger validation immediately
      shouldDirty: true,     // Mark the field as dirty to ensure validation
    })
  
    // Manually trigger revalidation of the province field after setting the value
    trigger('informant.address.province')
  }, [province]) // Runs whenever province changes
  
  


  

  // Handler for signature change that converts File to base64.
  const handleSignatureChange = async (value: File | string) => {
    if (value instanceof File) {
      try {
        const base64 = await toBase64(value);
        setValue('informant.signature', base64, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        console.error('Error converting file to base64', error);
      }
    } else {
      setValue('informant.signature', value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification of Informant</CardTitle>
      </CardHeader>
      <CardContent>
        <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signature Field */}
            <FormField
              control={control}
              name="informant.signature"
              render={({ field, formState: { errors } }) => {
                const existingSignature = watch('informant.signature');
                return (
                  <FormItem>
                    <FormLabel>Signature</FormLabel>
                    <FormControl>
                      <SignatureUploader
                        name="informant.signature"
                        label="Upload Signature"
                        initialValue={existingSignature}
                        onChange={handleSignatureChange}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.informant?.signature?.message &&
                        String(errors.informant.signature.message)}
                    </FormMessage>
                  </FormItem>
                );
              }}
            />

            {/* Date */}
            <FormField
              control={control}
              name="informant.date"
              render={({ field }) => (
                <DatePickerField
                  field={{
                    value: field.value!,
                    onChange: field.onChange,
                  }}
                  label="Date"
                  placeholder="Select date"
                  ref={field.ref}
                />
              )}
            />

            {/* Name in Print */}
            <FormField
              control={control}
              name="informant.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name in Print</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      {...field}
                      ref={field.ref}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship */}
            <FormField
              control={control}
              name="informant.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to the Child</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter relationship"
                      {...field}
                      ref={field.ref}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* House Number */}
            <FormField
              control={control}
              name="informant.address.houseNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter house number"
                      {...field}
                      ref={field.ref}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Street */}
            <FormField
              control={control}
              name="informant.address.st"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter street name"
                      {...field}
                      ref={field.ref}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Selector – spans two columns */}
            <LocationSelector
              provinceFieldName="informant.address.province"
              municipalityFieldName="informant.address.cityMunicipality"
              barangayFieldName="informant.address.barangay"
              provinceLabel="Province"
              municipalityLabel="City/Municipality"
              selectTriggerClassName="h-10 px-3 text-base md:text-sm"
              provincePlaceholder="Select province"
              municipalityPlaceholder="Select city/municipality"
              className="col-span-2 grid grid-cols-2 gap-4"
              isNCRMode={ncrMode}
              showBarangay={true}
              barangayLabel="Barangay"
              barangayPlaceholder="Select barangay"
            />

            {/* Country */}
            <FormField
              control={control}
              name="informant.address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter country"
                      {...field}
                      ref={field.ref}
                      className="h-10"
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
  );
};

export default CertificationOfInformantCard;
