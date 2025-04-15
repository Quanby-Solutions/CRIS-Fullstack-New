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
import { countries } from "@/lib/countries";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

// Define TypeScript interfaces for location data
interface BarangayData {
  barangay_list: string[];
}

interface MunicipalityData {
  municipality_list: {
    [key: string]: BarangayData;
  };
}

interface ProvinceData {
  province_list: {
    [key: string]: MunicipalityData;
  };
}

interface RegionData {
  region_name: string;
  province_list: {
    [key: string]: MunicipalityData;
  };
}

interface LocationDataType {
  [key: string]: RegionData;
}

// Define types for our state objects
interface Province {
  name: string;
  regionKey: string;
  regionName: string;
  displayName: string; // For title case display
}

interface Municipality {
  name: string;
  provinceName: string;
  displayName: string; // For title case display
}

interface Barangay {
  name: string;
  municipalityName: string;
  displayName: string; // For title case display
}

// Import the location data directly
import locationData from "@/lib/utils/ph-location.json";

// Helper function to simply capitalize the first letter of every word
const toTitleCase = (text: string): string => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // For hyphenated words
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");
      }

      // Standard word capitalization
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Format words in parentheses while preserving them
const formatWithParentheses = (text: string): string => {
  if (!text.includes("(")) return toTitleCase(text);

  return text.replace(/([^(]+)(\([^)]+\))/g, (match, before, parentheses) => {
    // Title case the text before parentheses
    const formattedBefore = toTitleCase(before);

    // Title case inside the parentheses, but keep the parentheses
    const formattedParentheses =
      "(" + toTitleCase(parentheses.slice(1, -1)) + ")";

    return formattedBefore + formattedParentheses;
  });
};

const PlaceOfDeathCards = () => {
  const {
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  // States to track our selected values
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("");

  // Track if data has been initialized
  const [initialized, setInitialized] = useState<boolean>(false);

  // States to store available options
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // Set default country to Philippines on component mount
  useEffect(() => {
    const currentCountry = watch("placeOfDeath.country");
    if (!currentCountry) {
      setValue("placeOfDeath.country", "Philippines");
    }
  }, [setValue, watch]);

  // Extract and organize provinces from the JSON data
  useEffect(() => {
    const extractedProvinces: Province[] = [];
    const typedLocationData = locationData as unknown as LocationDataType;

    // Process each region in the locationData
    Object.keys(typedLocationData).forEach((regionKey) => {
      const region = typedLocationData[regionKey];

      // Add each province from this region
      Object.keys(region.province_list).forEach((provinceName) => {
        extractedProvinces.push({
          name: provinceName,
          regionKey: regionKey,
          regionName: region.region_name,
          displayName: formatWithParentheses(provinceName),
        });
      });
    });

    // Sort provinces alphabetically
    extractedProvinces.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    setProvinces(extractedProvinces);
  }, []);

  // Load initial values if they exist
  useEffect(() => {
    if (provinces.length > 0 && !initialized) {
      const currentProvince = getValues("placeOfDeath.province");
      const currentMunicipality = getValues("placeOfDeath.cityMunicipality");
      const currentBarangay = getValues("placeOfDeath.barangay");

      if (currentProvince) {
        console.log("Found province:", currentProvince);
        setSelectedProvince(currentProvince);

        // Load municipalities for this province
        const typedLocationData = locationData as unknown as LocationDataType;
        let foundMunicipalities: Municipality[] = [];

        Object.keys(typedLocationData).forEach((regionKey) => {
          const region = typedLocationData[regionKey];
          if (region.province_list[currentProvince]) {
            foundMunicipalities = Object.keys(
              region.province_list[currentProvince].municipality_list
            ).map((name) => ({
              name: name,
              provinceName: currentProvince,
              displayName: formatWithParentheses(name),
            }));
          }
        });

        foundMunicipalities.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
        setMunicipalities(foundMunicipalities);

        if (currentMunicipality && foundMunicipalities.length > 0) {
          console.log("Found municipality:", currentMunicipality);
          setSelectedMunicipality(currentMunicipality);

          // Load barangays for this municipality
          let foundBarangays: Barangay[] = [];

          Object.keys(typedLocationData).forEach((regionKey) => {
            const region = typedLocationData[regionKey];
            if (region.province_list[currentProvince]) {
              // Find the actual municipality name in the data (might differ in case, etc.)
              const municipalityMatch = foundMunicipalities.find(
                (m) =>
                  m.name.toLowerCase() === currentMunicipality.toLowerCase()
              );

              if (
                municipalityMatch &&
                region.province_list[currentProvince].municipality_list[
                  municipalityMatch.name
                ]
              ) {
                foundBarangays = region.province_list[
                  currentProvince
                ].municipality_list[municipalityMatch.name].barangay_list.map(
                  (name) => ({
                    name: name,
                    municipalityName: municipalityMatch.name,
                    displayName: formatWithParentheses(name),
                  })
                );
              }
            }
          });

          foundBarangays.sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          );
          setBarangays(foundBarangays);

          if (currentBarangay) {
            console.log("Found barangay:", currentBarangay);
            setSelectedBarangay(currentBarangay);
          }
        }
      }

      setInitialized(true);
    }
  }, [provinces, getValues, initialized]);

  // Handler for province selection
  const handleProvinceSelection = (provinceName: string) => {
    // Find the municipalities for this province
    let foundMunicipalities: Municipality[] = [];
    const typedLocationData = locationData as unknown as LocationDataType;

    // Search through each region
    Object.keys(typedLocationData).forEach((regionKey) => {
      const region = typedLocationData[regionKey];

      // Check if this province exists in this region
      if (region.province_list[provinceName]) {
        // Get all municipalities for this province
        foundMunicipalities = Object.keys(
          region.province_list[provinceName].municipality_list
        ).map((name) => ({
          name: name,
          provinceName: provinceName,
          displayName: formatWithParentheses(name),
        }));
      }
    });

    // Sort municipalities alphabetically
    foundMunicipalities.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
    setMunicipalities(foundMunicipalities);

    // Clear municipality and barangay selections
    setSelectedMunicipality("");
    setSelectedBarangay("");
    setValue("placeOfDeath.cityMunicipality", "");
    setValue("placeOfDeath.barangay", "");
    setBarangays([]);
  };

  // Handler for municipality selection
  const handleMunicipalitySelection = (
    provinceName: string,
    municipalityName: string
  ) => {
    // Find the barangays for this municipality
    let foundBarangays: Barangay[] = [];
    const typedLocationData = locationData as unknown as LocationDataType;

    // Search through each region
    Object.keys(typedLocationData).forEach((regionKey) => {
      const region = typedLocationData[regionKey];

      // Check if this province exists in this region
      if (region.province_list[provinceName]) {
        // Check if this municipality exists in this province
        if (
          region.province_list[provinceName].municipality_list[municipalityName]
        ) {
          // Get all barangays for this municipality
          foundBarangays = region.province_list[provinceName].municipality_list[
            municipalityName
          ].barangay_list.map((name) => ({
            name: name,
            municipalityName: municipalityName,
            displayName: formatWithParentheses(name),
          }));
        }
      }
    });

    // Sort barangays alphabetically
    foundBarangays.sort((a, b) => a.displayName.localeCompare(b.displayName));
    setBarangays(foundBarangays);

    // Clear barangay selection
    setSelectedBarangay("");
    setValue("placeOfDeath.barangay", "");
  };

  // Watch for country selection
  const selectedCountry = watch("placeOfDeath.country");
  const isPhilippines = selectedCountry === "Philippines" || !selectedCountry;

  return (
    <>
      {/* Country Field */}
      <FormField
        control={control}
        name="placeOfDeath.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Select
                value={field.value || "Philippines"}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Clear other fields if country changes
                  if (value !== "Philippines") {
                    setValue("placeOfDeath.province", "");
                    setValue("placeOfDeath.cityMunicipality", "");
                    setValue("placeOfDeath.barangay", "");
                    setSelectedProvince("");
                    setSelectedMunicipality("");
                    setSelectedBarangay("");
                  } else {
                    setValue("placeOfDeath.internationalAddress", "");
                  }
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional fields based on country selection */}
      {isPhilippines ? (
        <>
          {/* Province Field */}
          <FormField
            control={control}
            name="placeOfDeath.province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProvince(value);
                      handleProvinceSelection(value);
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={"Select province"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.name} value={province.name}>
                          {province.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City/Municipality Field */}
          <FormField
            control={control}
            name="placeOfDeath.cityMunicipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City/Municipality</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedMunicipality(value);
                      handleMunicipalitySelection(selectedProvince, value);
                    }}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select city/municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.length > 0 ? (
                        municipalities.map((municipality) => (
                          <SelectItem
                            key={municipality.name}
                            value={municipality.name}
                          >
                            {municipality.displayName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {selectedProvince
                            ? "No municipalities found"
                            : "Select a province first"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Barangay Field */}
          <FormField
            control={control}
            name="placeOfDeath.barangay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barangay</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter barangay name"
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : (
        // International address field for non-Philippines countries
        <FormField
          control={control}
          name="placeOfDeath.internationalAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complete Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter complete address including street, city, province/state, and postal code"
                  {...field}
                  value={field.value ?? ""}
                  className="h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Street Field (always shown) */}
      <FormField
        control={control}
        name="placeOfDeath.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street (optional)</FormLabel>
            <FormControl>
              <Input
                type="text"
                className="h-10"
                placeholder="Enter street address"
                {...field}
                value={field.value ?? ""}
                tabIndex={0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Residence Field (always shown) */}
      <FormField
        control={control}
        name="placeOfDeath.residence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Residence (optional)</FormLabel>
            <FormControl>
              <Input
                type="text"
                className="h-10"
                placeholder="Enter residence"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PlaceOfDeathCards;
