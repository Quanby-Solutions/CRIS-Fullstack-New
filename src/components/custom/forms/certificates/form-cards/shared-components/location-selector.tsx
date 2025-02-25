'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocationSelector } from '@/hooks/use-location-selector'
import { LocationSelectorProps } from '@/lib/types/location-selector'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'

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
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext()

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
  })

  // State to track initial values
  const [initialMunicipalityValue] = useState(getValues(municipalityFieldName) || '')

  // Styling classes for select triggers.
  const selectTriggerClasses =
    'h-10 px-3 text-base md:text-sm rounded-md border border-muted-foreground/90 bg-background text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800'

  // Determine if municipality should be disabled
  const isMunicipalityDisabled = !selectedProvince && !initialMunicipalityValue

  return (
    <>
      {/* Province/Region Field */}
      <FormField
        control={control}
        name={provinceFieldName}
        render={({ field, fieldState }) => (
          <FormItem className={formItemClassName}>
            <FormLabel className={formLabelClassName}>
              {isNCRMode ? 'Region' : provinceLabel}
            </FormLabel>
            <FormControl>
              <Select
                value={selectedProvince}
                onValueChange={(value: string) => {
                  field.onChange(value)
                  handleProvinceChange(value)
                  trigger(provinceFieldName)
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
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />

      {/* Municipality/City Field */}
      <Controller
        control={control}
        name={municipalityFieldName}
        rules={{
          validate: {
            required: () => {
              // If province is selected or there's an initial value, skip validation
              if (selectedProvince || initialMunicipalityValue) return true
              return 'City/Municipality is required'
            }
          }
        }}
        render={({ field, fieldState }) => (
          <FormItem className={formItemClassName}>
            <FormLabel className={formLabelClassName}>{municipalityLabel}</FormLabel>
            <FormControl>
              <Select
                value={selectedMunicipality}
                onValueChange={(value: string) => {
                  // Find the full municipality details
                  const selectedMun = municipalities.find(m => m.id === value)

                  if (selectedMun) {
                    // Set the value using Controller's onChange
                    field.onChange(selectedMun.displayName)

                    // Update selected municipality
                    handleMunicipalityChange(value)

                    // Clear any previous errors
                    clearErrors(municipalityFieldName)
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
            {/* Show error message only if a province is selected */}
            <FormMessage>
              {selectedProvince || initialMunicipalityValue ? '' : fieldState.error?.message}
            </FormMessage>
          </FormItem>
        )}
      />

      {/* Barangay Field (if applicable) */}
      {showBarangay && (
        <FormField
          control={control}
          name={barangayFieldName}
          render={({ field, fieldState }) => (
            <FormItem className={formItemClassName}>
              <FormLabel className={formLabelClassName}>{barangayLabel}</FormLabel>
              <FormControl>
                <Select
                  value={selectedBarangay}
                  onValueChange={(value: string) => {
                    field.onChange(value)
                    handleBarangayChange(value)
                    trigger(barangayFieldName)
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
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
      )}
    </>
  )
}

export default LocationSelector