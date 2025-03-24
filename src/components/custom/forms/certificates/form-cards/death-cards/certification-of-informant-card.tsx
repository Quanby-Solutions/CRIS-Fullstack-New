"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import LocationSelector from "../shared-components/location-selector";
import SignatureUploader from "../shared-components/signature-uploader";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";

const CertificationInformantCard: React.FC = () => {
  const { control } = useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-sm font-semibold">Certification of Informant</h3>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Name */}
          <FormField
            control={control}
            name="informant.nameInPrint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    placeholder="Enter name"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Relationship to Deceased */}
          <FormField
            control={control}
            name="informant.relationshipToDeceased"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship to the Deceased</FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    placeholder="Enter relationship"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={control}
            name="informant.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    placeholder="Enter relationship"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Informant Date */}
          <FormField
            control={control}
            name="informant.date"
            render={({ field }) => (
              <FormItem>
                <DatePickerField
                  field={{
                    value: field.value ?? "",
                    onChange: field.onChange,
                  }}
                  label="Date"
                  placeholder="Select date"
                  ref={field.ref}
                />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationInformantCard;
