"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { useFormContext } from "react-hook-form";

const AttendantInformationCard: React.FC = () => {
  const { control, watch } = useFormContext<DeathCertificateFormValues>();
  const attendant = watch("medicalCertificate.attendant");

  // Map the enum value to a select option value.
  let currentValue: string = "";
  if (attendant?.type) {
    switch (attendant.type) {
      case "Private physician":
        currentValue = "Private physician";
        break;
      case "Public health officer":
        currentValue = "Public health officer";
        break;
      case "Hospital authority":
        currentValue = "Hospital authority";
        break;
      case "None":
        currentValue = "None";
        break;
      case "Others":
        currentValue = "Others";
        break;
      default:
        currentValue = ""; // Default to empty if no value is found
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendant Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="gap-6 grid grid-cols-3">
          <FormField
            control={control}
            name="medicalCertificate.attendant.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>21a. (Attendant Type)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger ref={field.ref} className="h-10">
                      <SelectValue placeholder="Select attendant type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Private physician">
                      Private physician
                    </SelectItem>
                    <SelectItem value="Public health officer">
                      Public health officer
                    </SelectItem>
                    <SelectItem value="Hospital authority">
                      Hospital authority
                    </SelectItem>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Others Specify field - only show when "Others" is selected */}
          {attendant?.type === "Others" && (
            <FormField
              control={control}
              name="medicalCertificate.attendant.othersSpecify"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specify Other</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Specify other attendant type"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Duration Section - shown when attendant type is not "None" */}
          {attendant?.type !== "None" && (
            <>
              <FormField
                control={control}
                name="medicalCertificate.attendant.duration.from"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerString
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="21b. If attended, (FROM) (mm/dd/yy) "
                      placeholder="Select start date"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="medicalCertificate.attendant.duration.to"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerString
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="If attended, (TO) (mm/dd/yy)"
                      placeholder="Select end date"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendantInformationCard;
