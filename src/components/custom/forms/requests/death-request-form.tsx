"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import {
  useSubmitCertifiedCopyRequest,
  SubmitCertifiedCopyRequestParams,
} from "@/hooks/use-submit-certified";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import { DeathCertificateForm, Permission } from "@prisma/client";
import { NameObject } from "@/lib/types/json";
import { Checkbox } from "@/components/ui/checkbox";
import { AttachmentWithCertifiedCopies } from "../../civil-registry/components/attachment-table";
import { notifyUsersWithPermission } from "@/hooks/users-action";

// Helper function to format a NameObject into a full name string.
const formatName = (name: NameObject | undefined): string => {
  if (!name || !name.first || !name.last) return "";
  return `${name.first} ${name.middle || ""} ${name.last}`.trim();
};

// Updated helper to format the place of death.
// If the stored place is a string, it returns it directly; if it's an object, it concatenates available parts.
const formatPlaceOfDeath = (place: any): string => {
  if (!place) return "";
  if (typeof place === "string") return place;
  const {
    locationType,
    internationalAddress,
    hospitalInstitution,
    houseNo,
    st,
    barangay,
    cityMunicipality,
    province,
  } = place;
  return [
    locationType,
    internationalAddress,
    hospitalInstitution,
    houseNo,
    st,
    barangay,
    cityMunicipality,
    province,
  ]
    .filter((part) => !!part)
    .join(", ");
};

// Updated parseJsonDateDeath function with additional validation for Date objects
const parseJsonDateDeath = (value: any): Date | string | undefined => {
  // If value is an object with a nested date property, extract the date
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("dateOfDeath" in value) {
      value = value.dateOfDeath;
    } else if ("dateOfBirth" in value) {
      value = value.dateOfBirth;
    }
  }

  if (value === null || value === undefined) return undefined;

  // If it's already a Date object, validate it first
  if (value instanceof Date) {
    // Check if the date is valid before returning it
    return isNaN(value.getTime()) ? undefined : value;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Trim the string to remove any leading/trailing whitespace
    const trimmedValue = value.trim();

    // Check for ISO date/timestamp format with time
    const isIsoDateTime =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmedValue);

    // Check for standard date format YYYY-MM-DD
    const isStandardDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedValue);

    // Try to parse as a date only if it appears to be in a date-like format
    if (isIsoDateTime || isStandardDate) {
      try {
        const date = new Date(trimmedValue);
        // Check if it's a valid date
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {}
    }

    // If not a valid date format, return as string
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

// Updated formatDateForInput function with more robust error handling
const formatDateForInput = (dateValue: any): string => {
  // First, try to parse the date value
  const parsed = parseJsonDateDeath(dateValue);

  // If parsing returns undefined, return empty string
  if (!parsed) return "";

  // If parsing returns a Date object, convert to YYYY-MM-DD format
  if (parsed instanceof Date) {
    try {
      // Extra safety check to ensure valid date
      if (isNaN(parsed.getTime())) {
        console.warn("Invalid date detected:", dateValue);
        return "";
      }
      return parsed.toISOString().split("T")[0]; // Format as YYYY-MM-DD for date input
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "";
    }
  }

  // If it's a string that looks like a date format, try to convert
  if (typeof parsed === "string") {
    // Check if it's a date format
    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(parsed);

    // If it looks like a date format, try to parse it
    if (isDateFormat) {
      try {
        const date = new Date(parsed);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch (error) {
        console.warn("Error parsing date string:", error);
      }
    }

    // Return the string as-is if it's not a date format or couldn't be parsed
    return parsed;
  }

  // If all else fails, return empty string
  return "";
};

// Zod schema for validation – include copies.
const schema = z.object({
  deceasedName: z.string().min(1, "Full name of the deceased is required"),
  deathDate: z.string().min(1, "Date of death is required"),
  deathPlace: z.string().min(1, "Place of death is required"),
  requesterName: z.string().min(1, "Requester's full name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  address: z.string().min(1, "Address is required"),
  purpose: z.string().min(1, "Purpose is required"),
  copies: z.number().min(1, "At least one copy is required"),
  isCertified: z
    .boolean()
    .refine((val) => val === true, "You must certify the information"),
});

interface DeathCertificateFormCTCProps {
  attachment: AttachmentWithCertifiedCopies | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  onCancel?: () => void;
  onAttachmentUpdated?: () => void;
  formData?: BaseRegistryFormWithRelations & {
    deathCertificateForm?: DeathCertificateForm | null;
  };
}

const DeathCertificateFormCTC: React.FC<DeathCertificateFormCTCProps> = ({
  attachment,
  open,
  onOpenChange,
  onClose,
  onCancel,
  onAttachmentUpdated,
  formData,
}) => {
  // Extract default values from formData if available.
  const deathData = formData?.deathCertificateForm;
  const defaultDeceasedName = deathData?.deceasedName
    ? formatName(deathData.deceasedName as unknown as NameObject)
    : "";
  const defaultDeathDate = deathData?.dateOfDeath
    ? formatDateForInput(deathData.dateOfDeath)
    : "";
  const defaultDeathPlace = deathData?.placeOfDeath
    ? formatPlaceOfDeath(deathData.placeOfDeath)
    : "";

  // Local state for registration and certification.
  const [isRegisteredLate, setIsRegisteredLate] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Use our custom hook for submission.
  const { submitRequest, isLoading, error, successMessage } =
    useSubmitCertifiedCopyRequest();

  // Centralized form state split into required and optional fields.
  const [formState, setFormState] = useState({
    required: {
      requesterName: "",
      relationship: "",
      address: "",
      purpose: "",
      copies: "1",
    },
    optional: {
      orNo: "",
      feesPaid: "",
      lcrNo: "",
      bookNo: "",
      pageNo: "",
      searchedBy: "",
      contactNo: "",
      datePaid: "",
      whenRegistered: "",
      signature: "",
    },
  });

  const submittedRef = useRef(false);

  const resetForm = () => {
    setFormState({
      required: {
        requesterName: "",
        relationship: "",
        address: "",
        purpose: "",
        copies: "1",
      },
      optional: {
        orNo: "",
        feesPaid: "",
        lcrNo: "",
        bookNo: "",
        pageNo: "",
        searchedBy: "",
        contactNo: "",
        datePaid: "",
        whenRegistered: "",
        signature: "",
      },
    });
    setIsCertified(false);
    setIsRegisteredLate(false);
  };

  // When an input changes, update the corresponding required or optional field.
  // When an input changes, update the corresponding required or optional field.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id in formState.required) {
      setFormState((prev) => ({
        ...prev,
        required: {
          ...prev.required,
          [id]: value, // Remove the trim() to allow spaces
        },
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        optional: {
          ...prev.optional,
          [id]: value,
        },
      }));
    }
  };
  // Validate that all required fields in formState.required are filled and that the certification checkbox is checked.
  useEffect(() => {
    const requiredFilled = Object.values(formState.required).every(
      (val) => val !== ""
    );
    setIsFormValid(requiredFilled && isCertified);
  }, [formState.required, isCertified]);

  useEffect(() => {
    if (successMessage && !submittedRef.current) {
      toast.success(successMessage);
      resetForm();
      onAttachmentUpdated?.();
      submittedRef.current = true;
      setTimeout(() => {
        onClose?.();
      }, 500);
    }
  }, [successMessage, onClose, onAttachmentUpdated]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle form submission by merging read-only deceased data with the required/optional fields.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCertified) {
      toast.error("Please certify that the information is true");
      return;
    }
    const validationObj = {
      deceasedName: defaultDeceasedName,
      deathDate: defaultDeathDate,
      deathPlace: defaultDeathPlace,
      ...formState.required,
      ...formState.optional,
      copies: parseInt(formState.required.copies, 10),
      isCertified,
    };
    const result = schema.safeParse(validationObj);
    if (!result.success) {
      toast.error(
        `Please fill in all required fields: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
      return;
    }
    const submissionData: SubmitCertifiedCopyRequestParams = {
      address: formState.required.address,
      purpose: formState.required.purpose,
      relationship: formState.required.relationship,
      requesterName: formState.required.requesterName,
      isRegisteredLate,
      feesPaid: formState.optional.feesPaid || undefined,
      orNo: formState.optional.orNo || undefined,
      signature: formState.optional.signature || undefined,
      lcrNo: formState.optional.lcrNo || undefined,
      bookNo: formState.optional.bookNo || undefined,
      pageNo: formState.optional.pageNo || undefined,
      searchedBy: formState.optional.searchedBy || undefined,
      contactNo: formState.optional.contactNo || undefined,
      date: formState.optional.datePaid || undefined,
      whenRegistered: isRegisteredLate
        ? formState.optional.whenRegistered || undefined
        : undefined,
      attachmentId: attachment?.id ?? "",
      copies: parseInt(formState.required.copies, 10),
    };
    try {
      await submitRequest(submissionData);
      toast.success("Request submitted successfully");
      const documentRead = Permission.DOCUMENT_READ;
      const Title = `New CTC has been created for "${formData?.formType} Certificate"`;
      const message = `A CTC for  (Book: ${formData?.bookNumber}, Page: ${formData?.pageNumber}, Registry Number: ${formData?.registryNumber}, Form Type: ${formData?.formType}) has been created sucessfully.`;
      notifyUsersWithPermission(documentRead, Title, message);
      resetForm();
    } catch (err) {
      toast.error("Failed to submit request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Death Certificate Request Form</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold text-center mb-8">
              Death Certificate Request Form
            </h1>
            <form className="space-y-12" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Deceased's Information (read-only) */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    Deceased's Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deceasedName">
                        Full Name of the Deceased{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deceasedName"
                        placeholder="Enter full name"
                        value={defaultDeceasedName}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="deathDate">
                        Date of Death <span className="text-red-500">*</span>
                      </Label>
                      {typeof defaultDeathDate === "string" &&
                      /^\d{4}-\d{2}-\d{2}$/.test(defaultDeathDate) ? (
                        // Use date input if we have a valid YYYY-MM-DD format
                        <Input
                          id="deathDate"
                          type="date"
                          value={defaultDeathDate}
                          disabled
                        />
                      ) : (
                        // Use regular text input for other date formats
                        <Input
                          id="deathDate"
                          type="text"
                          value={
                            typeof defaultDeathDate === "string"
                              ? defaultDeathDate
                              : ""
                          }
                          disabled
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deathPlace">
                        Place of Death <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deathPlace"
                        placeholder="Enter place of death"
                        value={defaultDeathPlace}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Registered Late?</Label>
                      <RadioGroup
                        defaultValue="no"
                        onValueChange={(value) =>
                          setIsRegisteredLate(value === "yes")
                        }
                        className="flex space-x-4 mt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">Yes</Label>
                        </div>
                      </RadioGroup>
                      {isRegisteredLate && (
                        <div className="mt-2">
                          <Label htmlFor="whenRegistered">
                            When Registered?
                          </Label>
                          <Input
                            id="whenRegistered"
                            type="date"
                            value={formState.optional.whenRegistered}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Requester's Information */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    Requester's Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="requesterName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="requesterName"
                        placeholder="Enter full name"
                        value={formState.required.requesterName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">
                        Relationship to the Deceased{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="relationship"
                        placeholder="Enter relationship"
                        value={formState.required.relationship}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={formState.required.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="purpose">
                        Purpose (please specify){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="purpose"
                        placeholder="Enter purpose"
                        value={formState.required.purpose}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Administrative Details */}
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Administrative Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="copies">
                      No. of Copies <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="copies"
                      type="number"
                      min="1"
                      value={formState.required.copies}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orNo">OR No.</Label>
                    <Input
                      id="orNo"
                      placeholder="Original receipt no."
                      value={formState.optional.orNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feesPaid">Fees Paid</Label>
                    <Input
                      id="feesPaid"
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={formState.optional.feesPaid}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lcrNo">LCR No.</Label>
                    <Input
                      id="lcrNo"
                      placeholder="Enter LCR No."
                      value={formState.optional.lcrNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookNo">Book No.</Label>
                    <Input
                      id="bookNo"
                      placeholder="Enter Book No."
                      value={formState.optional.bookNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageNo">Page No.</Label>
                    <Input
                      id="pageNo"
                      placeholder="Enter Page No."
                      value={formState.optional.pageNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="searchedBy">Searched By</Label>
                    <Input
                      id="searchedBy"
                      placeholder="Searched by"
                      value={formState.optional.searchedBy}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactNo">Contact No.</Label>
                    <Input
                      id="contactNo"
                      type="tel"
                      placeholder="Contact number"
                      value={formState.optional.contactNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="datePaid">Date Paid</Label>
                    <Input
                      id="datePaid"
                      type="date"
                      value={formState.optional.datePaid}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </section>

              {/* Certification and Signature */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certification"
                    checked={isCertified}
                    onCheckedChange={(checked) =>
                      setIsCertified(checked as boolean)
                    }
                    required
                  />
                  <Label htmlFor="certification" className="text-sm">
                    I hereby certify that the above information is true.{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div>
                  <Label htmlFor="signature">Signature of the Requester</Label>
                  <Input
                    id="signature"
                    name="signature"
                    placeholder="Type full name as signature"
                    className="w-full sm:w-auto"
                    onChange={handleInputChange}
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeathCertificateFormCTC;
