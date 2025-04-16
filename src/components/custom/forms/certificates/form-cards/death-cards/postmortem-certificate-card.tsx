"use client";

import DatePickerString from "@/components/custom/datepickerfield/date-picker-string";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const PostmortemCertificateCard: React.FC = () => {
  const { control, setValue, clearErrors } =
    useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Postmortem Certificate of Death
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          I HEREBY CERTIFY that I have performed an autopsy upon the body of the
          deceased and that the cause of death was:
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {/* Cause of Death */}
        <FormField
          control={control}
          name="postmortemCertificate.causeOfDeath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of Death</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter cause of death"
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name in Print */}
        <FormField
          control={control}
          name="postmortemCertificate.nameInPrint"
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

        {/* Date */}
        <FormField
          control={control}
          name="postmortemCertificate.date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePickerString
                  field={{
                    value: field.value ?? "",
                    onChange: field.onChange,
                  }}
                  label="Postmortem Date"
                  placeholder="Select date"
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title/Designation */}
        <FormField
          control={control}
          name="postmortemCertificate.titleDesignation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title/Designation</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Pathologist, Medical Examiner"
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
          name="postmortemCertificate.address"
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
      </CardContent>
    </Card>
  );
};

export default PostmortemCertificateCard;
