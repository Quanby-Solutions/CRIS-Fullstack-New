// src/components/custom/civil-registry/components/death-details-card.tsx
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { renderName, formatDate, formatLocation } from "./utils";
import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import { safeFormatDateForDeath } from "../columns";

interface DeathDetailsCardProps {
  form: BaseRegistryFormWithRelations;
}

/**
 * Interfaces and type guards for nested objects within deathCertificateForm
 */

/** Causes of Death **/ interface CausesOfDeath {
  immediate: string | { cause: string; interval?: string };
  antecedent: string | { cause: string; interval?: string };
  underlying: string | { cause: string; interval?: string };
  otherSignificantConditions?: string;
}

function isCausesOfDeath(value: unknown): value is CausesOfDeath {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  // Check for required keys
  if (!("immediate" in obj && "antecedent" in obj && "underlying" in obj))
    return false;

  // Check immediate
  if (
    typeof obj.immediate !== "string" &&
    (typeof obj.immediate !== "object" ||
      obj.immediate === null ||
      !("cause" in obj.immediate) ||
      typeof obj.immediate.cause !== "string")
  )
    return false;

  // Check antecedent
  if (
    typeof obj.antecedent !== "string" &&
    (typeof obj.antecedent !== "object" ||
      obj.antecedent === null ||
      !("cause" in obj.antecedent) ||
      typeof obj.antecedent.cause !== "string")
  )
    return false;

  // Check underlying
  if (
    typeof obj.underlying !== "string" &&
    (typeof obj.underlying !== "object" ||
      obj.underlying === null ||
      !("cause" in obj.underlying) ||
      typeof obj.underlying.cause !== "string")
  )
    return false;

  // otherSignificantConditions is optional
  if (
    "otherSignificantConditions" in obj &&
    typeof obj.otherSignificantConditions !== "string"
  )
    return false;

  return true;
}

/** Certifier **/
interface Certifier {
  name: string;
  title: string;
  date: string | Date;
}

function isCertifier(value: unknown): value is Certifier {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as Record<string, unknown>).name === "string" &&
    "title" in value &&
    typeof (value as Record<string, unknown>).title === "string" &&
    "date" in value &&
    (typeof (value as Record<string, unknown>).date === "string" ||
      (value as Record<string, unknown>).date instanceof Date)
  );
}

/** Disposal Details **/
interface DisposalDetails {
  method: string;
  place: string;
  date: string | Date;
}

function isDisposalDetails(value: unknown): value is DisposalDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "method" in value &&
    typeof (value as Record<string, unknown>).method === "string" &&
    "place" in value &&
    typeof (value as Record<string, unknown>).place === "string" &&
    "date" in value &&
    (typeof (value as Record<string, unknown>).date === "string" ||
      (value as Record<string, unknown>).date instanceof Date)
  );
}

/** Informant **/
interface Informant {
  name: string;
  relationship: string;
  date: string | Date;
}

function isInformant(value: unknown): value is Informant {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as Record<string, unknown>).name === "string" &&
    "relationship" in value &&
    typeof (value as Record<string, unknown>).relationship === "string" &&
    "date" in value &&
    (typeof (value as Record<string, unknown>).date === "string" ||
      (value as Record<string, unknown>).date instanceof Date)
  );
}

/** Preparer **/
interface Preparer {
  name: string;
  title: string;
  date: string | Date;
}

function isPreparer(value: unknown): value is Preparer {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as Record<string, unknown>).name === "string" &&
    "title" in value &&
    typeof (value as Record<string, unknown>).title === "string" &&
    "date" in value &&
    (typeof (value as Record<string, unknown>).date === "string" ||
      (value as Record<string, unknown>).date instanceof Date)
  );
}

/** Burial Permit **/
interface BurialPermit {
  number: string;
  date: string | Date;
  cemetery: string;
}

export function isBurialPermit(value: unknown): value is BurialPermit {
  return (
    typeof value === "object" &&
    value !== null &&
    "number" in value &&
    typeof (value as Record<string, unknown>).number === "string" &&
    "date" in value &&
    (typeof (value as Record<string, unknown>).date === "string" ||
      (value as Record<string, unknown>).date instanceof Date) &&
    "cemetery" in value &&
    typeof (value as Record<string, unknown>).cemetery === "string"
  );
}

export const DeathDetailsCard: React.FC<DeathDetailsCardProps> = ({ form }) => {
  const { t } = useTranslation();
  const d = form.deathCertificateForm!;

  // Narrow nested objects using our type guards:
  const causesOfDeath =
    d.causesOfDeath19b && isCausesOfDeath(d.causesOfDeath19b)
      ? d.causesOfDeath19b
      : undefined;

  const certifier =
    d.reviewedBy && isCertifier(d.reviewedBy) ? d.reviewedBy : undefined;

  // First, modify the section in DeathDetailsCard that gets disposalDetails:
  const disposalDetails = d.corpseDisposal
    ? typeof d.corpseDisposal === "string"
      ? { method: d.corpseDisposal, place: "", date: "" }
      : isDisposalDetails(d.corpseDisposal)
      ? d.corpseDisposal
      : undefined
    : undefined;

  const informant =
    d.informant && isInformant(d.informant) ? d.informant : undefined;

  //   const preparer =
  //     d.base && isPreparer(d.preparer) ? d.preparer : undefined;

  const burialPermit =
    d.burialPermit && isBurialPermit(d.burialPermit)
      ? d.burialPermit
      : undefined;

  return (
    <Card className="border rounded-lg shadow-sm">
      <CardContent className="overflow-auto max-h-[70vh] p-6 space-y-6">
        {/* Deceased Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Deceased Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Name")}</p>
              <div>{renderName(d.deceasedName)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Sex")}</p>
              <div>{d.sex}</div>
            </div>
            <div>
              <p className="font-medium">{t("Date of Death")}</p>
              <div>{safeFormatDateForDeath(d.dateOfDeath as any)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Date of Birth")}</p>
              <div>{safeFormatDateForDeath(d.dateOfBirth as any)}</div>
            </div>
          </div>
        </section>

        {/* Location Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Location Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Place of Death")}</p>
              <div>{formatLocation(d.placeOfDeath)}</div>
            </div>
            {/* <div>
              <p className="font-medium">{t("Place of Birth")}</p>
              <div>{formatLocation(d.birthInformation)}</div>
            </div> */}
            <div>
              <p className="font-medium">{t("Residence")}</p>
              <div>{formatLocation(d.residence)}</div>
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Additional Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="font-medium">{t("Civil Status")}</p>
              <div>{d.civilStatus}</div>
            </div>
            <div>
              <p className="font-medium">{t("Religion")}</p>
              <div>{d.religion}</div>
            </div>
            <div>
              <p className="font-medium">{t("Citizenship")}</p>
              <div>{d.citizenship}</div>
            </div>
            <div>
              <p className="font-medium">{t("Occupation")}</p>
              <div>{d.occupation}</div>
            </div>
            <div>
              <p className="font-medium">{t("Father's Name")}</p>
              <div>{renderName(d.parentInfo)}</div>
            </div>
            {/* <div>
              <p className="font-medium">{t("Mother's Name")}</p>
              <div>{renderName(d.nameOfMother)}</div>
            </div> */}
          </div>
        </section>

        {/* Cause of Death */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Cause of Death")}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="font-medium">{t("Immediate")}</p>
              <div>
                {typeof causesOfDeath?.immediate === "object"
                  ? causesOfDeath.immediate.cause
                  : (causesOfDeath?.immediate as string) || ""}
                {causesOfDeath &&
                  typeof causesOfDeath.immediate === "object" &&
                  causesOfDeath.immediate.interval && (
                    <div className="text-sm text-gray-500">
                      Interval: {causesOfDeath.immediate.interval}
                    </div>
                  )}
              </div>
            </div>
            <div>
              <p className="font-medium">{t("Antecedent")}</p>
              <div>
                {causesOfDeath && typeof causesOfDeath.antecedent === "object"
                  ? causesOfDeath.antecedent.cause
                  : (causesOfDeath?.antecedent as string) || ""}
                {causesOfDeath &&
                  typeof causesOfDeath.antecedent === "object" &&
                  causesOfDeath.antecedent.interval && (
                    <div className="text-sm text-gray-500">
                      Interval: {causesOfDeath.antecedent.interval}
                    </div>
                  )}
              </div>
            </div>
            <div>
              <p className="font-medium">{t("Underlying")}</p>
              <div>
                {causesOfDeath && typeof causesOfDeath.underlying === "object"
                  ? causesOfDeath.underlying.cause
                  : (causesOfDeath?.underlying as string) || ""}
                {causesOfDeath &&
                  typeof causesOfDeath.underlying === "object" &&
                  causesOfDeath.underlying.interval && (
                    <div className="text-sm text-gray-500">
                      Interval: {causesOfDeath.underlying.interval}
                    </div>
                  )}
              </div>
            </div>
            {causesOfDeath && causesOfDeath.otherSignificantConditions && (
              <div>
                <p className="font-medium">{t("Other Significant")}</p>
                <div>{causesOfDeath.otherSignificantConditions}</div>
              </div>
            )}
          </div>
        </section>

        {/* Medical Details */}
        {/* <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Medical Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="font-medium">{t("Attended by Physician")}</p>
              <div>{d.attendedByPhysician ? t("Yes") : t("No")}</div>
            </div>
            <div>
              <p className="font-medium">{t("Autopsy Performed")}</p>
              <div>{d.autopsyPerformed ? t("Yes") : t("No")}</div>
            </div>
            <div>
              <p className="font-medium">{t("Manner of Death")}</p>
              <div>{d.mannerOfDeath}</div>
            </div>
          </div>
        </section> */}

        {/* Certificate & Disposal Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Certificate & Disposal Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Certifier")}</p>
              <div>
                {certifier ? (
                  <>
                    {renderName(certifier.name)} ({certifier.title})
                    <br />
                    {formatDate(certifier.date)}
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div>
              <p className="font-medium">{t("Disposal Details")}</p>
              <div>
                {d.corpseDisposal && (
                  <>
                    <strong>{t("Disposal Method")}:</strong> {d.corpseDisposal}
                    <br />
                  </>
                )}

                {d.burialPermit &&
                  typeof d.burialPermit === "object" &&
                  "number" in d.burialPermit && (
                    <>
                      <strong>{t("Burial Permit")}:</strong>{" "}
                      {d.burialPermit.number}
                      {d.burialPermit.dateIssued && (
                        <>
                          <br />
                          <strong>{t("Date Issued")}:</strong>{" "}
                          {safeFormatDateForDeath(d.burialPermit.dateIssued)}
                        </>
                      )}
                      <br />
                    </>
                  )}

                {d.transferPermit &&
                  typeof d.transferPermit === "object" &&
                  "number" in d.transferPermit && (
                    <>
                      <strong>{t("Transfer Permit")}:</strong>{" "}
                      {d.transferPermit.number}
                      {d.transferPermit.dateIssued && (
                        <>
                          <br />
                          <strong>{t("Date Issued")}:</strong>{" "}
                          {safeFormatDateForDeath(d.transferPermit.dateIssued)}
                        </>
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* Informant & Preparer */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Informant & Preparer")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Informant")}</p>
              <div>
                {informant ? (
                  <>
                    {renderName(informant.name)} ({informant.relationship})
                    <br />
                    {formatDate(informant.date)}
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
            {/* <div>
              <p className="font-medium">{t("Preparer")}</p>
              <div>
                {preparer ? (
                  <>
                    {renderName(preparer.name)} ({preparer.title})
                    <br />
                    {formatDate(preparer.date)}
                  </>
                ) : (
                  ""
                )}
              </div>
            </div> */}
          </div>
        </section>

        {/* Burial Permit */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Burial Permit")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Permit Number")}</p>
              <div>{burialPermit ? burialPermit.number : ""}</div>
            </div>
            <div>
              <p className="font-medium">{t("Date")}</p>
              <div>{burialPermit ? formatDate(burialPermit.date) : ""}</div>
            </div>
            <div>
              <p className="font-medium">{t("Cemetery")}</p>
              <div>{burialPermit ? burialPermit.cemetery : ""}</div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
