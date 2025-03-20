"use client";

import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import TimePicker from "@/components/custom/time/time-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { differenceInDays } from "date-fns";
import { useMemo, useState, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import NCRModeSwitch from "../shared-components/ncr-mode-switch";
import CivilStatus from "../shared-components/civil-status";
import LocationSelectorNew from "../shared-components/location-selector-new";

const DeceasedInformationCard: React.FC = () => {
  const { control, setValue, getValues } =
    useFormContext<DeathCertificateFormValues>();
  const [deceasedNCRMode, setDeceasedNCRMode] = useState(false);
  const initialRender = useRef(true);

  useEffect(() => {
    // Detect NCR mode from fetched data on component mount
    const province = getValues("placeOfDeath.province");
    if (province === "Metro Manila" || province === "NCR") {
      setDeceasedNCRMode(true);
    }
  }, [getValues]);

  useEffect(() => {
    if (deceasedNCRMode === true) {
      setValue("placeOfDeath.province", "Metro Manila");
    }
  });

  // Watch fields for overall business logic
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
  const dateOfDeath = useWatch({ control, name: "dateOfDeath" });
  const sex = useWatch({ control, name: "sex" });
  const ageAtDeath = useWatch({ control, name: "ageAtDeath" });
  const typeOfBirth = useWatch({
    control,
    name: "birthInformation.typeOfBirth",
  });

  // Determine whether to show birth information
  const shouldShowBirthInfo = useMemo(() => {
    if (!dateOfBirth || !dateOfDeath) return false;
    const daysBetween = differenceInDays(dateOfDeath, dateOfBirth);
    const isInfantDeath = daysBetween <= 7;
    const isMaternal =
      sex === "Female" &&
      Number(ageAtDeath.years) > 10 &&
      Number(ageAtDeath.years) < 50;
    return isInfantDeath || isMaternal;
  }, [dateOfBirth, dateOfDeath, sex, ageAtDeath]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Deceased Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Section */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Name Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="name.first"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter first name"
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
                name="name.middle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter middle name"
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
                name="name.last"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter last name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Identity Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Identity Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          ref={field.ref}
                          className="h-10 px-3 text-base md:text-sm"
                        >
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CivilStatus
                name="civilStatus"
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
          </CardContent>
        </Card>

        {/* Dates & Time Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Important Dates and Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date of Death */}
              <FormField
                control={control}
                name="dateOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerField
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="Date of Death"
                      placeholder="Select date of death"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />
              {/* Date of Birth */}
              <FormField
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <DatePickerField
                      field={{
                        value: field.value ?? "",
                        onChange: field.onChange,
                      }}
                      label="Date of Birth"
                      placeholder="Select date of birth"
                      ref={field.ref}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Time of Death */}
            <FormField
              control={control}
              name="timeOfDeath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Death</FormLabel>
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
          </CardContent>
        </Card>

        {/* Age at Death Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Age at Time of Death
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={control}
                name="ageAtDeath.years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Years"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Months</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Months"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Days"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageAtDeath.hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="h-10 pr-8"
                        placeholder="Hours"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Place of Death
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Hospital/Institution */}
            <FormField
              control={control}
              name="placeOfDeath.hospitalInstitution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital / Institution</FormLabel>
                  <FormControl>
                    <Input
                      className="h-10"
                      placeholder="Enter the name of the hospital or institution"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* House No. and Street */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={control}
                name="placeOfDeath.houseNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House No.</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter house number"
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
                name="placeOfDeath.st"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="Enter street"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Selector for Province, City/Municipality, and Barangay */}
            <div className="mt-4">
              <NCRModeSwitch
                isNCRMode={deceasedNCRMode}
                setIsNCRMode={setDeceasedNCRMode}
              />
              {/* <LocationSelector
                provinceFieldName="placeOfDeath.province"
                municipalityFieldName="placeOfDeath.cityMunicipality"
                barangayFieldName="placeOfDeath.barangay"
                provinceLabel="Province"
                municipalityLabel="City/Municipality"
                barangayLabel="Barangay"
                provincePlaceholder="Select province"
                municipalityPlaceholder="Select city/municipality"
                barangayPlaceholder="Select barangay"
                isNCRMode={deceasedNCRMode}
                showBarangay={true}
              /> */}

              <LocationSelectorNew
                countryFieldName="certificationOfDeath.address.country"
                provinceFieldName="certificationOfDeath.address.province"
                municipalityFieldName="certificationOfDeath.address.cityMunicipality"
                barangayFieldName="certificationOfDeath.address.barangay"
                internationalAddressFieldName="certificationOfDeath.address.internationalAddress"
                countryLabel="Country"
                provinceLabel="Province"
                municipalityLabel="City/Municipality"
                barangayLabel="Barangay"
                internationalAddressLabel="Complete Address"
                isNCRMode={deceasedNCRMode}
                showBarangay={true}
                countryPlaceholder="Select country"
                provincePlaceholder="Select province"
                municipalityPlaceholder="Select city/municipality"
                barangayPlaceholder="Select barangay"
                internationalAddressPlaceholder="Enter complete address including street, city, province/state, and postal code"
                defaultCountry="Philippines"
                onCountryChange={(country) => {
                  // Optional: Add any additional logic you need when country changes
                  console.log("Country changed to:", country);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Civil Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="civilStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civil Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger
                        ref={field.ref}
                        className="h-10 px-3 text-base md:text-sm"
                      >
                        <SelectValue placeholder="Select civil status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widow">Widow</SelectItem>
                      <SelectItem value="Widower">Widower</SelectItem>
                      <SelectItem value="Annulled">Annulled</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Birth Information Section - Conditionally Rendered */}
        {shouldShowBirthInfo && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Birth Information
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Required for infant deaths (0-7 days) and maternal cases
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* For female cases, show Age of Mother */}
                {sex === "Female" && (
                  <FormField
                    control={control}
                    name="birthInformation.ageOfMother"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age of Mother</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={10}
                            max={65}
                            className="h-10"
                            placeholder="Enter mother's age"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Method of Delivery */}
                <FormField
                  control={control}
                  name="birthInformation.methodOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method of Delivery</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger ref={field.ref} className="h-10">
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Normal spontaneous vertex">
                            Normal spontaneous vertex
                          </SelectItem>
                          <SelectItem value="Caesarean section">
                            Caesarean section
                          </SelectItem>
                          <SelectItem value="Forceps">Forceps</SelectItem>
                          <SelectItem value="Vacuum extraction">
                            Vacuum extraction
                          </SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Length of Pregnancy */}
                  <FormField
                    control={control}
                    name="birthInformation.lengthOfPregnancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length of Pregnancy (weeks)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={20}
                            max={45}
                            className="h-10"
                            placeholder="Enter weeks"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === "" ? "" : Number(val));
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Normal range: 37-42 weeks
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type of Birth */}
                  <FormField
                    control={control}
                    name="birthInformation.typeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Birth</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset birth order if type is Single
                            if (value === "Single") {
                              setValue(
                                "birthInformation.birthOrder",
                                undefined
                              );
                            }
                          }}
                          value={field.value || "Single"}
                        >
                          <FormControl>
                            <SelectTrigger ref={field.ref} className="h-10">
                              <SelectValue placeholder="Select type of birth" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Twin">Twin</SelectItem>
                            <SelectItem value="Triplet">Triplet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Only show Birth Order for multiple births */}
                {typeOfBirth !== "Single" && (
                  <FormField
                    control={control}
                    name="birthInformation.birthOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Order</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger ref={field.ref} className="h-10">
                              <SelectValue placeholder="Select birth order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="First">First</SelectItem>
                            <SelectItem value="Second">Second</SelectItem>
                            <SelectItem value="Third">Third</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default DeceasedInformationCard;
