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
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { BirthCertificateFormValues } from "@/lib/types/zod-form-certificate/birth-certificate-form-schema";
import LocationSelector from "../shared-components/location-selector";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import ReligionSelector from "../shared-components/religion-selector";

const FatherInformationCard: React.FC = () => {
  const { control, watch, setValue, trigger } =
    useFormContext<BirthCertificateFormValues>();
  const [ncrMode, setNcrMode] = useState(false);

  // Watch the father's province for residence
  const province = watch("fatherInfo.residence.province");

  // Helper: extract province string if it comes as an object
  const getProvinceString = (provinceValue: any): string => {
    if (typeof provinceValue === "string") {
      return provinceValue;
    } else if (
      provinceValue &&
      typeof provinceValue === "object" &&
      provinceValue.label
    ) {
      return provinceValue.label;
    }
    return "";
  };

  useEffect(() => {
    const provinceString = getProvinceString(province) || "Metro Manila";

    // Determine if the province should be NCR (Metro Manila) or not
    const shouldBeNCR = provinceString.trim().toLowerCase() === "metro manila";
    setNcrMode(shouldBeNCR);

    // Set the province value based on whether NCR mode is true or false
    setValue(
      "fatherInfo.residence.province",
      shouldBeNCR ? "Metro Manila" : provinceString,
      {
        shouldValidate: true, // Trigger validation immediately
        shouldDirty: true, // Mark the field as dirty to ensure validation
      }
    );

    // Manually trigger revalidation of the province field after setting the value
    trigger("fatherInfo.residence.province");
  }, [province]); // Runs whenever province changes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Father Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <strong>14.</strong> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="fatherInfo.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter first name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="fatherInfo.middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter middle name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="fatherInfo.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={control}
                name="fatherInfo.citizenship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <strong>15.</strong> Citizenship
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter citizenship"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="fatherInfo.religion"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      <strong>16.</strong> Religion/Religious Sect
                    </FormLabel>
                    <FormControl>
                      <ReligionSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        ref={field.ref}
                        placeholder="Select religion"
                        name="fatherInfo.religion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="fatherInfo.occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <strong>17.</strong> Occupation
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter occupation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="fatherInfo.age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <strong>18.</strong> Age at time of this birth (in
                      completed years)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter age"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value); // Allow any input
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

        {/* Residence Information Section */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <strong>19.</strong> Residence Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NCRModeSwitch isNCRMode={ncrMode} setIsNCRMode={setNcrMode} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LocationSelector
                provinceFieldName="fatherInfo.residence.province"
                municipalityFieldName="fatherInfo.residence.cityMunicipality"
                barangayFieldName="fatherInfo.residence.barangay"
                provinceLabel="Province"
                municipalityLabel="City/Municipality"
                barangayLabel="Barangay"
                isNCRMode={ncrMode}
                showBarangay={true}
                provincePlaceholder="Select province"
                municipalityPlaceholder="Select city/municipality"
                barangayPlaceholder="Select barangay"
              />
              {/* House Number */}
              <FormField
                control={control}
                name="fatherInfo.residence.houseNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House No.</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter house number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street */}
              <FormField
                control={control}
                name="fatherInfo.residence.st"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter street"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={control}
                name="fatherInfo.residence.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter country"
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
      </CardContent>
    </Card>
  );
};

export default FatherInformationCard;
