import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { BaseRegistryFormWithRelations } from "@/hooks/civil-registry-action";
import {
  formatFullName,
  formatDate,
  formatLocation,
  renderName,
} from "./utils";

/**
 * Format Place of Birth function
 */
function formatPlaceOfBirth(placeOfBirth: any): string {
  if (!placeOfBirth || typeof placeOfBirth !== "object") {
    return "";
  }

  // Check if it's an international address
  if (
    placeOfBirth.internationalAddress &&
    typeof placeOfBirth.internationalAddress === "string" &&
    placeOfBirth.internationalAddress.trim() !== ""
  ) {
    return placeOfBirth.internationalAddress;
  }

  // Build local address with the specified format
  const addressParts = [];

  // Add house number and street if available
  if (placeOfBirth.houseNo && placeOfBirth.houseNo.trim() !== "") {
    addressParts.push(placeOfBirth.houseNo);
  }

  if (placeOfBirth.street && placeOfBirth.street.trim() !== "") {
    addressParts.push(placeOfBirth.street);
  }

  // Add barangay if available
  if (placeOfBirth.barangay && placeOfBirth.barangay.trim() !== "") {
    addressParts.push(placeOfBirth.barangay);
  }

  // Add city/municipality if available
  if (
    placeOfBirth.cityMunicipality &&
    placeOfBirth.cityMunicipality.trim() !== ""
  ) {
    addressParts.push(placeOfBirth.cityMunicipality);
  }

  // Add province if available
  if (placeOfBirth.province && placeOfBirth.province.trim() !== "") {
    addressParts.push(placeOfBirth.province);
  }

  // Add country if available
  if (placeOfBirth.country && placeOfBirth.country.trim() !== "") {
    addressParts.push(placeOfBirth.country);
  }

  // Join all available address parts with commas
  return addressParts.join(", ");
}

/**
 * Interface for Contracting Parties Signature.
 */
interface ContractingPartiesSignature {
  husband: string;
  wife: string;
}

/**
 * Interface for Marriage License Details.
 */
interface MarriageLicenseDetails {
  licenseNumber: string;
  dateIssued: string | Date;
  placeIssued: unknown; // adjust this type based on your location data
}

/**
 * Type guard for MarriageLicenseDetails.
 */
function isMarriageLicenseDetails(
  value: unknown
): value is MarriageLicenseDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "licenseNumber" in value &&
    typeof (value as Record<string, unknown>).licenseNumber === "string" &&
    "dateIssued" in value &&
    (typeof (value as Record<string, unknown>).dateIssued === "string" ||
      (value as Record<string, unknown>).dateIssued instanceof Date) &&
    "placeIssued" in value
  );
}

/**
 * Interface for Solemnizing Officer.
 */
interface SolemnizingOfficer {
  name: string;
  position: string;
  registryNoExpiryDate: string;
}

/**
 * Type guard for SolemnizingOfficer.
 */
function isSolemnizingOfficer(value: unknown): value is SolemnizingOfficer {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as Record<string, unknown>).name === "string" &&
    "position" in value &&
    typeof (value as Record<string, unknown>).position === "string" &&
    "registryNoExpiryDate" in value &&
    (typeof (value as Record<string, unknown>).registryNoExpiryDate ===
      "string" ||
      (value as Record<string, unknown>).registryNoExpiryDate instanceof Date)
  );
}

interface MarriageDetailsCardProps {
  form: BaseRegistryFormWithRelations;
}

export const MarriageDetailsCard: React.FC<MarriageDetailsCardProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const m = form.marriageCertificateForm!;

  // Narrow the type of each property using our type guards.
  const marriageLicenseDetails = isMarriageLicenseDetails(
    m.marriageLicenseDetails
  )
    ? m.marriageLicenseDetails
    : undefined;

  const solemnizingOfficer = isSolemnizingOfficer(m.solemnizingOfficer)
    ? m.solemnizingOfficer
    : undefined;

  return (
    <Card className="border rounded-lg shadow-sm">
      {/* Wrap the content in an overflow-auto container with a max-height */}
      <CardContent className="overflow-auto max-h-[70vh] p-6 space-y-6">
        {/* Husband Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Husband Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Name")}</p>
              <div>
                {formatFullName(
                  m.husbandFirstName ?? undefined,
                  m.husbandMiddleName ?? undefined,
                  m.husbandLastName ?? undefined
                )}
              </div>
            </div>
            <div>
              <p className="font-medium">{t("Date of Birth")}</p>
              <div>{formatDate(m.husbandDateOfBirth ?? undefined)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Age")}</p>
              <div>{m.husbandAge}</div>
            </div>
            <div>
              <p className="font-medium">{t("Place of Birth")}</p>
              <div>{formatPlaceOfBirth(m.husbandPlaceOfBirth)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Religion")}</p>
              <div>{m.husbandReligion}</div>
            </div>
            <div>
              <p className="font-medium">{t("Civil Status")}</p>
              <div>{m.husbandCivilStatus}</div>
            </div>
            <div>
              <p className="font-medium">{t("Father's Name")}</p>
              <div>{renderName(m.husbandFatherName)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Mother's Maiden Name")}</p>
              <div>{renderName(m.husbandMotherMaidenName)}</div>
            </div>
          </div>
        </section>

        {/* Wife Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Wife Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Name")}</p>
              <div>
                {formatFullName(
                  m.wifeFirstName ?? undefined,
                  m.wifeMiddleName ?? undefined,
                  m.wifeLastName ?? undefined
                )}
              </div>
            </div>
            <div>
              <p className="font-medium">{t("Date of Birth")}</p>
              <div>{formatDate(m.wifeDateOfBirth ?? undefined)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Age")}</p>
              <div>{m.wifeAge}</div>
            </div>
            <div>
              <p className="font-medium">{t("Place of Birth")}</p>
              <div>{formatPlaceOfBirth(m.wifePlaceOfBirth)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Religion")}</p>
              <div>{m.wifeReligion}</div>
            </div>
            <div>
              <p className="font-medium">{t("Civil Status")}</p>
              <div>{m.wifeCivilStatus}</div>
            </div>
            <div>
              <p className="font-medium">{t("Father's Name")}</p>
              <div>{renderName(m.wifeFatherName)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Mother's Maiden Name")}</p>
              <div>{renderName(m.wifeMotherMaidenName)}</div>
            </div>
          </div>
        </section>

        {/* Marriage Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Marriage Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Place of Marriage")}</p>
              <div>{formatLocation(m.placeOfMarriage)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Date of Marriage")}</p>
              <div>{formatDate(m.dateOfMarriage ?? undefined)}</div>
            </div>
            <div>
              <p className="font-medium">{t("Time of Marriage")}</p>
              <div>
                {m.timeOfMarriage
                  ? new Date(m.timeOfMarriage).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>

            <div>
              <p className="font-medium">{t("Marriage Settlement")}</p>
              <div>{m.marriageSettlement ? t("Yes") : t("No")}</div>
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="p-4 rounded">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {t("Additional Details")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">{t("Marriage License Details")}</p>
              <div>
                <strong>{t("Number")}:</strong>{" "}
                {marriageLicenseDetails?.licenseNumber || ""}
                <br />
                <strong>{t("Date Issued")}:</strong>{" "}
                {formatDate(marriageLicenseDetails?.dateIssued ?? undefined)}
                <br />
                <strong>{t("Place Issued")}:</strong>{" "}
                {formatLocation(marriageLicenseDetails?.placeIssued)}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="font-medium">{t("Solemnizing Officer")}</p>
              <div>
                <strong>{t("Name")}:</strong> {solemnizingOfficer?.name || ""}
                <br />
                <strong>{t("Position")}:</strong>{" "}
                {solemnizingOfficer?.position || ""}
                <br />
                <strong>{t("Registry No. Expiry Date")}:</strong>{" "}
                {solemnizingOfficer?.registryNoExpiryDate || ""}
                <br />
              </div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
