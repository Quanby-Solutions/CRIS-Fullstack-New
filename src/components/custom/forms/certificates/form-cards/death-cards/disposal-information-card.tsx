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
import { Button } from "@/components/ui/button"; // Added Button import
import { X } from "lucide-react"; // Added X icon import
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
import CemeteryOrCrematoryCards from "./locations/cemetery-crematory-place";

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
          {/* Modified corpse disposal field with "Other" option */}
          <FormField
            control={control}
            name="corpseDisposal"
            render={({ field, fieldState }) => {
              // State to track if custom input is active
              const [isCustomValue, setIsCustomValue] = useState(false);
              // State to store custom input value
              const [customInputValue, setCustomInputValue] = useState("");

              // Watch the field value
              useEffect(() => {
                const value = field.value;
                if (
                  value &&
                  !["Embalming", "Cremation", "Burial", "Other"].includes(value)
                ) {
                  setIsCustomValue(true);
                  setCustomInputValue(value);
                }
              }, [field.value]);

              // Handle switching back to select dropdown
              const handleSwitchToSelect = () => {
                setIsCustomValue(false);
                setCustomInputValue("");
                field.onChange("");
              };

              // Handle custom input change
              const handleCustomInputChange = (e: {
                target: { value: any };
              }) => {
                const value = e.target.value;
                setCustomInputValue(value);
                field.onChange(value);
              };

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>23. Corpse Disposal Method</FormLabel>

                  {!isCustomValue ? (
                    // Dropdown Select
                    <Select
                      onValueChange={(value) => {
                        if (value === "Other") {
                          setIsCustomValue(true);
                        } else {
                          field.onChange(value);
                        }
                      }}
                      value={field.value || ""}
                      defaultValue={field.value || "Embalming"}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref} className="h-8.5">
                          <SelectValue placeholder="Select disposal method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Embalming">Embalming</SelectItem>
                        <SelectItem value="Cremation">Cremation</SelectItem>
                        <SelectItem value="Burial">Burial</SelectItem>
                        <SelectItem value="Other">
                          Other (please specify)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    // Custom Input with close button
                    <div className="flex space-x-2">
                      <FormControl className="flex-1">
                        <Input
                          placeholder="Enter custom disposal method"
                          value={customInputValue}
                          onChange={handleCustomInputChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-8.5"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSwitchToSelect}
                        className="h-8.5 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              );
            }}
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

            <CemeteryOrCrematoryCards />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DisposalInformationCard;
