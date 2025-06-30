"use client";

import { format } from "date-fns";
import { Session } from "next-auth";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { DocumentStatus, FormType } from "@prisma/client";
import { DataTableRowActions } from "./data-table-row-actions";
import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import { DataTableColumnHeader } from "@/components/custom/table/data-table-column-header";
import StatusDropdown from "@/components/custom/civil-registry/components/status-dropdown";

// Type definitions
type TranslationFunction = (key: string) => string;

type FormTypeInfo = {
  label: string;
  variant: "default" | "secondary" | "destructive";
  className: string;
};

type RegistryDetails = {
  registryNumber: string;
  pageNumber: string;
  bookNumber: string;
};

type NameDetails = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  first?: string;
  middle?: string;
  last?: string;
};

type FormSpecificDetails = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  sex?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  husbandFirstName?: string;
  husbandLastName?: string;
  wifeFirstName?: string;
  wifeLastName?: string;
  dateOfMarriage?: string;
};

// Utility function to safely parse names
const parseNameSafely = (name: unknown): NameDetails => {
  if (typeof name === "string") {
    try {
      return JSON.parse(name) as NameDetails;
    } catch {
      return {};
    }
  }
  return (name as NameDetails) || {};
};

const safeFormatDate = (date: unknown, dateFormat = "PP"): string => {
  // Handle null, undefined, and other falsy values
  if (!date) return "N/A";

  // Convert to date based on input type
  let parsedDate: Date;
  if (date instanceof Date) {
    parsedDate = date;
  } else if (typeof date === "string" || typeof date === "number") {
    parsedDate = new Date(date);
  } else {
    return "N/A";
  }

  // Validate the date
  return isNaN(parsedDate.getTime()) ? "N/A" : format(parsedDate, dateFormat);
};

export const safeFormatDateForDeath = (dateField: any): string => {
  // 1) Handle null / undefined / empty‐string cases right away
  if (!dateField) return "";

  // 2) Handle the wrapper-object case
  if (
    typeof dateField === "object" &&
    ("dateOfDeath" in dateField || "dateOfBirth" in dateField)
  ) {
    const dob = (dateField as any).dateOfDeath;
    const dib = (dateField as any).dateOfBirth;
    // if both are empty or the one is empty, bail out with empty
    if (!dob && !dib) return "";
    // otherwise re‐run on the inner string
    const inner = dob || dib;
    return safeFormatDateForDeath(inner);
  }

  // 3) If it's a string that's not a date, return it as-is
  if (typeof dateField === "string") {
    // Check if it's JSON-looking
    if (dateField.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(dateField);
        const inner = parsed.dateOfDeath || parsed.dateOfBirth;
        return safeFormatDateForDeath(inner);
      } catch {
        // If JSON parsing fails, return the original string
        return dateField;
      }
    }

    // Check if it's not a date string
    if (!/^\d{4}-\d{2}-\d{2}T/.test(dateField)) {
      return dateField; // Return the string as-is
    }
  }

  // 4) Try to parse as date
  try {
    const d = new Date(dateField);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {
    // If date parsing fails, return the original value as string
    return String(dateField);
  }

  // 5) Fallback to empty if it's some other junk
  return "";
};

// Form type styling map
const formTypeVariants: Record<FormType, FormTypeInfo> = {
  MARRIAGE: {
    label: "Marriage",
    variant: "destructive",
    className:
      "bg-blue-500/30 dark:bg-blue-500/50 dark:text-accent-foreground text-blue-500 hover:bg-blue-500/30",
  },
  BIRTH: {
    label: "Birth",
    variant: "secondary",
    className:
      "bg-green-500/30 dark:bg-green-500/50 text-green-500 dark:text-accent-foreground hover:bg-green-500/30",
  },
  DEATH: {
    label: "Death",
    variant: "default",
    className: "bg-muted text-accent-foreground hover:bg-muted",
  },
};

export const createColumns = (
  session: Session | null,
  onUpdateForm?: (updatedForm: BaseRegistryFormWithRelations) => void,
  onDeleteForm?: (id: string) => void,
  t?: TranslationFunction
): ColumnDef<BaseRegistryFormWithRelations>[] => {
  // Safe translation function
  const translate: TranslationFunction = (key: string) => t?.(key) ?? key;

  // Helper to extract form-specific details
  const extractFormDetails = (
    row: BaseRegistryFormWithRelations
  ): FormSpecificDetails => {
    switch (row.formType) {
      case "BIRTH":
        if (!row.birthCertificateForm) return {};
        const birthName = parseNameSafely(row.birthCertificateForm.childName);
        return {
          firstName: birthName.firstName ?? birthName.first ?? "",
          middleName: birthName.middleName ?? birthName.middle ?? "",
          lastName: birthName.lastName ?? birthName.last ?? "",
          sex: row.birthCertificateForm.sex ?? "",
          dateOfBirth: safeFormatDate(row.birthCertificateForm.dateOfBirth),
        };

      case "DEATH":
        if (!row.deathCertificateForm) return {};
        const deathName = parseNameSafely(
          row.deathCertificateForm.deceasedName
        );
        return {
          firstName: deathName.first ?? deathName.firstName ?? "",
          middleName: deathName.middle ?? deathName.middleName ?? "",
          lastName: deathName.last ?? deathName.lastName ?? "",
          sex: row.deathCertificateForm.sex ?? "",
          dateOfDeath: safeFormatDateForDeath(
            row.deathCertificateForm.dateOfDeath
          ),
        };

      case "MARRIAGE":
        if (!row.marriageCertificateForm) return {};
        return {
          husbandFirstName: row.marriageCertificateForm.husbandFirstName ?? "",
          husbandLastName: row.marriageCertificateForm.husbandLastName ?? "",
          wifeFirstName: row.marriageCertificateForm.wifeFirstName ?? "",
          wifeLastName: row.marriageCertificateForm.wifeLastName ?? "",
          dateOfMarriage: safeFormatDate(
            row.marriageCertificateForm.dateOfMarriage
          ),
        };

      default:
        return {};
    }
  };

  return [
    {
      accessorKey: "formType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("formType")} />
      ),
      cell: ({ row }) => {
        const formType = row.getValue("formType") as FormType;
        const formTypeInfo = formTypeVariants[formType] ?? {
          label: "Unknown",
          variant: "default",
          className: "",
        };

        return (
          <Badge
            variant={formTypeInfo.variant}
            className={`font-medium ${formTypeInfo.className}`}
          >
            {translate(formTypeInfo.label.toLowerCase())}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const formType = row.getValue(id);
        return formType ? value.includes(formType) : false;
      },
    },
    {
      accessorFn: (row) =>
        JSON.stringify({
          registryNumber: row.registryNumber ?? "N/A",
          pageNumber: row.pageNumber ?? "N/A",
          bookNumber: row.bookNumber ?? "N/A",
        }),
      id: "registryDetails",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate("registryDetails")}
        />
      ),
      cell: ({ row }) => {
        const details = JSON.parse(
          row.getValue("registryDetails") || "{}"
        ) as RegistryDetails;
        return (
          <div className="flex flex-col space-y-2">
            {Object.entries({
              registry: details.registryNumber,
              page: details.pageNumber,
              book: details.bookNumber,
            }).map(([type, value]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="font-medium">{translate(type)}:</span>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const details = JSON.parse(row.getValue(id) || "{}") as RegistryDetails;

        if (
          typeof value === "object" &&
          "pageNumber" in value &&
          "bookNumber" in value
        ) {
          const { pageNumber, bookNumber } = value;
          const matchesPage = pageNumber
            ? (details.pageNumber || "")
                .toLowerCase()
                .includes(pageNumber.toLowerCase())
            : true;
          const matchesBook = bookNumber
            ? (details.bookNumber || "")
                .toLowerCase()
                .includes(bookNumber.toLowerCase())
            : true;
          return matchesPage && matchesBook;
        }
        return true;
      },
    },
    {
      accessorFn: (row) => JSON.stringify(extractFormDetails(row)),
      id: "details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("details")} />
      ),
      cell: ({ row }) => {
        const details = JSON.parse(
          row.getValue("details") || "{}"
        ) as FormSpecificDetails;
        return (
          <div className="space-y-2">
            {(details.firstName || details.middleName || details.lastName) && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("name")}:</span>
                <span>
                  {`${details.firstName ?? ""} ${details.middleName ?? ""} ${
                    details.lastName ?? ""
                  }`.trim()}
                </span>
              </div>
            )}
            {details.sex && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("sex")}:</span>
                <span>{details.sex}</span>
              </div>
            )}
            {details.dateOfBirth && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("dateOfBirth")}:</span>
                <span>{details.dateOfBirth}</span>
              </div>
            )}
            {details.dateOfDeath && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("dateOfDeath")}:</span>
                <span>{details.dateOfDeath || ""}</span>
              </div>
            )}
            {(details.husbandFirstName || details.husbandLastName) && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("husband")}:</span>
                <span>
                  {`${details.husbandFirstName ?? ""} ${
                    details.husbandLastName ?? ""
                  }`.trim()}
                </span>
              </div>
            )}
            {(details.wifeFirstName || details.wifeLastName) && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{translate("wife")}:</span>
                <span>
                  {`${details.wifeFirstName ?? ""} ${
                    details.wifeLastName ?? ""
                  }`.trim()}
                </span>
              </div>
            )}
            {details.dateOfMarriage && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {translate("dateOfMarriage")}:
                </span>
                <span>{details.dateOfMarriage}</span>
              </div>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (!Array.isArray(value)) return true;
        try {
          const details = JSON.parse(
            row.getValue(id) || "{}"
          ) as FormSpecificDetails;
          const [firstNameSearch, middleNameSearch, lastNameSearch] = value as [
            string,
            string,
            string
          ];

          if (!firstNameSearch && !middleNameSearch && !lastNameSearch) {
            return true;
          }

          const checkNameMatch = (
            actualName: string | undefined,
            searchTerm: string
          ) =>
            !searchTerm ||
            (actualName ?? "").toLowerCase().includes(searchTerm.toLowerCase());

          // Check individual name fields
          if (details.firstName || details.middleName || details.lastName) {
            return (
              checkNameMatch(details.firstName, firstNameSearch) &&
              checkNameMatch(details.middleName, middleNameSearch) &&
              checkNameMatch(details.lastName, lastNameSearch)
            );
          }

          // Check marriage names
          return (
            (checkNameMatch(details.husbandFirstName, firstNameSearch) &&
              checkNameMatch(details.husbandLastName, lastNameSearch)) ||
            (checkNameMatch(details.wifeFirstName, firstNameSearch) &&
              checkNameMatch(details.wifeLastName, lastNameSearch))
          );
        } catch (error) {
          console.error(error);
          return true;
        }
      },
    },
    {
      accessorFn: (row) => `${row.province}, ${row.cityMunicipality}`,
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("location")} />
      ),
      cell: ({ row }) => {
        const location = row.getValue("location") as string;
        const [province, city] = location.split(", ");
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{province}</span>
            <span className="text-sm text-muted-foreground">{city}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        const location = row.getValue(id) as string;
        if (!value?.length) return true;
        return value.some((val) =>
          location.toLowerCase().includes(val.toLowerCase())
        );
      },
    },
    // {
    //   id: 'preparedBy',
    //   accessorFn: (row) => row.preparedBy?.name,
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={translate('preparedBy')} />
    //   ),
    //   cell: ({ row }) => {
    //     const preparedBy = row.original.preparedBy?.name || 'N/A'
    //     return (
    //       <div className="flex flex-col space-y-1">
    //         <span className="font-medium">{preparedBy}</span>
    //       </div>
    //     )
    //   },
    //   filterFn: (row, id, value: string[]) => {
    //     const preparerName = row.original.preparedBy?.name
    //     if (!value?.length) return true
    //     return value.includes(preparerName || '')
    //   },
    // },
    {
      id: "verifiedBy",
      accessorFn: (row) => row.verifiedBy?.name,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate("verifiedBy")}
        />
      ),
      cell: ({ row }) => {
        const verifiedBy = row.original.verifiedBy?.name || "N/A";
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{verifiedBy}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        const verifierName = row.original.verifiedBy?.name;
        if (!value?.length) return true;
        return value.includes(verifierName || "");
      },
    },
    {
      accessorFn: (row) => {
        const receivedBy = `${row.receivedBy || ""} ${
          row.receivedByPosition || ""
        }`.trim();
        const receivedDate = row.receivedByDate
          ? safeFormatDate(row.receivedByDate)
          : "N/A";
        return `${receivedBy} - ${receivedDate}`;
      },
      id: "received",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("received")} />
      ),
      cell: ({ row }) => {
        const received = row.getValue("received") as string;
        const [by, date] = received.split(" - ");
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{by}</span>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        const received = row.getValue(id) as string;
        if (!value?.length) return true;
        return value.some((val) =>
          received.toLowerCase().includes(val.toLowerCase())
        );
      },
    },
    {
      accessorFn: (row) =>
        `${row.registeredBy || ""} ${row.registeredByPosition || ""}`.trim(),
      id: "registeredBy",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate("registeredBy")}
        />
      ),
      cell: ({ row }) => {
        const registeredBy = row.getValue("registeredBy") as string;
        const [name, ...rest] = registeredBy.split(" ");
        return (
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{name}</span>
            <span className="text-sm text-muted-foreground">
              {rest.join(" ")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        const registeredBy = row.getValue(id) as string;
        if (!value?.length) return true;
        return value.some((val) =>
          registeredBy.toLowerCase().includes(val.toLowerCase())
        );
      },
    },
    {
      id: "year",
      accessorFn: (row) => {
        const date = row.registeredByDate;
        return date ? new Date(date).getFullYear().toString() : "N/A";
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("year")} />
      ),
      cell: ({ row }) => {
        const year = row.getValue("year") as string;
        return <span>{year}</span>;
      },
      filterFn: (row, id, value: string[]) => {
        const year = row.getValue(id) as string;
        if (!value?.length) return true;
        return value.includes(year);
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("status")} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as DocumentStatus;
        return (
          <StatusDropdown
            formId={row.original.id}
            registryNumber={row.original.registryNumber ?? "N/A"}
            bookNumber={row.original.bookNumber ?? "N/A"}
            pageNumber={row.original.pageNumber ?? "N/A"}
            formType={row.original.formType ?? "N/A"}
            currentStatus={status}
            onStatusChange={(newStatus) => {
              row.original.status = newStatus;
            }}
          />
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "registeredByDate",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate("Registration Date")}
        />
      ),
      cell: ({ row }) => {
        const registeredByDate = row.getValue("registeredByDate");
        return <span>{safeFormatDate(registeredByDate, "PPP")}</span>;
      },
      filterFn: (row, id, filterValue) => {
        if (typeof filterValue === "object" && "from" in filterValue) {
          if (!filterValue) return true;
          const rowDate = new Date(row.getValue(id));
          const range = filterValue as DateRange;
          if (!range.from) return true;
          const start = new Date(range.from);
          start.setHours(0, 0, 0, 0);
          if (!range.to) {
            return rowDate >= start;
          }
          const end = new Date(range.to);
          end.setHours(23, 59, 59, 999);
          return rowDate >= start && rowDate <= end;
        }
        if (Array.isArray(filterValue)) {
          if (!filterValue.length) return true;
          const date = new Date(row.getValue(id));
          const year = date.getFullYear().toString();
          return filterValue.includes(year);
        }
        return true;
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translate("Actions")} />
      ),
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateForm={onUpdateForm}
          onDeleteForm={onDeleteForm}
        />
      ),
    },
  ];
};
