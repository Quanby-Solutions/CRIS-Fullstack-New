"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { useFormContext, useWatch } from "react-hook-form";
import {
  MarriageCertificateFormValues,
  MarriageProps,
} from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import LocationSelector from "../shared-components/location-selector";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import LocationSelectorNew from "../shared-components/location-selector-new";
import CivilStatus from "../shared-components/civil-status";

const WifeInfoCard: React.FC = () => {
  const { control, setValue, getValues } =
    useFormContext<MarriageCertificateFormValues>();
  const [wifeNcrMode, setNcrMode] = useState(false);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("wifePlaceOfBirth.province");
    if (province === "Metro Manila" || province === "NCR") {
      setNcrMode(true);
    }
  }, [getValues]);

  // Auto-calculate and set age when birthdate changes
  const birthDate = useWatch({ control, name: "wifeBirth" });

  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();

      let age = today.getFullYear() - birth.getFullYear();

      // Check if the birth month and day have not yet occurred in the current year
      const isBirthdayNotPassed =
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate());

      if (isBirthdayNotPassed) {
        age -= 1; // Subtract 1 year if the birthday hasn't occurred yet this year
      }

      setValue("wifeAge", age); // Update the age field
    }
  }, [birthDate, setValue]);

  useEffect(() => {
    if (wifeNcrMode === true) {
      setValue("wifePlaceOfBirth.province", "Metro Manila");
    }
  });

  return (
    <Card className="border dark:border-border">
      <CardHeader>
        <CardTitle>Wife&apos;s Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* First Name */}
          <FormField
            control={control}
            name="wifeName.first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter first name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Middle Name */}
          <FormField
            control={control}
            name="wifeName.middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter middle name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Last Name */}
          <FormField
            control={control}
            name="wifeName.last"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter last name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Sex */}
          <FormField
            control={control}
            name="wifeSex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "Female"}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Date of Birth */}
          <FormField
            control={control}
            name="wifeBirth"
            render={({ field }) => (
              <DatePickerField
                field={{
                  onChange: field.onChange,
                  value: field.value || "",
                }}
                label="Date of Birth"
              />
            )}
          />
          {/* Age - Auto-filled */}
          <FormField
            control={control}
            name="wifeAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    type="number"
                    placeholder="Enter age"
                    {...field}
                    value={field.value || ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Citizenship */}
          <FormField
            control={control}
            name="wifeCitizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citizenship</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter citizenship"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Religion */}
          <FormField
            control={control}
            name="wifeReligion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion/Religious Sect</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter religion"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Civil Status */}
          <CivilStatus
            name="wifeCivilStatus"
            label="Civil Status"
            placeholder="Select civil status"
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Widow", label: "Widow" },
              { value: "Widower", label: "Widower" },
              { value: "Annulled", label: "Annulled" },
              { value: "Divorced", label: "Divorced" },
            ]}
            otherOptionValue="Other"
            otherOptionLabel="Other (please specify)"
          />
        </div>
        <div className="col-span-3 py-4">
          <CardTitle>Place Of Birth</CardTitle>
        </div>
        <div className="col-span-1 md:col-span-3">
          <NCRModeSwitch isNCRMode={wifeNcrMode} setIsNCRMode={setNcrMode} />
        </div>
        {/* Place of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Place of Birth */}
          <LocationSelectorNew
            countryFieldName="wifePlaceOfBirth.country"
            provinceFieldName="wifePlaceOfBirth.province"
            municipalityFieldName="wifePlaceOfBirth.cityMunicipality"
            barangayFieldName="wifePlaceOfBirth.barangay"
            internationalAddressFieldName="wifePlaceOfBirth.internationalAddress"
            countryLabel="Country"
            provinceLabel="Province"
            municipalityLabel="City/Municipality"
            barangayLabel="Barangay"
            isNCRMode={wifeNcrMode}
            showBarangay={true}
            countryPlaceholder="Select country"
            provincePlaceholder="Select province"
            municipalityPlaceholder="Select city/municipality"
            barangayPlaceholder="Select barangay"
            internationalAddressPlaceholder="Enter complete address including street, city, province/state, and postal code"
            defaultCountry="Philippines"
            onCountryChange={(country) => {
              // Optional: Add any additional logic you need when country changes
              console.log("Country changed to:", country);
            }}
          />

          {/* Residence */}

          <FormField
            control={control}
            name="wifePlaceOfBirth.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter complete address"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="wifePlaceOfBirth.residence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residence</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter complete address"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WifeInfoCard;
