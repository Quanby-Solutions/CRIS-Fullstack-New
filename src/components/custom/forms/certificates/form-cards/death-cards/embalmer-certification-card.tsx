"use client";

import DatePickerString from "@/components/custom/datepickerfield/date-picker-string";
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
import { useFormContext } from "react-hook-form";


const EmbalmerCertificationCard: React.FC = () => {
  const { control } = useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification of Embalmer</CardTitle>
        <p className="text-sm text-muted-foreground">
          I HEREBY CERTIFY that I have embalmed the body in accordance with the
          Department of Health regulations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="embalmerCertification.nameOfDeceased"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of Deceased</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter name of deceased"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <h1 className="font-semibold text-base">Embalmer information</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={control}
            name="embalmerCertification.nameInPrint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name in Print</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter name in print"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="embalmerCertification.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter address"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="embalmerCertification.titleDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title/Designation</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Licensed Embalmer"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="embalmerCertification.licenseNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter license number"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="embalmerCertification.issuedOn"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePickerString
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Issued On"
                    placeholder="Select date issued"
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="embalmerCertification.issuedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issued At</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter place of issue"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="embalmerCertification.expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePickerString
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Expiry Date"
                    placeholder="Select expiry date"
                    ref={field.ref}
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

export default EmbalmerCertificationCard;
