'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocationSelector } from '@/hooks/use-location-selector';
import { LocationSelectorProps } from '@/lib/types/location-selector';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const LocationSelector: React.FC<LocationSelectorProps> = ({
  provinceFieldName = 'province',
  municipalityFieldName = 'cityMunicipality',
  barangayFieldName = 'barangay',
  provinceLabel = 'Province',
  municipalityLabel = 'City/Municipality',
  barangayLabel = 'Barangay',
  isNCRMode = false,
  showBarangay = false,
  provincePlaceholder = 'Select a province...',
  municipalityPlaceholder = 'Select a city/municipality...',
  barangayPlaceholder = 'Select a barangay...',
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  formItemClassName = '',
  formLabelClassName = '',
}) => {
  const {
    control,
    trigger,
    setValue,
    getValues,
    clearErrors,
    formState: { isSubmitted },
  } = useFormContext();

  const {
    selectedProvince,
    selectedMunicipality,
    selectedBarangay,
    provinces,
    municipalities,
    barangays,
    handleProvinceChange,
    handleMunicipalityChange,
    handleBarangayChange,
  } = useLocationSelector({
    provinceFieldName,
    municipalityFieldName,
    barangayFieldName,
    isNCRMode,
    showBarangay,
    setValue,
    onProvinceChange,
    onMunicipalityChange,
    onBarangayChange,
    trigger,
  });

  // State to track initial municipality value and loading status
  const [initialMunicipalityValue] = useState(
    getValues(municipalityFieldName) || ''
  );
  const [isInitialMunicipalityLoadComplete, setIsInitialMunicipalityLoadComplete] =
    useState(false);

  // Effect to handle initial loading for municipality in edit scenarios
  useEffect(() => {
    if (
      initialMunicipalityValue &&
      municipalities.length > 0 &&
      !isInitialMunicipalityLoadComplete
    ) {
      const matchingMunicipality = municipalities.find(
        (mun) =>
          mun.displayName.toLowerCase() === initialMunicipalityValue.toLowerCase()
      );

      if (matchingMunicipality) {
        handleMunicipalityChange(matchingMunicipality.id);
        setIsInitialMunicipalityLoadComplete(true);
      }
    }
  }, [
    initialMunicipalityValue,
    municipalities,
    isInitialMunicipalityLoadComplete,
    handleMunicipalityChange,
  ]);

  // State to track initial barangay value and loading status
  const [initialBarangayValue] = useState(
    getValues(barangayFieldName) || ''
  );
  const [isInitialBarangayLoadComplete, setIsInitialBarangayLoadComplete] =
    useState(false);

  // Effect to handle initial loading for barangay in edit scenarios
  useEffect(() => {
    if (
      initialBarangayValue &&
      barangays.length > 0 &&
      !isInitialBarangayLoadComplete
    ) {
      const matchingBarangay = barangays.find(
        (bar) =>
          bar.name.toLowerCase() === initialBarangayValue.toLowerCase()
      );

      if (matchingBarangay) {
        handleBarangayChange(matchingBarangay.name);
        setIsInitialBarangayLoadComplete(true);
      }
    }
  }, [
    initialBarangayValue,
    barangays,
    isInitialBarangayLoadComplete,
    handleBarangayChange,
  ]);

  // Styling classes for select triggers.
  const selectTriggerClasses =
    'h-10 px-3 text-base md:text-sm rounded-md border border-muted-foreground/90 bg-background text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800';

  const isMunicipalityDisabled = !selectedProvince;

  // Prevent the FormLabel from turning red by using a custom wrapper component
  const CustomFormLabel: React.FC<{
    children: React.ReactNode;
    className?: string;
  }> = ({ children, className }) => (
    <FormLabel className={className} style={{ color: 'inherit' }}>
      {children}
    </FormLabel>
  );

  return (
    <>
      {/* Province/Region Field - Made Optional */}
      <FormField
        control={control}
        name={provinceFieldName}
        render={({ field, fieldState }) => (
          <FormItem className={formItemClassName}>
            <CustomFormLabel className={formLabelClassName}>
              {isNCRMode ? 'Region' : provinceLabel}
            </CustomFormLabel>
            <FormControl>
              <Select
                value={selectedProvince}
                onValueChange={(value: string) => {
                  field.onChange(value);
                  handleProvinceChange(value);
                  trigger(provinceFieldName);
                }}
                disabled={isNCRMode}
              >
                <SelectTrigger ref={field.ref} className={selectTriggerClasses}>
                  <SelectValue
                    placeholder={isNCRMode ? 'Metro Manila' : provincePlaceholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((prov) => (
                    <SelectItem key={prov.psgc_id} value={prov.psgc_id}>
                      {isNCRMode ? 'Metro Manila' : prov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {isSubmitted && fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Municipality/City Field - Made Optional */}
      <Controller
        control={control}
        name={municipalityFieldName}
        // Removed validation rules to make field optional
        render={({ field, fieldState }) => (
          <FormItem className={formItemClassName}>
            <CustomFormLabel className={formLabelClassName}>
              {municipalityLabel}
            </CustomFormLabel>
            <FormControl>
              <Select
                value={selectedMunicipality}
                onValueChange={(value: string) => {
                  const selectedMun = municipalities.find(
                    (m) => m.id === value
                  );
                  if (selectedMun) {
                    field.onChange(selectedMun.displayName);
                    handleMunicipalityChange(value);
                    clearErrors(municipalityFieldName);
                  }
                }}
                disabled={isMunicipalityDisabled}
              >
                <SelectTrigger ref={field.ref} className={selectTriggerClasses}>
                  <SelectValue placeholder={municipalityPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((mun) => (
                    <SelectItem key={mun.id} value={mun.id}>
                      {mun.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {isSubmitted && fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Barangay Field - Made Optional */}
      {showBarangay && (
        <FormField
          control={control}
          name={barangayFieldName}
          render={({ field, fieldState }) => (
            <FormItem className={formItemClassName}>
              <CustomFormLabel className={formLabelClassName}>
                {barangayLabel}
              </CustomFormLabel>
              <FormControl>
                <Select
                  value={selectedBarangay}
                  onValueChange={(value: string) => {
                    field.onChange(value);
                    handleBarangayChange(value);
                    trigger(barangayFieldName);
                  }}
                  disabled={!selectedMunicipality}
                >
                  <SelectTrigger ref={field.ref} className={selectTriggerClasses}>
                    <SelectValue placeholder={barangayPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((bar) => (
                      <SelectItem key={bar.id} value={bar.name}>
                        {bar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {isSubmitted && fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default LocationSelector;