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
import { Switch } from "@/components/ui/switch";
import { DeathCertificateFormValues } from "@/lib/types/zod-form-certificate/death-certificate-form-schema";
import { format, isValid } from "date-fns";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import SignatureUploader from "../shared-components/signature-uploader";
import DatePickerString from "@/components/custom/datepickerfield/date-picker-string";

const AffidavitDelayedRegistrationCard: React.FC = () => {
  const { control, setValue, watch, getValues } =
    useFormContext<DeathCertificateFormValues>();

  // Local state toggle for displaying the affidavit section.

  const delayedRegistration = watch("delayedRegistration");
  const [isDelayed, setIsDelayed] = useState(
    delayedRegistration?.isDelayed ?? false
  );

  useEffect(() => {
    setValue("delayedRegistration.isDelayed", isDelayed);
  }, [isDelayed, setValue]);

  useEffect(() => {
    if (delayedRegistration?.isDelayed !== undefined) {
      setIsDelayed(delayedRegistration.isDelayed);
    }
  }, [delayedRegistration?.isDelayed]);

  // Watch attendance.wasAttended to conditionally show attendedBy.
  const wasAttended = watch("delayedRegistration.attendance.wasAttended");

  const affidavitDate = useWatch({
    control,
    name: "delayedRegistration.affidavitDate",
  });

  const affidavitPlace = useWatch({
    control,
    name: "delayedRegistration.affidavitDatePlace",
  });

  // Format the date to display day and month separately
  let dayOfMonth = "";
  let monthAndYear = "";

  if (affidavitDate) {
    let date: Date;

    // Handle both string and Date types
    if (affidavitDate instanceof Date) {
      date = affidavitDate;
    } else {
      // It's a string, try to parse it
      date = new Date(affidavitDate);
    }

    // Check if the date is valid before formatting
    if (isValid(date)) {
      dayOfMonth = format(date, "do"); // e.g. "1st", "2nd", "3rd", etc.
      monthAndYear = format(date, "MMMM yyyy"); // e.g. "January 2025"
    }
  }

  const displayPlace = affidavitPlace ? String(affidavitPlace) : "";

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Affidavit for Delayed Registration of Death</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out this section only if the registration of death is delayed.
          </p>
        </div>
        <div className="flex items-start space-x-3">
          <FormLabel className="mb-0">Delayed Registration?</FormLabel>
          <Switch checked={isDelayed} onCheckedChange={setIsDelayed} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isDelayed && (
          <>
            {/* Affiant Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Affiant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.affiant.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiant Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affiant name"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.affiant.civilStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Single/Married"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.affiant.residenceAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affiant's address"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.affiant.age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affiant's age"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <FormField
                control={control}
                name='delayedRegistration.affiant.signature'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiant Signature</FormLabel>
                    <FormControl>
                      <SignatureUploader
                        name='delayedRegistration.affiant.signature'
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            {/* Deceased Information (Affidavit) */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                Deceased Information (Affidavit)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.deceased.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. That (name of deceased)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter deceased's name"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.deceased.diedOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerString
                          field={{
                            value: field.value ?? "",
                            onChange: (date) =>
                              field.onChange(
                                date instanceof Date
                                  ? format(date, "MM/dd/yyyy")
                                  : ""
                              ),
                          }}
                          label="Died on"
                          placeholder="Select date"
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.deceased.placeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Died in</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter deceased's place of death"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.deceased.burialInfo.place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was burried/cremated in</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter location"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.deceased.burialInfo.date"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerString
                          field={{
                            value: field.value ?? "",
                            onChange: (date) =>
                              field.onChange(
                                date instanceof Date
                                  ? format(date, "MM/dd/yyyy")
                                  : ""
                              ),
                          }}
                          label="Was burial/cremated on"
                          placeholder="Select date"
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Attendance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                2. That the deceased at the time of his/her death:
              </h3>
              <FormField
                control={control}
                name="delayedRegistration.attendance.wasAttended"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormLabel>Was Attended?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              className={`grid  grid-cols-1 gap-4 
              ${wasAttended ? "md:grid-cols-3" : "md:grid-cols-2"}`}
            >
              {watch("delayedRegistration.attendance.wasAttended") && (
                <FormField
                  control={control}
                  name="delayedRegistration.attendance.attendedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attended By</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Name of physician/health officer"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* Cause of Death & Reason for Delay */}
              <FormField
                control={control}
                name="delayedRegistration.causeOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. Cause of Death (Affidavit)</FormLabel>
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
              <FormField
                control={control}
                name="delayedRegistration.reasonForDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Reason for Delay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter reason for delayed registration"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Affidavit Date / Place */}
            <div className="space-y-4 py-6">
              <p className="text-sm text-black/70 w-[60%]">
                <span className="text-black">5.</span> That I am executing this
                affidavit to attest to the truthfulness of the foregoing
                statements for all legal intents and purposes. In truth whereof,
                I have affixed my signature below this{" "}
                <span
                  className={`px-5 border-b border-muted-foreground ${
                    affidavitDate && dayOfMonth
                      ? "text-black"
                      : "text-muted-foreground"
                  }`}
                >
                  {dayOfMonth || "_____"}
                </span>{" "}
                day of{" "}
                <span
                  className={`px-5 border-b border-muted-foreground ${
                    affidavitDate && monthAndYear
                      ? "text-black"
                      : "text-muted-foreground"
                  }`}
                >
                  {monthAndYear || "__________"}
                </span>{" "}
                at{" "}
                <span
                  className={`px-5 border-b border-muted-foreground ${
                    affidavitPlace ? "text-black" : "text-muted-foreground"
                  }`}
                >
                  {displayPlace || "__________"}
                </span>
                Philippines
              </p>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.affidavitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerString
                          field={{
                            value: field.value ?? "",
                            onChange: (date) => field.onChange(date),
                          }}
                          label="Affidavit Date"
                          placeholder="Select date"
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.affidavitDatePlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affidavit Place</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter place"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CTC / ID Information */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">CTC / ID Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.ctcInfo.dayOf"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerString
                          field={{
                            value: field.value ?? "",
                            onChange: (date) => field.onChange(date),
                          }}
                          label="Day of"
                          placeholder="Select date"
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.ctcInfo.placeAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place At</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter place"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.ctcInfo.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTC/ID Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter CTC/ID number"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.ctcInfo.issuedOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerString
                          field={{
                            value: field.value ?? "",
                            onChange: (date) => field.onChange(date),
                          }}
                          label="Issued On"
                          placeholder="Select date"
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.ctcInfo.issuedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued At</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Place issued"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Administering Officer */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                Administering Officer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="delayedRegistration.adminOfficer.position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Position</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter officer position"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.adminOfficer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Name in print</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter officer name"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="delayedRegistration.adminOfficer.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Officer Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter officer address"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AffidavitDelayedRegistrationCard;
