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

const CertificationOfInformantCard: React.FC = () => {
  const { control, setValue, watch, trigger } = useFormContext<BirthCertificateFormValues>();
  const [ncrMode, setNcrMode] = useState(false);

  const province = watch('informant.address.province');

  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === 'string') {
      return provinceValue;
    } else if (provinceValue && typeof provinceValue === 'object' && provinceValue.label) {
      return provinceValue.label;
    }
    return '';
  };

  useEffect(() => {
    const provinceString = getProvinceString(province) || 'Metro Manila';
    const shouldBeNCR = provinceString.trim().toLowerCase() === 'metro manila';
    setNcrMode(shouldBeNCR);
    setValue('informant.address.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
      shouldValidate: true,
      shouldDirty: true,
    });
    trigger('informant.address.province');
  }, [province, setValue, trigger]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification of Informant</CardTitle>
      </CardHeader>
      <CardContent>
        <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signature field removed */}
            <FormField
              control={control}
              name="informant.date"
              render={({ field }) => (
                <DatePickerField
                  field={{ value: field.value!, onChange: field.onChange }}
                  label="Date"
                  placeholder="Select date"
                  ref={field.ref}
                />
              )}
            />
            <FormField
              control={control}
              name="informant.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name in Print</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} ref={field.ref} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="informant.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to the Child</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter relationship" {...field} ref={field.ref} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="informant.address.houseNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter house number" {...field} ref={field.ref} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="informant.address.st"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street name" {...field} ref={field.ref} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={control}
              name="informant.address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} ref={field.ref} className="h-10" />
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