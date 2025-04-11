"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import TimePicker from "@/components/custom/time/time-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import React from "react";
import { useFormContext } from "react-hook-form";

const CertificationOfDeathCard: React.FC = () => {
  const { control, watch, setValue, getValues } =
    useFormContext<DeathCertificateFormValues>();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="uppercase">22. Certification of Death</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Has Attended Switch */}
        <FormField
          control={control}
          name="certificationOfDeath.hasAttended"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <FormLabel className="text-base">
                Have you attended the deceased?
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Death Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Attendant:</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="timeOfDeath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Death Occured At</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value)}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="certificationOfDeath.nameInPrint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name in Print</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter name in print"
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
              name="certificationOfDeath.titleOfPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title of Position</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter title of position"
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
              name="certificationOfDeath.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter address "
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
              name="certificationOfDeath.reviewedBy.date"
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Certification Date"
                    placeholder="Select certification date"
                    ref={field.ref}
                  />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>REVIEWED BY:</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="certificationOfDeath.reviewedBy.healthOfficerNameInPrint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Officer Name in Print</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter health officer name in print"
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
              name="certificationOfDeath.reviewedBy.date"
              render={({ field }) => (
                <FormItem>
                  <DatePickerField
                    field={{
                      value: field.value ?? "",
                      onChange: field.onChange,
                    }}
                    label="Certification Date"
                    placeholder="Select certification date"
                    ref={field.ref}
                  />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CertificationOfDeathCard;
