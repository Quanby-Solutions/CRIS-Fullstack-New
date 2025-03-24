"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { useFormContext } from "react-hook-form";

const MaternalConditionCard: React.FC = () => {
  const { control, watch } = useFormContext<DeathCertificateFormValues>();

  // Helper function to convert the maternal condition object value into a string for display.
  const getMaternalConditionValue = (value: any): string => {
    if (!value) return "";
    if (value.pregnantNotInLabor) return "not_in_labour";
    if (value.pregnantInLabour) return "in_labour";
    if (value.lessThan42Days) return "less_than_42_days";
    if (value.daysTo1Year) return "42_days_to_1_year";
    if (value.noneOfTheAbove) return "none";
    return "";
  };

  const currentValue = getMaternalConditionValue(
    watch("medicalCertificate.maternalCondition")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>19c. Maternal Condition</CardTitle>
        <p className="text-sm text-muted-foreground">
          If the deceased is female aged 15-49 years old
        </p>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="medicalCertificate.maternalCondition"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(val: string) =>
                  field.onChange({
                    pregnantNotInLabor: val === "not_in_labour",
                    pregnantInLabour: val === "in_labour",
                    lessThan42Days: val === "less_than_42_days",
                    daysTo1Year: val === "42_days_to_1_year",
                    noneOfTheAbove: val === "none",
                  })
                }
                // Use the controlled value with a fallback
                value={currentValue || ""}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} className="h-10">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not_in_labour">
                    a. pregnant, not in labour
                  </SelectItem>
                  <SelectItem value="in_labour">
                    b. pregnant, in labour
                  </SelectItem>
                  <SelectItem value="less_than_42_days">
                    c. less than 42 days after delivery
                  </SelectItem>
                  <SelectItem value="42_days_to_1_year">
                    d. 42 days to 1 year after delivery
                  </SelectItem>
                  <SelectItem value="none">e. None of the above</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default MaternalConditionCard;
