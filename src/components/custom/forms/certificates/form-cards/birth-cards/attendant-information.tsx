'use client';

import DatePickerField from '@/components/custom/datepickerfield/date-picker-field';
import TimePicker from '@/components/custom/time/time-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BirthCertificateFormValues } from '@/lib/types/zod-form-certificate/birth-certificate-form-schema';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import LocationSelector from '../shared-components/location-selector';
import NCRModeSwitch from '../shared-components/ncr-mode-switch';

const AttendantInformationCard: React.FC = () => {
  const { control, setValue, watch, trigger } = useFormContext<BirthCertificateFormValues>();
  const [attendantAddressNcrMode, setAttendantAddressNcrMode] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const province = watch('attendant.certification.address.province');

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
    setAttendantAddressNcrMode(shouldBeNCR);
    setValue('attendant.certification.address.province', shouldBeNCR ? 'Metro Manila' : provinceString, {
      shouldValidate: true,
      shouldDirty: true,
    });
    trigger('attendant.certification.address.province');
  }, [province, setValue, trigger]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendant Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type of Attendant */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Type of Attendant</h3>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="attendant.type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        setShowOtherInput(value === 'Others');
                        field.onChange(value);
                      }}
                      value={field.value}
                      className="grid grid-cols-2 md:grid-cols-5 gap-4"
                    >
                      {['Physician', 'Nurse', 'Midwife', 'Hilot', 'Others'].map((type) => (
                        <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={type} />
                          </FormControl>
                          <FormLabel className="font-normal">{type}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  {showOtherInput && (
                    <Input
                      placeholder="Please specify other attendant type"
                      value={field.value === 'Others' ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mt-2 h-10"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Certification Details */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Certification Details</h3>
          </CardHeader>
          <CardContent>
            <NCRModeSwitch
              isNCRMode={attendantAddressNcrMode}
              setIsNCRMode={setAttendantAddressNcrMode}
            />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="attendant.certification.time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Birth</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="attendant.certification.date"
                  render={({ field }) => (
                    <DatePickerField
                      field={{ value: field.value!, onChange: field.onChange }}
                      label="Certification Date"
                      placeholder="Select date"
                      ref={field.ref}
                    />
                  )}
                />
                <FormField
                  control={control}
                  name="attendant.certification.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Attendant</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Signature field removed */}
                <FormField
                  control={control}
                  name="attendant.certification.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title/Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title/designation" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="attendant.certification.address.houseNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter house number" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="attendant.certification.address.st"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LocationSelector
                  provinceFieldName="attendant.certification.address.province"
                  municipalityFieldName="attendant.certification.address.cityMunicipality"
                  barangayFieldName="attendant.certification.address.barangay"
                  provinceLabel="Province"
                  municipalityLabel="City/Municipality"
                  selectTriggerClassName="h-10 px-3 text-base md:text-sm"
                  provincePlaceholder="Select province"
                  municipalityPlaceholder="Select city/municipality"
                  className="col-span-2 grid grid-cols-2 gap-4"
                  isNCRMode={attendantAddressNcrMode}
                  showBarangay={true}
                  barangayLabel="Barangay"
                  barangayPlaceholder="Select barangay"
                />
                <FormField
                  control={control}
                  name="attendant.certification.address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default AttendantInformationCard;