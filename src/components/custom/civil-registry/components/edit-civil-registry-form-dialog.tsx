"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import { useBirthCertificateForm } from "@/hooks/form-certificates-hooks/useBirthCertificateForm";
import type { BirthCertificateFormValues } from "@/lib/types/zod-form-certificate/birth-certificate-form-schema";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { mapToMarriageCertificateValues } from "@/lib/utils/map-to-marriage-certificate";
import { EditBirthCivilRegistryFormInline } from "./edit-form-provider/BirthFormProvider";

import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import MarriageCertificateForm from "../../forms/certificates/marriage-certificate-form";
import { MarriageCertificateFormValues } from "@/lib/types/zod-form-certificate/marriage-certificate-form-schema";

interface EmptyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  editType?: string;
}

function EmptyDialog({
  open,
  onOpenChange,
  onCancel,
  editType,
}: EmptyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>Empty Dialog</DialogTitle>
        </DialogHeader>
        <div>This dialog is currently empty.</div>
        <DialogFooter>
          <Button onClick={onCancel}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditCivilRegistryFormDialogProps {
  form: BaseRegistryFormWithRelations;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSaveAction: (updatedForm: BaseRegistryFormWithRelations) => Promise<void>;
  editType: "BIRTH" | "DEATH" | "MARRIAGE";
}

interface ChildName {
  first: string;
  middle: string;
  last: string;
}

interface motherName {
  first: string;
  middle: string;
  last: string;
}

interface FatherName {
  first: string;
  middle: string;
  last: string;
}

interface PlaceOfBirth {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
  hospital: string;
}

interface MotherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface FatherResidence {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface MarriagePlace {
  houseNo: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  country: string;
}

interface ParentMarriage {
  date: Date;
  place: MarriagePlace;
}

export function EditCivilRegistryFormDialog({
  form,
  open,
  onOpenChangeAction,
  onSaveAction,
  editType,
}: EditCivilRegistryFormDialogProps) {
  const { t } = useTranslation();
  const openRef = useRef(open);

  // This prevents the dialog from closing when switching tabs
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Add a visibility change event listener to prevent dialog from closing when tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the dialog was open before losing focus, ensure it stays open
      if (openRef.current && !document.hidden) {
        // Small delay to ensure React has processed all events
        setTimeout(() => {
          if (openRef.current) {
            onOpenChangeAction(true);
          }
        }, 0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle window focus/blur events as well for better coverage
    const handleWindowFocus = () => {
      if (openRef.current) {
        setTimeout(() => {
          onOpenChangeAction(true);
        }, 0);
      }
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [onOpenChangeAction]);

  // Custom handler for dialog open state changes
  const handleOpenChange = (newOpenState: boolean) => {
    // If attempting to close by clicking outside or pressing escape,
    // ignore it if it wasn't an explicit user action within the dialog
    if (!newOpenState && openRef.current) {
      // Check if this was triggered by tab switching or an actual user action
      if (document.visibilityState === "visible") {
        // This was likely a user action (clicking outside, pressing ESC)
        onOpenChangeAction(newOpenState);
      } else {
        // This was likely due to tab switching, prevent closing
        setTimeout(() => onOpenChangeAction(true), 0);
      }
    } else {
      // Normal open/close operation
      onOpenChangeAction(newOpenState);
    }
  };

  // Helper function to safely parse dates
  const parseDateSafely = (dateValue: Date | null): Date => {
    if (!dateValue) return new Date();
    return dateValue;
  };

  // Map the form data to the certificate values with proper type guarding.
  const mapToBirthCertificateValues = (
    form: BaseRegistryFormWithRelations
  ): Partial<BirthCertificateFormValues> => {
    // Child name
    const rawChildName = form.birthCertificateForm?.childName;
    let childName: ChildName = { first: "", middle: "", last: "" };
    if (
      rawChildName &&
      typeof rawChildName === "object" &&
      !Array.isArray(rawChildName) &&
      "first" in rawChildName &&
      "middle" in rawChildName &&
      "last" in rawChildName
    ) {
      childName = rawChildName as unknown as ChildName;
    }

    // Mother name
    const rawMotherName = form.birthCertificateForm?.motherMaidenName;
    let motherName: motherName = { first: "", middle: "", last: "" };
    if (
      rawMotherName &&
      typeof rawMotherName === "object" &&
      !Array.isArray(rawMotherName) &&
      "first" in rawMotherName &&
      "middle" in rawMotherName &&
      "last" in rawMotherName
    ) {
      motherName = rawMotherName as unknown as motherName;
    }

    // Father name
    const rawFatherName = form.birthCertificateForm?.fatherName;
    let fatherName: FatherName = { first: "", middle: "", last: "" };
    if (
      rawFatherName &&
      typeof rawFatherName === "object" &&
      !Array.isArray(rawFatherName) &&
      "first" in rawFatherName &&
      "middle" in rawFatherName &&
      "last" in rawFatherName
    ) {
      fatherName = rawFatherName as unknown as FatherName;
    }

    // Place of Birth
    const rawPlaceOfBirth = form.birthCertificateForm?.placeOfBirth;
    let placeOfBirth: PlaceOfBirth = {
      houseNo: "",
      street: "",
      barangay: "",
      cityMunicipality: "",
      province: "",
      country: "",
      hospital: "",
    };
    if (
      rawPlaceOfBirth &&
      typeof rawPlaceOfBirth === "object" &&
      !Array.isArray(rawPlaceOfBirth) &&
      "houseNo" in rawPlaceOfBirth &&
      "street" in rawPlaceOfBirth &&
      "barangay" in rawPlaceOfBirth &&
      "cityMunicipality" in rawPlaceOfBirth &&
      "province" in rawPlaceOfBirth &&
      "country" in rawPlaceOfBirth &&
      "hospital" in rawPlaceOfBirth
    ) {
      placeOfBirth = rawPlaceOfBirth as unknown as PlaceOfBirth;
    }

    // Sex
    const rawSex = form.birthCertificateForm?.sex;
    const sex: "Male" | "Female" =
      rawSex === "Male" || rawSex === "Female" ? rawSex : "Male";

    // Date of birth
    const rawDateOfBirth = form.birthCertificateForm?.dateOfBirth;
    const dateOfBirth: Date = rawDateOfBirth
      ? new Date(rawDateOfBirth)
      : new Date();

    // Type of birth
    const rawTypeOfBirth = form.birthCertificateForm?.typeOfBirth;
    const typeOfBirth: "Single" | "Twin" | "Triplet" | "Others" =
      rawTypeOfBirth === "Single" ||
      rawTypeOfBirth === "Twin" ||
      rawTypeOfBirth === "Triplet" ||
      rawTypeOfBirth === "Others"
        ? rawTypeOfBirth
        : "Single";

    // Weight at birth
    const rawWeightAtBirth = form.birthCertificateForm?.weightAtBirth;
    const weightAtBirth: string =
      rawWeightAtBirth && !isNaN(Number(rawWeightAtBirth))
        ? String(parseFloat(String(rawWeightAtBirth)))
        : "0";

    // Mother residence
    const rawMotherResidence = form.birthCertificateForm?.motherResidence;
    let motherResidence: MotherResidence = {
      houseNo: "",
      street: "",
      barangay: "",
      cityMunicipality: "",
      province: "",
      country: "",
    };
    if (
      rawMotherResidence &&
      typeof rawMotherResidence === "object" &&
      !Array.isArray(rawMotherResidence) &&
      "houseNo" in rawMotherResidence &&
      "street" in rawMotherResidence &&
      "barangay" in rawMotherResidence &&
      "cityMunicipality" in rawMotherResidence &&
      "province" in rawMotherResidence &&
      "country" in rawMotherResidence
    ) {
      motherResidence = rawMotherResidence as unknown as MotherResidence;
    }

    // Father residence
    const rawFatherResidence = form.birthCertificateForm?.fatherResidence;
    let fatherResidence: FatherResidence = {
      houseNo: "",
      street: "",
      barangay: "",
      cityMunicipality: "",
      province: "",
      country: "",
    };
    if (
      rawFatherResidence &&
      typeof rawFatherResidence === "object" &&
      !Array.isArray(rawFatherResidence) &&
      "houseNo" in rawFatherResidence &&
      "street" in rawFatherResidence &&
      "barangay" in rawFatherResidence &&
      "cityMunicipality" in rawFatherResidence &&
      "province" in rawFatherResidence &&
      "country" in rawFatherResidence
    ) {
      fatherResidence = rawFatherResidence as unknown as FatherResidence;
    }

    // Override mother and father residence with placeOfBirth values if a complete address is provided.
    if (
      placeOfBirth.houseNo &&
      placeOfBirth.street &&
      placeOfBirth.barangay &&
      placeOfBirth.cityMunicipality &&
      placeOfBirth.province &&
      placeOfBirth.country
    ) {
      const newResidence = {
        houseNo: placeOfBirth.houseNo,
        street: placeOfBirth.street,
        barangay: placeOfBirth.barangay,
        cityMunicipality: placeOfBirth.cityMunicipality,
        province: placeOfBirth.province,
        country: placeOfBirth.country,
      };
      motherResidence = newResidence;
      fatherResidence = newResidence;
    }

    // Validate multipleBirthOrder against allowed literals.
    const validBirthOrders = ["First", "Second", "Third"] as const;
    const rawMultipleBirthOrder = form.birthCertificateForm?.multipleBirthOrder;
    const multipleBirthOrder: "First" | "Second" | "Third" | undefined =
      validBirthOrders.includes(rawMultipleBirthOrder as any)
        ? (rawMultipleBirthOrder as "First" | "Second" | "Third")
        : undefined;

    // Parent marriage extraction.
    const rawParentMarriage = form.birthCertificateForm?.parentMarriage;
    let parentMarriage: ParentMarriage = {
      date: new Date(),
      place: {
        houseNo: "",
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        country: "",
      },
    };
    if (
      rawParentMarriage &&
      typeof rawParentMarriage === "object" &&
      !Array.isArray(rawParentMarriage) &&
      "date" in rawParentMarriage &&
      "place" in rawParentMarriage
    ) {
      const pm = rawParentMarriage as any;
      const pmDate = pm.date ? new Date(pm.date) : new Date();
      let pmPlace: MarriagePlace = {
        houseNo: "",
        street: "",
        barangay: "",
        cityMunicipality: "",
        province: "",
        country: "",
      };
      const rawPMPlace = pm.place;
      if (
        rawPMPlace &&
        typeof rawPMPlace === "object" &&
        !Array.isArray(rawPMPlace) &&
        "houseNo" in rawPMPlace &&
        "street" in rawPMPlace &&
        "barangay" in rawPMPlace &&
        "cityMunicipality" in rawPMPlace &&
        "province" in rawPMPlace &&
        "country" in rawPMPlace
      ) {
        pmPlace = rawPMPlace as unknown as MarriagePlace;
      }
      parentMarriage = { date: pmDate, place: pmPlace };
    }

    return {
      registryNumber: form.registryNumber || "",
      province: form.province || "",
      cityMunicipality: form.cityMunicipality || "",
      pagination: {
        pageNumber: form.pageNumber || "",
        bookNumber: form.bookNumber || "",
      },
      remarks: form.remarks || "",

      // Child information
      childInfo: {
        firstName: childName.first,
        middleName: childName.middle,
        lastName: childName.last,
        sex,
        dateOfBirth,
        placeOfBirth,
        typeOfBirth,
        multipleBirthOrder,
        birthOrder: form.birthCertificateForm?.birthOrder || "",
        weightAtBirth,
      },

      // Mother information
      motherInfo: {
        firstName: motherName.first,
        middleName: motherName.middle,
        lastName: motherName.last,
        citizenship: form.birthCertificateForm?.motherCitizenship || "",
        religion: form.birthCertificateForm?.motherReligion || "",
        occupation: form.birthCertificateForm?.motherOccupation || "",
        age: String(form.birthCertificateForm?.motherAge || ""),
        totalChildrenBornAlive: String(
          form.birthCertificateForm?.totalChildrenBornAlive || ""
        ),
        childrenStillLiving: String(
          form.birthCertificateForm?.childrenStillLiving || ""
        ),
        childrenNowDead: String(
          form.birthCertificateForm?.childrenNowDead || ""
        ),
        residence: {
          houseNo: motherResidence.houseNo || "",
          st: motherResidence.street || "",
          barangay: motherResidence.barangay || "",
          cityMunicipality: motherResidence.cityMunicipality || "",
          province: motherResidence.province || "",
          country: motherResidence.country || "",
        },
      },

      // Father information
      fatherInfo: {
        firstName: fatherName.first,
        middleName: fatherName.middle,
        lastName: fatherName.last,
        citizenship: form.birthCertificateForm?.fatherCitizenship || "",
        religion: form.birthCertificateForm?.fatherReligion || "",
        occupation: form.birthCertificateForm?.fatherOccupation || "",
        age: String(form.birthCertificateForm?.fatherAge || ""),
        residence: {
          houseNo: fatherResidence.houseNo || "",
          st: fatherResidence.street || "",
          barangay: fatherResidence.barangay || "",
          cityMunicipality: fatherResidence.cityMunicipality || "",
          province: fatherResidence.province || "",
          country: fatherResidence.country || "",
        },
      },

      // Parent marriage information
      parentMarriage: parentMarriage,

      // Attendant information
      attendant: {
        type: "Physician",
        certification: {
          time: new Date().toISOString(),
          name: "",
          title: "",
          address: {
            houseNo: "",
            st: "",
            barangay: "",
            cityMunicipality: "",
            province: "",
            country: "",
          },
          date: new Date(),
        },
      },

      // Informant information
      informant: {
        name: "",
        relationship: "",
        address: {
          houseNo: "",
          st: "",
          barangay: "",
          cityMunicipality: "",
          province: "",
          country: "",
        },
        date: new Date(),
      },

      // Processing details
      preparedBy: {
        // signature: '',
        nameInPrint:
          typeof form.preparedBy === "string"
            ? form.preparedBy
            : form.preparedBy?.name || "",
        titleOrPosition: "",
        date: parseDateSafely(form.preparedByDate),
      },
      receivedBy: {
        // signature: '',
        nameInPrint: typeof form.receivedBy === "string" ? form.receivedBy : "",
        titleOrPosition: "",
        date: parseDateSafely(form.receivedByDate),
      },
      registeredByOffice: {
        // signature: '',
        nameInPrint:
          typeof form.registeredBy === "string" ? form.registeredBy : "",
        titleOrPosition: "",
        date: parseDateSafely(form.registeredByDate),
      },
      hasAffidavitOfPaternity: false,
      affidavitOfPaternityDetails: null,
      isDelayedRegistration: false,
      affidavitOfDelayedRegistration: null,
    };
  };

  const initialData = mapToBirthCertificateValues(form);

  const handleEditSubmit = async (
    data: BirthCertificateFormValues
  ): Promise<void> => {
    try {
      const preparedByValue = { name: data.preparedBy?.nameInPrint || "" };
      const updatedForm: BaseRegistryFormWithRelations = {
        ...form,
        registryNumber: data?.registryNumber || "",
        province: data?.province || "",
        cityMunicipality: data?.cityMunicipality || "",
        pageNumber: data.pagination?.pageNumber || form.pageNumber,
        bookNumber: data.pagination?.bookNumber || form.bookNumber,
        remarks: data.remarks || null,
        preparedBy: preparedByValue,
        preparedByDate: data?.preparedBy?.date || null,
        receivedBy: data.receivedBy?.nameInPrint || null,
        receivedByDate: data.receivedBy?.date || null,
        registeredBy: data.registeredByOffice?.nameInPrint || null,
        registeredByDate: data.registeredByOffice?.date || null,
        updatedAt: new Date(),
      };

      await onSaveAction(updatedForm);
      toast.success(`${t("formUpdated")} ${updatedForm.id}!`);
      onOpenChangeAction(false);
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error(t("errorUpdatingForm"));
    }
  };

  const { formMethods, handleError } = useBirthCertificateForm({
    onOpenChange: () => {},
    defaultValues: initialData,
  });

  const handleFormSubmit = async (
    data: BirthCertificateFormValues
  ): Promise<void> => {
    const result = await formMethods.trigger();
    if (result) {
      try {
        await handleEditSubmit(data);
        formMethods.reset();
      } catch (error: unknown) {
        console.error("Error submitting form:", error);
        toast.error("Error submitting form");
        handleError(error);
      }
    } else {
      toast.warning("Please complete all required fields");
    }
  };

  const handleCancel = () => {
    onOpenChangeAction(false);
  };

  // For marriage certificates
  const handleMarriageFormCancel = () => {
    onOpenChangeAction(false);
  };

  const handleMarriageFormOpenChange = (open: boolean) => {
    handleOpenChange(open);
  };

  const renderForm = () => {
    switch (editType) {
      case "BIRTH":
        return (
          <EditBirthCivilRegistryFormInline
            form={form}
            onSaveAction={async (
              updatedForm: BaseRegistryFormWithRelations
            ) => {
              toast.success(`${t("formUpdated")} ${updatedForm.id}!`);
              return Promise.resolve();
            }}
            editType={form.formType}
            onCancel={handleCancel}
          />
        );
      case "DEATH":
        return (
          <EmptyDialog
            open={open}
            onOpenChange={handleOpenChange}
            onCancel={handleCancel}
          />
        );
      case "MARRIAGE":
        const marriageFormValues = mapToMarriageCertificateValues(form);

        // Add the marriage certificate form ID to the values
        if (
          form.marriageCertificateForm &&
          typeof form.marriageCertificateForm === "object"
        ) {
          marriageFormValues.id =
            form.marriageCertificateForm.id || "no id found";
        }

        return (
          <MarriageCertificateForm
            open={open}
            onOpenChange={handleMarriageFormOpenChange}
            onCancel={handleMarriageFormCancel}
            defaultValues={
              marriageFormValues as Partial<MarriageCertificateFormValues>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-[70vw] w-[70vw] h-[95vh] max-h-[95vh] p-0">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
