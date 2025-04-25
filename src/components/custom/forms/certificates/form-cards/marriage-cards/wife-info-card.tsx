"use client";

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
import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { useFormContext } from "react-hook-form";
import { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import CivilStatus from "../shared-components/civil-status";
import WifePlaceOfBirth from "./locations/wife-place-birth";
import WifeResidenceCard from "./locations/wife-residence-place";

const WifeInfoCard: React.FC = () => {
  const { control } = useFormContext<MarriageCertificateFormValues>();

  return (
    <Card className="border dark:border-border">
      <CardHeader>
        <CardTitle>Wife&apos;s Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* First Name */}
          <FormField
            control={control}
            name="wifeName.first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter first name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Middle Name */}
          <FormField
            control={control}
            name="wifeName.middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter middle name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Last Name */}
          <FormField
            control={control}
            name="wifeName.last"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter last name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Sex */}
          <FormField
            control={control}
            name="wifeSex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "Female"}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Date of Birth */}
          <FormField
            control={control}
            name="wifeBirth"
            render={({ field }) => (
              <DatePickerField
                field={{
                  onChange: field.onChange,
                  value: field.value || "",
                }}
                label="Date of Birth"
              />
            )}
          />
          {/* Age - Manual input now, not auto-filled */}
          <FormField
            control={control}
            name="wifeAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    className="h-10"
                    type="number"
                    placeholder="Enter age"
                    onChange={(e) => {
                      // Convert string value to number before setting
                      const value =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      field.onChange(value);
                    }}
                    // Display empty string instead of 0
                    value={
                      field.value === 0 ||
                      field.value === undefined ||
                      field.value === null
                        ? ""
                        : field.value
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Citizenship */}
          <FormField
            control={control}
            name="wifeCitizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citizenship</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter citizenship"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Religion */}
          <FormField
            control={control}
            name="wifeReligion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion/Religious Sect</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="h-10"
                    placeholder="Enter religion"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Civil Status */}
          <CivilStatus
            name="wifeCivilStatus"
            label="Civil Status"
            placeholder="Select civil status"
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Widow", label: "Widow" },
              { value: "Widower", label: "Widower" },
              { value: "Annulled", label: "Annulled" },
              { value: "Divorced", label: "Divorced" },
            ]}
            otherOptionValue="Other"
            otherOptionLabel="Other (please specify)"
          />
        </div>
        <div className="col-span-3 py-4 flex flex-col gap-4">
          <CardTitle>Place Of Birth</CardTitle>

          {/* Place of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <WifePlaceOfBirth />
          </div>
        </div>

        <div className="col-span-3 py-4 flex flex-col gap-4">
          <CardTitle>Residence</CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <WifeResidenceCard />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WifeInfoCard;
