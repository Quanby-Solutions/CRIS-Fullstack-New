"use client";

import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";

interface DynamicSelectInputProps {
  name: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  formItemClassName?: string;
  formLabelClassName?: string;
  otherOptionValue?: string;
  otherOptionLabel?: string;
}

const CivilStatus: React.FC<DynamicSelectInputProps> = ({
  name,
  label,
  placeholder,
  options,
  formItemClassName = "",
  formLabelClassName = "",
  otherOptionValue = "Other",
  otherOptionLabel = "Other (please specify)",
}) => {
  const { control, setValue, getValues } = useFormContext();
  const [isCustomValue, setIsCustomValue] = useState(false);

  // Check if the current value exists in the options
  useEffect(() => {
    const currentValue = getValues(name);
    if (
      currentValue &&
      !options.some((option) => option.value === currentValue) &&
      currentValue !== otherOptionValue
    ) {
      setIsCustomValue(true);
    }
  }, [getValues, name, options, otherOptionValue]);

  // Handle switching back to select dropdown
  const handleSwitchToSelect = () => {
    setIsCustomValue(false);
    setValue(name, ""); // Clear the value when switching back to select
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={formItemClassName}>
          <FormLabel className={formLabelClassName}>{label}</FormLabel>

          {!isCustomValue ? (
            // Dropdown Select
            <Select
              onValueChange={(value) => {
                if (value === otherOptionValue) {
                  setIsCustomValue(true);
                  field.onChange("");
                } else {
                  field.onChange(value);
                }
              }}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger ref={field.ref} className="h-10">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value={otherOptionValue}>
                  {otherOptionLabel}
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            // Custom Input with close button
            <div className="flex space-x-2">
              <FormControl className="flex-1">
                <Input
                  placeholder="Enter custom value"
                  {...field}
                  className="h-10"
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwitchToSelect}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <FormMessage>{fieldState?.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

export default CivilStatus;
