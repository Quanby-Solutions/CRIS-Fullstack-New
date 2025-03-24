"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSelectorNew from "../shared-components/location-selector-new";

const DisposalInformationCard: React.FC = () => {
  const { control, getValues, setValue, watch, clearErrors } =
    useFormContext<DeathCertificateFormValues>();
  const [disposalNcrMode, setDisposalNcrMode] = useState(false);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("cemeteryOrCrematory.address.province");
    if (province === "Metro Manila" || province === "NCR") {
      setDisposalNcrMode(true);
    }
  }, [getValues]);

  useEffect(() => {
    if (disposalNcrMode === true) {
      setValue("cemeteryOrCrematory.address.province", "Metro Manila");
    }
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Disposal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Disposal Method */}
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <FormField
            control={control}
            name="corpseDisposal"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>23. Corpse Disposal Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "Embalming"}
                >
                  <FormControl>
                    <SelectTrigger ref={field.ref} className="h-8.5">
                      <SelectValue placeholder="Select autopsy status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Embalming">Embalming</SelectItem>
                    <SelectItem value="Cremation">Cremation</SelectItem>
                    <SelectItem value="Burial">Burial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Burial/Cremation Permit Section */}
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              24a. Burial/Cremation Permit
            </h4>
            <FormField
              control={control}
              name="burialPermit.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permit Number</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter permit number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="burialPermit.dateIssued"
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Date Issued"
                    placeholder="Select date issued"
                    ref={field.ref}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Transfer Permit Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              24b. Transfer Permit (if applicable)
            </h4>
            <FormField
              control={control}
              name="transferPermit.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permit Number</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter permit number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="transferPermit.dateIssued"
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Date Issued"
                    placeholder="Select date issued"
                    ref={field.ref}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Cemetery or Crematory Information */}
        <Card className="space-y-4 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium uppercase">
              25. NAME and address of cemetery or crematory
            </CardTitle>
          </CardHeader>

          <NCRModeSwitch
            isNCRMode={disposalNcrMode}
            setIsNCRMode={setDisposalNcrMode}
          />
          <CardContent className="grid md:grid-cols-3 grid-cols-1 gap-4 p-0">
            <FormField
              control={control}
              name="cemeteryOrCrematory.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter cemetery or crematory name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Use LocationSelector for the cemetery/crematory address */}
            {/* <LocationSelectorNew
              
              provinceFieldName="cemeteryOrCrematory.address.province"
              municipalityFieldName="cemeteryOrCrematory.address.cityMunicipality"
              barangayFieldName="cemeteryOrCrematory.address.barangay"
              provinceLabel="Province"
              municipalityLabel="City/Municipality"
              barangayLabel="Barangay"
              provincePlaceholder="Select province..."
              municipalityPlaceholder="Select city/municipality..."
              barangayPlaceholder="Select barangay..."
              showBarangay={true}
              isNCRMode={false}
            /> */}

            <LocationSelectorNew
              countryFieldName="cemeteryOrCrematory.address.country"
              provinceFieldName="cemeteryOrCrematory.address.province"
              municipalityFieldName="cemeteryOrCrematory.address.cityMunicipality"
              barangayFieldName="cemeteryOrCrematory.address.barangay"
              internationalAddressFieldName="cemeteryOrCrematory.address.internationalAddress"
              countryLabel="Country"
              provinceLabel="Province"
              municipalityLabel="City/Municipality"
              barangayLabel="Barangay"
              internationalAddressLabel="Complete Address"
              isNCRMode={disposalNcrMode}
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
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DisposalInformationCard;
