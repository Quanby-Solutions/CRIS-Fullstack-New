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
import { FieldValues, Path, useFormContext } from "react-hook-form";

export interface SimplePreparedByCardProps<
  T extends FieldValues = FieldValues
> {
  fieldPrefix?: string;
  cardTitle?: string;
  hideDate?: boolean;
  showNameInPrint?: boolean;
  showTitleOrPosition?: boolean;
}

function DynamicPreparedByCard<T extends FieldValues = FieldValues>({
  fieldPrefix = "preparedBy",
  cardTitle = "Prepared By",
  hideDate = false,
  showNameInPrint = true,
  showTitleOrPosition = true,
}: SimplePreparedByCardProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showNameInPrint && (
            <FormField
              control={control}
              name={`${fieldPrefix}.nameInPrint` as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name in Print</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!hideDate && (
            <FormField
              control={control}
              name={`${fieldPrefix}.date` as Path<T>}
              render={({ field }) => (
                <DatePickerField
                  field={{
                    value: field.value || null,
                    onChange: field.onChange,
                  }}
                  label="Date"
                  placeholder="Select date"
                />
              )}
            />
          )}

          {showTitleOrPosition && (
            <FormField
              control={control}
              name={`${fieldPrefix}.titleOrPosition` as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title or Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter title or position"
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DynamicPreparedByCard;
