"use client";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";
import DatePickerField from "@/components/custom/datepickerfield/date-picker-field";
import { useEffect } from "react";
import AffidavitOfSolemnizingAtPlaceSworn from "./locations/affidavit-solemnizing-place";
import AffidavitOfSolemnizingAtPlaceExecute from "./locations/affidavit-solemnizing-place-execute";

interface AffidavitOfSolemnizingOfficerProps {
  className?: string;
}

export const AffidavitOfSolemnizingOfficer: React.FC<
  AffidavitOfSolemnizingOfficerProps
> = ({ className }) => {
  const { control } = useFormContext<MarriageCertificateFormValues>();

  return (
    <Card className={cn("border dark:border-border", className)}>
      <CardHeader>
        <CardTitle>Affidavit of Solemnizing Officer</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officerName.first"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    I, (Solemnizing Officer Name) (first)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                      placeholder="Enter officer name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officerName.middle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    I, (Solemnizing Officer Name) (middle)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                      placeholder="Enter officer name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officerName.last"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    I, (Solemnizing Officer Name) (last)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                      placeholder="Enter officer name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.officeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    (Officer of)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                      placeholder="Enter office name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.solemnizingOfficerInformation.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    (With address at)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-10"
                      placeholder="Enter address at"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marriage Between 2 person name */}

            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfHusband.first" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Husband's (First)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's first name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfHusband.middle" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Husband's (Middle)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's middle name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfHusband.last" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Husband's (Last)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's last name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfWife.first" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Wife's (First)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's first name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfWife.middle" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Wife's (Middle)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's middle name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.a.nameOfWife.last" // ✅ Correct path
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Wife's (Last)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      className="h-10"
                      placeholder="Enter husband's last name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Checkboxes Section */}
          <div className="space-y-4">
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.b.a"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    a. That I have ascertained the qualifications of the
                    contracting parties and have found no legal impediment for
                    them to marry as require by the article 34 of the Family
                    Code;
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.b.b"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    <p>
                      b. That this marriage was performed in articulo mortis or
                      at the point of death;
                    </p>
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.b.c"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    c. That the contracting party/ies{" "}
                    <span className="px-5 border-b border-black"></span> and{" "}
                    <span className="px-5 border-b border-black"> </span>, being
                    at the point of death and physically unable to sign the
                    foregoing certificate of marriage by signature or mark, one
                    of the witnesses to the mariage; sign for him or her by
                    writing the dying party's name and bene witness' own
                    signature preceded by the preposition "By".
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.b.d"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    d. That the residence of either party is so located that
                    there is no means of transportation to enable concered
                    party/parties to appear personally before the civil
                    registrar;
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="affidavitOfSolemnizingOfficer.b.e"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    e. That the marriage was among Muslims or among members of
                    the Ethnic Cultural Communities and that the mariage was
                    solemnized in accordance with their customs and practices;
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
          {/* Solemnizing Officer Address */}
          <Card>
            <CardHeader>
              <CardTitle>
                Execution of affidavit and legal intents and purpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Issued on */}
                  <FormField
                    control={control}
                    name="affidavitOfSolemnizingOfficer.d.dayOf"
                    render={({ field }) => (
                      <DatePickerField
                        field={{
                          value: field.value || "",
                          onChange: field.onChange,
                        }}
                        label="Issued on (Day of)"
                      />
                    )}
                  />
                  {/* Location */}
                  <AffidavitOfSolemnizingAtPlaceExecute />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Redundant na su letter B. name of husband and wife so dae ko na ilaag digdi... */}

          {/*  */}
          {/* Subscribe and Sworn */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribe and Sworn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date sworn on */}
                  <FormField
                    control={control}
                    name="affidavitOfSolemnizingOfficer.dateSworn.dayOf"
                    render={({ field }) => (
                      <DatePickerField
                        field={{
                          value: field.value || "",
                          onChange: field.onChange,
                        }}
                        label="Issued on"
                      />
                    )}
                  />
                  {/* Location */}
                  <AffidavitOfSolemnizingAtPlaceSworn />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTC Information */}
          <Card>
            <CardHeader>
              <CardTitle>CTC Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTC Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter CTC/Valid ID no."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.dateIssued"
                  render={({ field }) => (
                    <FormItem>
                      <DatePickerField
                        field={{
                          value: field.value ?? null,
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
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.dateSworn.ctcInfo.placeIssued"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place Issued</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter place/office address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Signature of administrator */}
          <Card>
            <CardHeader>
              <CardTitle>Administering Officer information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.administeringOfficerInformation.adminName.first"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of the Administrator (first)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter admin name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.administeringOfficerInformation.adminName.middle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of the Administrator (middle)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter admin name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.administeringOfficerInformation.adminName.last"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of the Administrator (last)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter admin name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.administeringOfficerInformation.position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position/Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter place/office address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={control}
                  name="affidavitOfSolemnizingOfficer.administeringOfficerInformation.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address of administrator</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Enter place/office address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffidavitOfSolemnizingOfficer;
