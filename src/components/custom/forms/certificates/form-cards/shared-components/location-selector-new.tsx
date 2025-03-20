"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocationSelector } from "@/hooks/use-location-selector";
import { LocationSelectorProps } from "@/lib/types/location-selector";
import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { countries } from "@/lib/countries";

// Extended props interface with additional properties
interface ExtendedLocationSelectorProps extends LocationSelectorProps {
  countryFieldName?: string;
  countryLabel?: string;
  countryPlaceholder?: string;
  onCountryChange?: (country: string) => void;
  defaultCountry?: string;
  // New field for international address
  internationalAddressFieldName?: string;
  internationalAddressLabel?: string;
  internationalAddressPlaceholder?: string;
}

const LocationSelectorNew: React.FC<ExtendedLocationSelectorProps> = ({
  provinceFieldName = "province",
  municipalityFieldName = "cityMunicipality",
  barangayFieldName = "barangay",
  countryFieldName = "country",
  internationalAddressFieldName = "internationalAddress",
  provinceLabel = "Province",
  municipalityLabel = "City/Municipality",
  barangayLabel = "Barangay",
  countryLabel = "Country",
  internationalAddressLabel = "Complete Address",
  isNCRMode = false,
  showBarangay = false,
  provincePlaceholder = "Select a province...",
  municipalityPlaceholder = "Select a city/municipality...",
  barangayPlaceholder = "Select a barangay...",
  countryPlaceholder = "Select a country...",
  internationalAddressPlaceholder = "Enter complete address...",
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  onCountryChange,
  formItemClassName = "",
  formLabelClassName = "",
  defaultCountry = "Philippines",
}) => {
  const {
    control,
    trigger,
    setValue,
    getValues,
    clearErrors,
    formState: { isSubmitted },
  } = useFormContext();

  // State for custom country input
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  // State to track selected country
  const [selectedCountry, setSelectedCountry] = useState<string>(
    getValues(countryFieldName) || defaultCountry
  );

  // Check if Philippines is selected
  const isPhilippines = selectedCountry === "Philippines";

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
    getValues(municipalityFieldName) || ""
  );
  const [
    isInitialMunicipalityLoadComplete,
    setIsInitialMunicipalityLoadComplete,
  ] = useState(false);

  // Effect to handle initial loading for municipality in edit scenarios
  useEffect(() => {
    if (
      initialMunicipalityValue &&
      municipalities.length > 0 &&
      !isInitialMunicipalityLoadComplete &&
      isPhilippines
    ) {
      const matchingMunicipality = municipalities.find(
        (mun) =>
          mun.displayName.toLowerCase() ===
          initialMunicipalityValue.toLowerCase()
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
    isPhilippines,
  ]);

  // State to track initial barangay value and loading status
  const [initialBarangayValue] = useState(getValues(barangayFieldName) || "");
  const [isInitialBarangayLoadComplete, setIsInitialBarangayLoadComplete] =
    useState(false);

  // Effect to handle initial loading for barangay in edit scenarios
  useEffect(() => {
    if (
      initialBarangayValue &&
      barangays.length > 0 &&
      !isInitialBarangayLoadComplete &&
      isPhilippines
    ) {
      const matchingBarangay = barangays.find(
        (bar) => bar.name.toLowerCase() === initialBarangayValue.toLowerCase()
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
    isPhilippines,
  ]);

  // Handle country change
  const handleCountryChange = (value: string) => {
    if (value === "Other") {
      setIsCustomCountry(true);
      setValue(countryFieldName, "");
    } else {
      setIsCustomCountry(false);
      setSelectedCountry(value);

      // Clear fields based on country selection
      if (value !== "Philippines") {
        // Clear Philippine-specific fields
        setValue(provinceFieldName, "");
        setValue(municipalityFieldName, "");
        if (showBarangay) {
          setValue(barangayFieldName, "");
        }
      } else {
        // Clear international address field
        setValue(internationalAddressFieldName, "");
      }

      // Call the onCountryChange callback if provided
      if (onCountryChange) {
        onCountryChange(value);
      }
    }
  };

  // Styling classes for select triggers and inputs
  const selectTriggerClasses =
    "h-10 px-3 text-base md:text-sm rounded-md border border-muted-foreground/90 bg-background text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800";

  const isMunicipalityDisabled = !selectedProvince || !isPhilippines;

  // Prevent the FormLabel from turning red by using a custom wrapper component
  const CustomFormLabel: React.FC<{
    children: React.ReactNode;
    className?: string;
  }> = ({ children, className }) => (
    <FormLabel className={className} style={{ color: "inherit" }}>
      {children}
    </FormLabel>
  );

  return (
    <>
      {/* Country Field with Other option */}
      <FormField
        control={control}
        name={countryFieldName}
        render={({ field, fieldState }) => (
          <FormItem className={formItemClassName}>
            <CustomFormLabel className={formLabelClassName}>
              {countryLabel}
            </CustomFormLabel>
            <FormControl>
              {!isCustomCountry ? (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value: string) => {
                    field.onChange(value);
                    handleCountryChange(value);
                    trigger(countryFieldName);
                  }}
                >
                  <SelectTrigger
                    ref={field.ref}
                    className={selectTriggerClasses}
                  >
                    <SelectValue placeholder={countryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">
                      Other (please specify)
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter country name"
                    {...field}
                    className={selectTriggerClasses}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSelectedCountry(e.target.value);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsCustomCountry(false);
                      setValue(countryFieldName, "Philippines");
                      setSelectedCountry("Philippines");
                    }}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </FormControl>
            {isSubmitted && fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </FormItem>
        )}
      />

      {isPhilippines ? (
        // Filipino Address Format (Dropdown Selectors)
        <>
          {/* Province/Region Field */}
          <FormField
            control={control}
            name={provinceFieldName}
            render={({ field, fieldState }) => (
              <FormItem className={formItemClassName}>
                <CustomFormLabel className={formLabelClassName}>
                  {isNCRMode ? "Region" : provinceLabel}
                </CustomFormLabel>
                <FormControl>
                  <Select
                    value={selectedProvince || undefined}
                    onValueChange={(value: string) => {
                      field.onChange(value);
                      handleProvinceChange(value);
                      trigger(provinceFieldName);
                    }}
                    disabled={isNCRMode}
                  >
                    <SelectTrigger
                      ref={field.ref}
                      className={selectTriggerClasses}
                    >
                      <SelectValue
                        placeholder={
                          isNCRMode ? "Metro Manila" : provincePlaceholder
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov.psgc_id} value={prov.psgc_id}>
                          {isNCRMode ? "Metro Manila" : prov.name}
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

          {/* Municipality/City Field */}
          <Controller
            control={control}
            name={municipalityFieldName}
            render={({ field, fieldState }) => (
              <FormItem className={formItemClassName}>
                <CustomFormLabel className={formLabelClassName}>
                  {municipalityLabel}
                </CustomFormLabel>
                <FormControl>
                  <Select
                    value={selectedMunicipality || undefined}
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
                    <SelectTrigger
                      ref={field.ref}
                      className={selectTriggerClasses}
                    >
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

          {/* Barangay Field */}
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
                      value={selectedBarangay || undefined}
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        handleBarangayChange(value);
                        trigger(barangayFieldName);
                      }}
                      disabled={!selectedMunicipality}
                    >
                      <SelectTrigger
                        ref={field.ref}
                        className={selectTriggerClasses}
                      >
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
      ) : (
        // International Address Format (Single Input for Complete Address)
        <FormField
          control={control}
          name={internationalAddressFieldName}
          render={({ field, fieldState }) => (
            <FormItem className={formItemClassName}>
              <CustomFormLabel className={formLabelClassName}>
                {internationalAddressLabel}
              </CustomFormLabel>
              <FormControl>
                <Input
                  placeholder={internationalAddressPlaceholder}
                  {...field}
                  className={selectTriggerClasses}
                />
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

export default LocationSelectorNew;
