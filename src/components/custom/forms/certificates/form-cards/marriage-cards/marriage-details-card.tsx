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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import React, { useState } from "react"; // ⬅ removed useEffect
import { useFormContext } from "react-hook-form";

import TimePicker from "@/components/custom/time/time-picker";
import PlaceOfMarriageCard from "./locations/place-of-marriage";
import { Input } from "@/components/ui/input";

const MarriageDetailsCard: React.FC = () => {
  const { control, setValue, watch } =
    useFormContext<MarriageCertificateFormValues>();
  const [useFullAddressInput, setUseFullAddressInput] = useState(false);

  // Watch for changes (kept for external usage if needed)
  const province = watch("placeOfMarriage.province");
  const cityMunicipality = watch("placeOfMarriage.cityMunicipality");
  const barangay = watch("placeOfMarriage.barangay");
  const fullAddress = watch("placeOfMarriage.address");

  // Clear the full address when switching to location selector mode
  const handleAddressInputModeChange = (newValue: boolean) => {
    setUseFullAddressInput(newValue);

    // If turning OFF the single address input, clear the address field
    if (!newValue) {
      setValue("placeOfMarriage.address", "");
    }
  };

  return (
    <Card className="border dark:border-border">
      <CardHeader>
        <CardTitle>Marriage Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <PlaceOfMarriageCard />
          <FormField
            control={control}
            name="placeOfMarriage.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue/Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter complete address of marriage"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Date of Marriage */}
          <FormField
            control={control}
            name="dateOfMarriage"
            render={({ field }) => (
              <DatePickerField
                field={{
                  value: field.value || "",
                  onChange: field.onChange,
                }}
                label="Date of Marriage"
                ref={field.ref}
                placeholder="Select date of marriage"
              />
            )}
          />
          {/* Time of Marriage */}
          <FormField
            control={control}
            name="timeOfMarriage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time of Marriage</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter time of marriage"
                    {...field}
                    value={field.value ?? ""}
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

export default MarriageDetailsCard;
