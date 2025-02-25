import {
  Barangay,
  getAllProvinces,
  getBarangaysByLocation,
  getCachedCitySuggestions,
  LocationSuggestion,
  Province,
} from '@/lib/utils/location-helpers'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

interface UseLocationSelectorProps {
  provinceFieldName: string
  municipalityFieldName: string
  barangayFieldName?: string
  isNCRMode: boolean
  showBarangay?: boolean
  setValue: (name: string, value: any) => void
  onProvinceChange?: (province: string) => void
  onMunicipalityChange?: (municipality: string) => void
  onBarangayChange?: (barangay: string) => void
  trigger?: (name: string | string[]) => Promise<boolean>
}

const NCR_PROVINCE_ID = 'metro-manila'
const NCR_PROVINCE_DISPLAY = 'Metro Manila'

export const useLocationSelector = ({
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
}: UseLocationSelectorProps) => {
  const { clearErrors, getValues, setError } = useFormContext()

  // Get provinces (using static list if in NCR mode)
  const provinces: Province[] = useMemo(() => {
    return isNCRMode
      ? [
        {
          psgc_id: NCR_PROVINCE_ID,
          name: NCR_PROVINCE_DISPLAY,
          geographic_level: 'Region',
          correspondence_code: '130000000',
          old_names: '',
          city_class: '',
          income_classification: '',
          urban_rural: '',
          population: '',
          status: '',
        },
      ]
      : getAllProvinces()
  }, [isNCRMode])

  // Read default province value from RHF.
  const defaultProvinceValue = getValues(provinceFieldName) || ''
  // If not in NCR mode and no default is provided, leave province empty.
  const defaultProvinceId =
    isNCRMode
      ? NCR_PROVINCE_ID
      : defaultProvinceValue
        ? provinces.find(
          (p) =>
            p.name === defaultProvinceValue || p.psgc_id === defaultProvinceValue
        )?.psgc_id || ''
        : ''
  const [selectedProvince, setSelectedProvince] = useState<string>(defaultProvinceId)

  // Municipalities depend on the selected province.
  const municipalities: LocationSuggestion[] = useMemo(() => {
    if (!selectedProvince) return []
    return getCachedCitySuggestions(selectedProvince, isNCRMode)
  }, [selectedProvince, isNCRMode])

  // Read default municipality value.
  const defaultMunicipalityValue = getValues(municipalityFieldName) || ''
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('')

  // Comprehensive function to find and set municipality
  const findAndSetMunicipality = useCallback((municipalities: LocationSuggestion[], municipalityValue: string) => {
    // Exact match first (case-sensitive)
    let matchedMunicipality = municipalities.find(
      (m) => m.displayName === municipalityValue
    )

    // If no exact match, try case-insensitive
    if (!matchedMunicipality) {
      matchedMunicipality = municipalities.find(
        (m) => m.displayName.toLowerCase() === municipalityValue.toLowerCase()
      )
    }

    // Last resort: match partial
    if (!matchedMunicipality) {
      matchedMunicipality = municipalities.find(
        (m) => m.displayName.toLowerCase().includes(municipalityValue.toLowerCase())
      )
    }

    if (matchedMunicipality) {
      console.log('Found matching municipality:', {
        input: municipalityValue,
        matched: matchedMunicipality
      })

      setSelectedMunicipality(matchedMunicipality.id)
      setValue(municipalityFieldName, matchedMunicipality.displayName)
      clearErrors(municipalityFieldName)
      return true
    }

    console.warn('No matching municipality found:', {
      input: municipalityValue,
      availableMunicipalities: municipalities.map(m => m.displayName)
    })

    // Set error if no match found
    setError(municipalityFieldName, {
      type: 'manual',
      message: 'Invalid city/municipality'
    })

    return false
  }, [setValue, clearErrors, setError, municipalityFieldName])

  // When province or municipality list changes, update the municipality state if a default exists.
  useEffect(() => {
    if (selectedProvince && municipalities.length > 0 && !selectedMunicipality) {
      findAndSetMunicipality(municipalities, defaultMunicipalityValue)
    }
  }, [
    selectedProvince,
    municipalities,
    defaultMunicipalityValue,
    selectedMunicipality,
    findAndSetMunicipality,
  ])

  // Barangays based on selected municipality.
  const barangays = useMemo((): { id: string; name: string }[] => {
    if (!selectedMunicipality) return []
    const result: Barangay[] = getBarangaysByLocation(selectedMunicipality)
    return result.map((b) => ({ id: b.psgc_id, name: b.name }))
  }, [selectedMunicipality])

  // Read default barangay value.
  const defaultBarangayValue = barangayFieldName ? getValues(barangayFieldName) || '' : ''
  const [selectedBarangay, setSelectedBarangay] = useState<string>('')

  // When municipality or barangay list changes, update the barangay state if a default exists.
  useEffect(() => {
    if (selectedMunicipality && barangays.length > 0 && !selectedBarangay && defaultBarangayValue) {
      const defaultBar = barangays.find((b) => b.name === defaultBarangayValue)
      if (defaultBar) {
        setSelectedBarangay(defaultBar.id)
        if (barangayFieldName) {
          setValue(barangayFieldName, defaultBar.name)
        }
      }
    }
  }, [
    selectedMunicipality,
    barangays,
    defaultBarangayValue,
    selectedBarangay,
    barangayFieldName,
    setValue,
  ])

  // If in NCR mode, always set province to Metro Manila.
  useEffect(() => {
    if (isNCRMode) {
      setSelectedProvince(NCR_PROVINCE_ID)
      setValue(provinceFieldName, NCR_PROVINCE_DISPLAY)
      clearErrors(provinceFieldName)
    }
  }, [isNCRMode, provinceFieldName, setValue, clearErrors])

  // When province changes, clear municipality and barangay.
  useEffect(() => {
    setSelectedMunicipality('')
    setSelectedBarangay('')
    setValue(municipalityFieldName, '')
    if (barangayFieldName) {
      setValue(barangayFieldName, '')
    }
    if (trigger) {
      const fieldsToTrigger = [provinceFieldName, municipalityFieldName]
      if (barangayFieldName) fieldsToTrigger.push(barangayFieldName)
      void trigger(fieldsToTrigger)
    }
  }, [selectedProvince, municipalityFieldName, barangayFieldName, setValue, trigger, provinceFieldName])

  const handleProvinceChange = async (value: string) => {
    if (value === selectedProvince) return
    setSelectedProvince(value)
    setSelectedMunicipality('')
    setSelectedBarangay('')
    const selectedProvinceName =
      isNCRMode || provinces.find((p) => p.psgc_id === value)?.name === undefined
        ? NCR_PROVINCE_DISPLAY
        : provinces.find((p) => p.psgc_id === value)?.name || ''
    setValue(provinceFieldName, selectedProvinceName)
    setValue(municipalityFieldName, '')
    if (barangayFieldName) {
      setValue(barangayFieldName, '')
    }
    if (trigger) {
      const fieldsToTrigger = [provinceFieldName, municipalityFieldName]
      if (barangayFieldName) fieldsToTrigger.push(barangayFieldName)
      await trigger(fieldsToTrigger)
    }
    onProvinceChange?.(selectedProvinceName)
  }

  const handleMunicipalityChange = async (value: string) => {
    if (value === selectedMunicipality) return

    // Use the comprehensive find and set method
    const foundMunicipality = municipalities.find(
      (m) => m.id === value || m.displayName === value
    )

    if (!foundMunicipality) {
      console.warn('No municipality found for value:', value)
      return
    }

    setSelectedMunicipality(foundMunicipality.id)
    setSelectedBarangay('')

    setValue(municipalityFieldName, foundMunicipality.displayName)

    if (barangayFieldName) {
      setValue(barangayFieldName, '')
    }

    if (trigger) {
      const fieldsToTrigger = [municipalityFieldName]
      if (barangayFieldName) fieldsToTrigger.push(barangayFieldName)
      await trigger(fieldsToTrigger)
    }

    onMunicipalityChange?.(foundMunicipality.displayName)
  }

  const handleBarangayChange = async (value: string) => {
    if (value === selectedBarangay) return
    setSelectedBarangay(value)
    if (barangayFieldName) {
      setValue(barangayFieldName, value)
    }
    if (trigger && barangayFieldName) {
      await trigger(barangayFieldName)
    }
    onBarangayChange?.(value)
  }

  return {
    selectedProvince,
    selectedMunicipality,
    selectedBarangay,
    provinces,
    municipalities,
    barangays,
    handleProvinceChange,
    handleMunicipalityChange,
    handleBarangayChange,
  }
}