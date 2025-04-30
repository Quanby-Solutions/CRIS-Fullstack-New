"use client";

import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { formatDateTime } from "@/utils/date";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent } from "@/components/ui/card";
import { createDeathAnnotation } from "@/hooks/form-annotations-actions";
import { DeathAnnotationFormFields } from "@/lib/constants/form-annotations-dynamic-fields";
import { PlaceStructure } from "@/lib/types/zod-form-annotations/form-annotation-shared-interfaces";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DeathAnnotationFormValues,
  DeathAnnotationFormSchema,
} from "@/lib/types/zod-form-annotations/death-annotation-form-schema";

import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import { Permission } from "@prisma/client";
import { notifyUsersWithPermission } from "@/hooks/users-action";

export interface DeathAnnotationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

export interface ExtendedDeathAnnotationFormProps
  extends DeathAnnotationFormProps {
  formData: BaseRegistryFormWithRelations;
  certifiedCopyId: string;
}

// Helper function to safely parse and format date values
const parseDate = (value: any): Date | string | undefined => {
  // If value is null or undefined, return undefined
  if (value === null || value === undefined) return undefined;

  // If value is an object with a date property, extract the date
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("dateOfDeath" in value) {
      value = value.dateOfDeath;
    } else if ("dateOfBirth" in value) {
      value = value.dateOfBirth;
    }
  }

  // If it's already a Date object, validate it first
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    // Check if it's a standard date format (YYYY-MM-DD or ISO)
    const isDateFormat = /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmedValue);

    if (isDateFormat) {
      try {
        const date = new Date(trimmedValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {}
    }

    // If not a valid date format, return the string as-is
    return trimmedValue;
  }

  // For other types, try to create a date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {}

  // Fallback to string conversion
  return String(value);
};

// Enhanced formatDateForInput function that safely handles various input types
const formatDateForInput = (date: any): string => {
  if (!date) return "";

  const parsed = parseDate(date);

  // If parsing returns undefined, return empty string
  if (!parsed) return "";

  // If parsing returns a Date object, format it
  if (parsed instanceof Date) {
    try {
      return parsed.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "";
    }
  }

  // If it's a string, return it as-is
  return parsed;
};

const DeathAnnotationForm: React.FC<ExtendedDeathAnnotationFormProps> = ({
  open,
  onOpenChange,
  onCancel,
  formData,
  certifiedCopyId,
}) => {
  const isCanceling = useRef(false);

  const defaultValues: DeathAnnotationFormValues = {
    amountPaid: 0,
    civilRegistrar: "PRISCILLA L. GALICIA",
    civilRegistrarPosition: "OIC - City Civil Registrar",
    registryNumber: "",
    pageNumber: "",
    bookNumber: "",
    dateOfRegistration: "",
    preparedByName: "",
    verifiedByName: "",
    nameOfDeceased: "",
    sex: undefined,
    age: 0,
    civilStatus: "",
    citizenship: "",
    dateOfDeath: "",
    placeOfDeath: "",
    causeOfDeath: "",
    issuedTo: "",
    purpose: "",
    preparedByPosition: "",
    verifiedByPosition: "",
    remarks: "",
    orNumber: "",
    datePaid: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DeathAnnotationFormValues>({
    resolver: zodResolver(DeathAnnotationFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (formData) {
      // Basic registration info
      setValue("pageNumber", formData.pageNumber);
      setValue("bookNumber", formData.bookNumber);
      setValue("registryNumber", formData.registryNumber);
      // Format dateOfRegistration from formData (if it exists)
      setValue(
        "dateOfRegistration",
        formData.dateOfRegistration
          ? formatDateForInput(formData.dateOfRegistration)
          : ""
      );

      // Death certificate specific data
      const deathForm = formData.deathCertificateForm;
      if (deathForm) {
        // If deceasedName is an object, join first/middle/last
        if (
          deathForm.deceasedName &&
          typeof deathForm.deceasedName === "object"
        ) {
          const { first, middle, last } = deathForm.deceasedName as {
            first?: string;
            middle?: string;
            last?: string;
          };
          const fullName = [first, middle, last].filter(Boolean).join(" ");
          setValue("nameOfDeceased", fullName);
        }
        setValue("sex", deathForm.sex || undefined);
        setValue("civilStatus", deathForm.civilStatus || "");
        setValue("citizenship", deathForm.citizenship || "");

        // Format dateOfDeath from formData - using our enhanced function that safely handles all formats
        setValue(
          "dateOfDeath",
          deathForm.dateOfDeath ? formatDateForInput(deathForm.dateOfDeath) : ""
        );

        // Calculate age if dateOfBirth and dateOfDeath are available and both are valid dates
        if (deathForm.dateOfBirth && deathForm.dateOfDeath) {
          try {
            const birthDate = parseDate(deathForm.dateOfBirth);
            const deathDate = parseDate(deathForm.dateOfDeath);

            // Only calculate age if both dates are valid Date objects
            if (birthDate instanceof Date && deathDate instanceof Date) {
              const age = Math.floor(
                (deathDate.getTime() - birthDate.getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
              );
              setValue("age", age);
            }
          } catch (error) {
            console.warn("Error calculating age:", error);
          }
        }

        // Format placeOfDeath if it's an object
        if (
          typeof deathForm.placeOfDeath === "object" &&
          deathForm.placeOfDeath
        ) {
          const place = deathForm.placeOfDeath as PlaceStructure;
          const placeOfDeath = [
            place.hospital,
            place.barangay,
            place.cityMunicipality,
            place.province,
          ]
            .filter(Boolean)
            .join(", ");
          setValue("placeOfDeath", placeOfDeath);
        }

        if (
          deathForm.causesOfDeath19b &&
          typeof deathForm.causesOfDeath19b === "object" &&
          deathForm.causesOfDeath19b !== null &&
          "immediate" in deathForm.causesOfDeath19b
        ) {
          setValue(
            "causeOfDeath",
            String(deathForm.causesOfDeath19b.immediate || "")
          );
        }
      }

      // Processed by and verified by info
      if (formData.preparedBy) {
        setValue("preparedByName", formData.preparedBy.name || "");
      }
      setValue("preparedByPosition", formData.receivedByPosition || "");
      if (formData.verifiedBy) {
        setValue("verifiedByName", formData.verifiedBy.name || "");
      }
      setValue("verifiedByPosition", formData.registeredByPosition || "");
    }
  }, [formData, setValue]);

  const onSubmit = async (data: DeathAnnotationFormValues) => {
    if (isCanceling.current) {
      isCanceling.current = false;
      return;
    }
    try {
      // Pass the certifiedCopyId (attachment) to your create hook
      const response = await createDeathAnnotation(data, certifiedCopyId);
      if (response.success) {
        toast.success("Death annotation created successfully");

        const documentRead = Permission.DOCUMENT_READ;
        const Title = "New Annotation for Death Certificate";
        const message = `New Annotation for Death Certificate with the details (Book: ${formData?.bookNumber}
                 Page: ${formData?.pageNumber}, Form Type: ${formData?.formType}) has been Created.`;
        notifyUsersWithPermission(documentRead, Title, message);

        onOpenChange(false);
        reset();
      } else {
        toast.error("Failed to create death annotation");
      }
    } catch (error) {
      console.error("Error creating death annotation:", error);
      toast.error("An error occurred while creating the death annotation");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    isCanceling.current = true;
    onCancel();
    reset();
  };

  // Split dynamic fields into two halves (if you're using a dynamic fields array)
  const midPoint = Math.ceil(DeathAnnotationFormFields.length / 2);
  const firstHalf = DeathAnnotationFormFields.slice(0, midPoint);
  const secondHalf = DeathAnnotationFormFields.slice(midPoint);

  // Helper function to determine if a string is a valid date format for input element
  const isDateFormatForInput = (value: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-6">
            Civil Registry Form 2A
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="container mx-auto p-4">
            <div className="bg-background text-foreground">
              <CardContent className="p-8 space-y-8">
                {/* Header Section */}
                <div className="relative border-b pb-4">
                  <div className="flex gap-2 items-center">
                    <h2 className="text-xl font-medium">
                      TO WHOM IT MAY CONCERN:
                    </h2>
                  </div>
                  <p className="absolute top-0 right-0 text-sm text-muted-foreground">
                    {formatDateTime(new Date())}
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    We certify that, among others, the following facts of death
                    appear in our Register of Death on
                  </p>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label>Page number</Label>
                      <Input {...register("pageNumber")} className="w-full" />
                      {errors.pageNumber && (
                        <span className="text-destructive text-sm">
                          {errors.pageNumber.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Book number</Label>
                      <Input {...register("bookNumber")} className="w-full" />
                      {errors.bookNumber && (
                        <span className="text-destructive text-sm">
                          {errors.bookNumber.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Fields Section */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {firstHalf.map((field, index) => {
                      // Special handling for date fields
                      const isDateField =
                        field.name === "dateOfRegistration" ||
                        field.name === "dateOfDeath";
                      const fieldValue =
                        field.name === "dateOfDeath"
                          ? formatDateForInput(
                              formData?.deathCertificateForm?.dateOfDeath
                            )
                          : "";
                      const showDateInput =
                        isDateField && isDateFormatForInput(fieldValue);

                      return (
                        <div key={index} className="space-y-2">
                          <Label className="font-medium">{field.label}</Label>
                          <Input
                            type={showDateInput ? "date" : "text"}
                            {...register(
                              field.name as keyof DeathAnnotationFormValues
                            )}
                            className="w-full"
                          />
                          {errors[field.name as keyof typeof errors] && (
                            <span className="text-destructive text-sm">
                              {
                                errors[field.name as keyof typeof errors]
                                  ?.message
                              }
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-6">
                    {secondHalf.map((field, index) => {
                      // Special handling for date fields
                      const isDateField =
                        field.name === "dateOfRegistration" ||
                        field.name === "dateOfDeath";
                      const fieldValue =
                        field.name === "dateOfDeath"
                          ? formatDateForInput(
                              formData?.deathCertificateForm?.dateOfDeath
                            )
                          : "";
                      const showDateInput =
                        isDateField && isDateFormatForInput(fieldValue);

                      return (
                        <div key={index} className="space-y-2">
                          <Label className="font-medium">{field.label}</Label>
                          <Input
                            type={showDateInput ? "date" : "text"}
                            {...register(
                              field.name as keyof DeathAnnotationFormValues
                            )}
                            className="w-full"
                          />
                          {errors[field.name as keyof typeof errors] && (
                            <span className="text-destructive text-sm">
                              {
                                errors[field.name as keyof typeof errors]
                                  ?.message
                              }
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Issued To / Purpose Section */}
                <div className="space-y-4 pt-6">
                  <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                    <p>This certification is issued to</p>
                    <div>
                      <Input {...register("issuedTo")} />
                      {errors.issuedTo && (
                        <span className="text-destructive text-sm">
                          {errors.issuedTo.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                    <p>upon his/her request for</p>
                    <div>
                      <Input {...register("purpose")} />
                      {errors.purpose && (
                        <span className="text-destructive text-sm">
                          {errors.purpose.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prepared/Verified Section */}
                <div className="grid grid-cols-3 gap-8 pt-8 border-t">
                  <div className="space-y-4">
                    <p className="font-medium">Prepared By</p>
                    <Input
                      className="text-center"
                      placeholder="Name and Signature"
                      {...register("preparedByName")}
                    />
                    {errors.preparedByName && (
                      <span className="text-destructive text-sm">
                        {errors.preparedByName.message}
                      </span>
                    )}
                    <Input
                      className="text-center"
                      placeholder="Position"
                      {...register("preparedByPosition")}
                    />
                    {errors.preparedByPosition && (
                      <span className="text-destructive text-sm">
                        {errors.preparedByPosition.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <p className="font-medium">Verified By</p>
                    <Input
                      className="text-center"
                      placeholder="Name and Signature"
                      {...register("verifiedByName")}
                    />
                    {errors.verifiedByName && (
                      <span className="text-destructive text-sm">
                        {errors.verifiedByName.message}
                      </span>
                    )}
                    <Input
                      className="text-center"
                      placeholder="Position"
                      {...register("verifiedByPosition")}
                    />
                    {errors.verifiedByPosition && (
                      <span className="text-destructive text-sm">
                        {errors.verifiedByPosition.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <p className="font-medium text-center">
                      PRISCILLA L. GALICIA
                    </p>
                    <p className="text-sm text-center text-muted-foreground">
                      OIC - City Civil Registrar
                    </p>
                  </div>
                </div>

                {/* Additional Payment Fields */}
                <div className="space-y-2 pt-4">
                  <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                    <Label className="font-medium">Amount Paid</Label>
                    <div>
                      <Input
                        type="text"
                        {...register("amountPaid")}
                        pattern="^\d*\.?\d*$"
                      />
                      {errors.amountPaid && (
                        <span className="text-destructive text-sm">
                          {errors.amountPaid.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                    <Label className="font-medium">O.R. Number</Label>
                    <div>
                      <Input {...register("orNumber")} />
                      {errors.orNumber && (
                        <span className="text-destructive text-sm">
                          {errors.orNumber.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                    <Label className="font-medium">Date Paid</Label>
                    <div>
                      <Input type="date" {...register("datePaid")} />
                      {errors.datePaid && (
                        <span className="text-destructive text-sm">
                          {errors.datePaid.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeathAnnotationForm;
