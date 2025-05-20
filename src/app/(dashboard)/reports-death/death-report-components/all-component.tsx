// app/(dashboard)/dashboard/reports-death/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { legazpiData } from "@/lib/utils/barangay";
import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header";
import BurialMethodInterface from "./burial-method";
import DeathReportInterface from "./interface-death";
import PlaceOfDeathInterface from "./place-of-death";
import DeathStatisticsInterface from "./statistics";
import CausesOfDeathInterface from "./causes";
import DeathsByDemographicInterface from "./deaths-by-demographic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Statistics {
  totalDeaths: number;
  registration: {
    onTime: number;
    late: number;
  };
  gender: {
    male: number;
    female: number;
    unknown: number;
  };
  ageGroups: {
    lessThan1Year: number;
    oneToFourYears: number;
    fiveToFourteenYears: number;
    fifteenToFortyNineYears: number;
    fiftyToSixtyFourYears: number;
    sixtyFiveAndAbove: number;
    unknown: number;
  };
  monthly: Record<string, MonthlyStatistics>;
}

interface MonthlyStatistics {
  registration: {
    onTime: number;
    late: number;
  };
  gender: {
    male: number;
    female: number;
    unknown: number;
  };
  ageGroups: {
    lessThan1Year: number;
    oneToFourYears: number;
    fiveToFourteenYears: number;
    fifteenToFortyNineYears: number;
    fiftyToSixtyFourYears: number;
    sixtyFiveAndAbove: number;
    unknown: number;
  };
}

interface DeathStatisticsData {
  statistics: Statistics;
  year: number;
  debug?: any; // For debugging purposes
}

interface Category {
  key: string;
  label: string;
  section: keyof MonthlyStatistics; // 'registration', 'gender', or 'ageGroups'
  field: string;
}

export default function DeathReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    format: "csv",
    yearRange: "current",
  });
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  // State to track selected sections
  const [selectedSections, setSelectedSections] = useState<{
    statistics: boolean;
    deathReport: boolean;
    placeOfDeath: boolean;
    burialMethod: boolean;
    causes: boolean;
    deathsByDemographic: boolean;
  }>({
    statistics: true,
    deathReport: true,
    placeOfDeath: true,
    burialMethod: true,
    causes: true,
    deathsByDemographic: true,
  });

  // Format month names
  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString("default", { month: "short" })
    );
  };

  const handleExport = () => {
    // Implement the actual export logic here
    console.log("Exporting with options:", exportOptions);
    console.log("Sections to export:", selectedSections);

    exportCSV(); // Call the export function
    // Close the modal after export
    setIsExportModalOpen(false);

    // You would normally trigger the download here
  };

  // --- EXPORT CSV ------------------------------------------------------------
  const exportCSV = async () => {
    // Fetch only the selected reports
    const fetchPromises: Promise<Response>[] = [];
    const dataKeys: string[] = [];

    if (selectedSections.statistics) {
      fetchPromises.push(fetch(`/api/death-report/statistics?year=${year}`));
      dataKeys.push("statistics");
    }
    if (selectedSections.deathReport) {
      fetchPromises.push(fetch(`/api/death-report?year=${year}`));
      dataKeys.push("deathReport");
    }
    if (selectedSections.placeOfDeath) {
      fetchPromises.push(
        fetch(`/api/death-report/place-of-death?year=${year}`)
      );
      dataKeys.push("placeOfDeath");
    }
    if (selectedSections.burialMethod) {
      fetchPromises.push(fetch(`/api/death-report/burial-method?year=${year}`));
      dataKeys.push("burialMethod");
    }
    if (selectedSections.causes) {
      fetchPromises.push(fetch(`/api/death-report/causes?year=${year}`));
      dataKeys.push("causes");
    }
    if (selectedSections.deathsByDemographic) {
      fetchPromises.push(
        fetch(`/api/death-report/deaths-by-demographic?year=${year}`)
      );
      dataKeys.push("deathsByDemographic");
    }

    const responses = await Promise.all(fetchPromises);
    const data = await Promise.all(responses.map((res) => res.json()));

    // Get month names
    const months = getMonthNames();
    // Get the full list of barangays
    const legazpiBarangays = legazpiData["LEGAZPI CITY"].barangay_list;
    // Initialize CSV string
    let csv = "";

    // Helper function to get value safely from the specified section and field
    const getSectionValue = (
      stats: Statistics | MonthlyStatistics,
      section: keyof MonthlyStatistics,
      field: string
    ): number => {
      if (!stats || !stats[section]) return 0;
      const sectionData = stats[section];
      if (section === "registration") {
        return field === "onTime"
          ? (sectionData as { onTime: number; late: number }).onTime
          : (sectionData as { onTime: number; late: number }).late;
      }
      if (section === "gender") {
        if (field === "male")
          return (
            sectionData as { male: number; female: number; unknown: number }
          ).male;
        if (field === "female")
          return (
            sectionData as { male: number; female: number; unknown: number }
          ).female;
        return (
          sectionData as { male: number; female: number; unknown: number }
        ).unknown;
      }
      if (section === "ageGroups") {
        return (sectionData as { [key: string]: number })[field] || 0;
      }
      return 0;
    };

    // Add selected sections to CSV
    data.forEach((dataItem, index) => {
      const key = dataKeys[index];
      switch (key) {
        case "statistics":
          {
            const statsData: DeathStatisticsData = dataItem;
            // — Death Statistics with months as columns
            csv += `Death Statistics by Month (Year ${statsData.year})
`;
            // Header row with months
            csv += `Particulars,${months.join(",")},Total
`;
            // Define the categories for the statistics table
            const categories: Category[] = [
              {
                key: "onTimeRegistration",
                label: "On-Time Registration",
                section: "registration",
                field: "onTime",
              },
              {
                key: "lateRegistration",
                label: "Late Registration",
                section: "registration",
                field: "late",
              },
              { key: "male", label: "Male", section: "gender", field: "male" },
              {
                key: "female",
                label: "Female",
                section: "gender",
                field: "female",
              },
              {
                key: "lessThan1Year",
                label: "< 1 Year",
                section: "ageGroups",
                field: "lessThan1Year",
              },
              {
                key: "oneToFourYears",
                label: "1-4 Years",
                section: "ageGroups",
                field: "oneToFourYears",
              },
              {
                key: "fiveToFourteenYears",
                label: "5-14 Years",
                section: "ageGroups",
                field: "fiveToFourteenYears",
              },
              {
                key: "fifteenToFortyNineYears",
                label: "15-49 Years",
                section: "ageGroups",
                field: "fifteenToFortyNineYears",
              },
              {
                key: "fiftyToSixtyFourYears",
                label: "50-64 Years",
                section: "ageGroups",
                field: "fiftyToSixtyFourYears",
              },
              {
                key: "sixtyFiveAndAbove",
                label: "65 Above",
                section: "ageGroups",
                field: "sixtyFiveAndAbove",
              },
            ];
            // Add rows for each category
            categories.forEach((category) => {
              let row = `${category.label},`;
              let total = 0;
              for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString();
                const hasMonthData = statsData.statistics?.monthly?.[monthStr];
                const monthlyValue = hasMonthData
                  ? getSectionValue(
                      statsData.statistics.monthly[monthStr],
                      category.section,
                      category.field
                    )
                  : 0;
                row += `${monthlyValue > 0 ? monthlyValue : ""},`;
                total += monthlyValue;
              }
              row += total > 0 ? total : "";
              csv += row + "\n";
            });
            // Total row for all deaths
            csv += `Total Deaths,`;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              let monthTotal = 0;
              if (statsData.statistics?.monthly?.[monthStr]) {
                const monthData = statsData.statistics.monthly[monthStr];
                monthTotal =
                  monthData.registration.onTime + monthData.registration.late;
              }
              csv += `${monthTotal > 0 ? monthTotal : ""},`;
            }
            csv += statsData.statistics?.totalDeaths || 0;
            csv += "\n";
          }
          break;
        case "deathReport":
          {
            const deathData: any = dataItem; // Adjust type as needed
            // — Death by Barangay with months as columns
            csv += `Death by Barangay (Year ${deathData.year})
`;
            // Header row with months
            csv += `Barangay,${months.join(",")},Total
`;
            // For each barangay in the full list, add a row
            legazpiBarangays.forEach((barangay) => {
              let row = `${barangay},`;
              let total = 0;
              // Add data for each month
              for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString();
                const count =
                  deathData.deathsByMonthAndBarangay[monthStr] &&
                  deathData.deathsByMonthAndBarangay[monthStr][barangay]
                    ? deathData.deathsByMonthAndBarangay[monthStr][barangay]
                    : 0;
                // Add empty cell instead of 0
                row += `${count > 0 ? count : ""},`;
                total += count;
              }
              // Add total (empty if zero)
              row += total > 0 ? total : "";
              csv += row + "\n";
            });
            // Add outside Legazpi rows if present
            if (
              deathData.deathsByBarangay["Outside Legazpi"] ||
              deathData.deathsByBarangay["Outside Legazpi (Philippines)"] ||
              deathData.deathsByBarangay["Foreign Countries"]
            ) {
              // Outside Legazpi (Philippines)
              if (deathData.deathsByBarangay["Outside Legazpi (Philippines)"]) {
                let row = `Outside Legazpi (Philippines),`;
                let total = 0;
                for (let month = 1; month <= 12; month++) {
                  const monthStr = month.toString();
                  const count =
                    deathData.deathsByMonthAndBarangay[monthStr] &&
                    deathData.deathsByMonthAndBarangay[monthStr][
                      "Outside Legazpi (Philippines)"
                    ]
                      ? deathData.deathsByMonthAndBarangay[monthStr][
                          "Outside Legazpi (Philippines)"
                        ]
                      : 0;
                  row += `${count > 0 ? count : ""},`;
                  total += count;
                }
                row += total > 0 ? total : "";
                csv += row + "\n";
              }
              // Foreign Countries
              if (deathData.deathsByBarangay["Foreign Countries"]) {
                let row = `Foreign Countries,`;
                let total = 0;
                for (let month = 1; month <= 12; month++) {
                  const monthStr = month.toString();
                  const count =
                    deathData.deathsByMonthAndBarangay[monthStr] &&
                    deathData.deathsByMonthAndBarangay[monthStr][
                      "Foreign Countries"
                    ]
                      ? deathData.deathsByMonthAndBarangay[monthStr][
                          "Foreign Countries"
                        ]
                      : 0;
                  row += `${count > 0 ? count : ""},`;
                  total += count;
                }
                row += total > 0 ? total : "";
                csv += row + "\n";
              }
              // Old format - Outside Legazpi
              if (deathData.deathsByBarangay["Outside Legazpi"]) {
                let row = `Outside Legazpi,`;
                let total = 0;
                for (let month = 1; month <= 12; month++) {
                  const monthStr = month.toString();
                  const count =
                    deathData.deathsByMonthAndBarangay[monthStr] &&
                    deathData.deathsByMonthAndBarangay[monthStr][
                      "Outside Legazpi"
                    ]
                      ? deathData.deathsByMonthAndBarangay[monthStr][
                          "Outside Legazpi"
                        ]
                      : 0;
                  row += `${count > 0 ? count : ""},`;
                  total += count;
                }
                row += total > 0 ? total : "";
                csv += row + "\n";
              }
            }
            csv += "\n";
          }
          break;
        case "placeOfDeath":
          {
            const placeData: any = dataItem; // Adjust type as needed
            // — Place of Death with months as columns
            csv += `Place of Death (Year ${placeData.year})
`;
            // Header row with months
            csv += `Category,${months.join(",")},Total
`;
            // Hospital row
            let hospitalRow = `Hospital,`;
            let hospitalTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                placeData.deathsByPlaceOfDeathMonthly[monthStr]?.hospital || 0;
              hospitalRow += `${count > 0 ? count : ""},`;
              hospitalTotal += count;
            }
            hospitalRow += hospitalTotal > 0 ? hospitalTotal : "";
            csv += hospitalRow + "\n";
            // Transient row
            let transientRow = `Transient,`;
            let transientTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                placeData.deathsByPlaceOfDeathMonthly[monthStr]?.transient || 0;
              transientRow += `${count > 0 ? count : ""},`;
              transientTotal += count;
            }
            transientRow += transientTotal > 0 ? transientTotal : "";
            csv += transientRow + "\n";
            // Others row
            let othersRow = `Others,`;
            let othersTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                placeData.deathsByPlaceOfDeathMonthly[monthStr]?.others || 0;
              othersRow += `${count > 0 ? count : ""},`;
              othersTotal += count;
            }
            othersRow += othersTotal > 0 ? othersTotal : "";
            csv += othersRow + "\n";
            csv += "\n";
          }
          break;
        case "burialMethod":
          {
            const burialData: any = dataItem; // Adjust type as needed
            // — Burial Method with months as columns
            csv += `Burial Method (Year ${burialData.year})
`;
            // Header row with months
            csv += `Method,${months.join(",")},Total
`;
            // Public Cemetery (Legazpi)
            let pubLegRow = `Public Cemetery (Legazpi),`;
            let pubLegTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.legazpi
                  .publicCemetery || 0;
              pubLegRow += `${count > 0 ? count : ""},`;
              pubLegTotal += count;
            }
            pubLegRow += pubLegTotal > 0 ? pubLegTotal : "";
            csv += pubLegRow + "\n";
            // Private Cemetery (Legazpi)
            let privLegRow = `Private Cemetery (Legazpi),`;
            let privLegTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.legazpi
                  .privateCemetery || 0;
              privLegRow += `${count > 0 ? count : ""},`;
              privLegTotal += count;
            }
            privLegRow += privLegTotal > 0 ? privLegTotal : "";
            csv += privLegRow + "\n";
            // Public Cemetery (Outside)
            let pubOutRow = `Public Cemetery (Outside),`;
            let pubOutTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.outsideLegazpi
                  .publicCemetery || 0;
              pubOutRow += `${count > 0 ? count : ""},`;
              pubOutTotal += count;
            }
            pubOutRow += pubOutTotal > 0 ? pubOutTotal : "";
            csv += pubOutRow + "\n";
            // Private Cemetery (Outside)
            let privOutRow = `Private Cemetery (Outside),`;
            let privOutTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.outsideLegazpi
                  .privateCemetery || 0;
              privOutRow += `${count > 0 ? count : ""},`;
              privOutTotal += count;
            }
            privOutRow += privOutTotal > 0 ? privOutTotal : "";
            csv += privOutRow + "\n";
            // Cremation
            let cremationRow = `Cremation,`;
            let cremationTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.cremation || 0;
              cremationRow += `${count > 0 ? count : ""},`;
              cremationTotal += count;
            }
            cremationRow += cremationTotal > 0 ? cremationTotal : "";
            csv += cremationRow + "\n";
            // With Transfer Permit
            let transferRow = `With Transfer Permit,`;
            let transferTotal = 0;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              const count =
                burialData.burialCountsMonthly[monthStr]?.withTransferPermit ||
                0;
              transferRow += `${count > 0 ? count : ""},`;
              transferTotal += count;
            }
            transferRow += transferTotal > 0 ? transferTotal : "";
            csv += transferRow + "\n";
            // Without Transfer Permit (if available)
            if ("withoutTransferPermit" in burialData.burialCounts) {
              let noTransferRow = `Without Transfer Permit,`;
              let noTransferTotal = 0;
              for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString();
                const count =
                  burialData.burialCountsMonthly[monthStr]
                    ?.withoutTransferPermit || 0;
                noTransferRow += `${count > 0 ? count : ""},`;
                noTransferTotal += count;
              }
              noTransferRow += noTransferTotal > 0 ? noTransferTotal : "";
              csv += noTransferRow + "\n";
            }
            csv += "\n";
          }
          break;
        case "causes":
          {
            const causesData: any = dataItem; // Adjust type as needed
            // --- Add Causes of Death section ---
            csv += `Causes of Death (Year ${causesData.year})
`;
            // Header row with months
            csv += `Cause,${months.join(",")},Total
`;
            // Get sorted causes (sort by total count, descending)
            const sortedCauses = Object.keys(causesData.causeCounts).sort(
              (a, b) => causesData.causeCounts[b] - causesData.causeCounts[a]
            );
            // Add a row for each cause
            sortedCauses.forEach((cause) => {
              let row = `${cause},`;
              let total = causesData.causeCounts[cause] || 0;
              // Add data for each month
              for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString();
                const count =
                  causesData.monthlyData[monthStr] &&
                  causesData.monthlyData[monthStr][cause]
                    ? causesData.monthlyData[monthStr][cause]
                    : 0;
                // Add empty cell instead of 0
                row += `${count > 0 ? count : ""},`;
              }
              // Add total (empty if zero)
              row += total > 0 ? total : "";
              csv += row + "\n";
            });
            // Add a total row
            let totalRow = `Total,`;
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString();
              let monthTotal = 0;
              if (causesData.monthlyData[monthStr]) {
                // Sum all causes for this month
                Object.values(causesData.monthlyData[monthStr]).forEach(
                  (count) => {
                    monthTotal += count as number;
                  }
                );
              }
              totalRow += `${monthTotal > 0 ? monthTotal : ""},`;
            }
            totalRow += causesData.totalDeaths || 0;
            csv += totalRow + "\n";
          }
          break;

        case "deathsByDemographic":
          {
            const deathsByDemoData: any = dataItem; // Adjust type as needed

            // — Deaths by Demographic (Yearly Data) - Add proper title
            csv += `NUMBER OF DEATH BY BARANGAYS, AGE GROUP AND GENDER (Year ${deathsByDemoData.year})\n`;

            // Header rows - Properly aligned to match the Excel spreadsheet
            csv += `NAME OF BARANGAY,<1,,01-Apr,,May-14,,15-49,,50-64,,65 ABOVE,,TOTAL,,GRAND TOTAL\n`;
            csv += `,M,F,M,F,M,F,M,F,M,F,M,F,M,F,\n`;

            // List of barangays including special categories
            const barangays = [
              ...legazpiBarangays,
              "Foreign Countries",
              "Outside Legazpi",
              "Unknown",
            ];

            // Helper function to display value or blank when zero
            const formatValue = (value: any) => {
              // Return empty string if value is 0 or undefined/null
              if (value === 0 || value === "0" || !value) return "";
              return value;
            };

            // Add rows for each barangay
            barangays.forEach((barangay) => {
              // Get the data for this barangay
              let barangayData = deathsByDemoData.deathsByDemographic[barangay];

              // If we're at "Outside Legazpi" and there's also data for "Outside Legazpi (Philippines)",
              // we need to merge them
              if (
                barangay === "Outside Legazpi" &&
                deathsByDemoData.deathsByDemographic[
                  "Outside Legazpi (Philippines)"
                ]
              ) {
                // Clone the original data to avoid modifying the source
                barangayData = JSON.parse(
                  JSON.stringify(
                    barangayData || {
                      male: { total: 0 },
                      female: { total: 0 },
                      grandTotal: 0,
                    }
                  )
                );

                const philippinesData =
                  deathsByDemoData.deathsByDemographic[
                    "Outside Legazpi (Philippines)"
                  ];

                // Merge the data - handling the demographic categories
                [
                  "lessThan1Year",
                  "oneToFourYears",
                  "fiveToFourteenYears",
                  "fifteenToFortyNineYears",
                  "fiftyToSixtyFourYears",
                  "sixtyFiveAndAbove",
                  "total",
                ].forEach((category) => {
                  // Male
                  barangayData.male[category] =
                    (barangayData.male[category] || 0) +
                    (philippinesData.male?.[category] || 0);
                  // Female
                  barangayData.female[category] =
                    (barangayData.female[category] || 0) +
                    (philippinesData.female?.[category] || 0);
                });

                // Update the grand total
                barangayData.grandTotal =
                  (barangayData.grandTotal || 0) +
                  (philippinesData.grandTotal || 0);
              }

              if (!barangayData) return;

              // Restructured row to match the Excel format exactly
              // Using formatValue to convert zeros to blank cells
              let row = `${barangay},`;
              row += `${formatValue(barangayData.male.lessThan1Year)},`;
              row += `${formatValue(barangayData.female.lessThan1Year)},`;
              row += `${formatValue(barangayData.male.oneToFourYears)},`;
              row += `${formatValue(barangayData.female.oneToFourYears)},`;
              row += `${formatValue(barangayData.male.fiveToFourteenYears)},`;
              row += `${formatValue(barangayData.female.fiveToFourteenYears)},`;
              row += `${formatValue(
                barangayData.male.fifteenToFortyNineYears
              )},`;
              row += `${formatValue(
                barangayData.female.fifteenToFortyNineYears
              )},`;
              row += `${formatValue(barangayData.male.fiftyToSixtyFourYears)},`;
              row += `${formatValue(
                barangayData.female.fiftyToSixtyFourYears
              )},`;
              row += `${formatValue(barangayData.male.sixtyFiveAndAbove)},`;
              row += `${formatValue(barangayData.female.sixtyFiveAndAbove)},`;
              row += `${formatValue(barangayData.male.total)},`;
              row += `${formatValue(barangayData.female.total)},`;
              row += `${formatValue(barangayData.grandTotal)}`;
              csv += row + "\n";
            });

            // Add totals row
            const totalsData = deathsByDemoData.totalsByDemographic;
            let totalsRow = `TOTAL,`;
            totalsRow += `${formatValue(totalsData.male.lessThan1Year)},`;
            totalsRow += `${formatValue(totalsData.female.lessThan1Year)},`;
            totalsRow += `${formatValue(totalsData.male.oneToFourYears)},`;
            totalsRow += `${formatValue(totalsData.female.oneToFourYears)},`;
            totalsRow += `${formatValue(totalsData.male.fiveToFourteenYears)},`;
            totalsRow += `${formatValue(
              totalsData.female.fiveToFourteenYears
            )},`;
            totalsRow += `${formatValue(
              totalsData.male.fifteenToFortyNineYears
            )},`;
            totalsRow += `${formatValue(
              totalsData.female.fifteenToFortyNineYears
            )},`;
            totalsRow += `${formatValue(
              totalsData.male.fiftyToSixtyFourYears
            )},`;
            totalsRow += `${formatValue(
              totalsData.female.fiftyToSixtyFourYears
            )},`;
            totalsRow += `${formatValue(totalsData.male.sixtyFiveAndAbove)},`;
            totalsRow += `${formatValue(totalsData.female.sixtyFiveAndAbove)},`;
            totalsRow += `${formatValue(totalsData.male.total)},`;
            totalsRow += `${formatValue(totalsData.female.total)},`;
            totalsRow += `${formatValue(totalsData.grandTotal)}`;
            csv += totalsRow + "\n";
            csv += "\n";
          }
          break;

        default:
          break;
      }
    });

    // 3) Download the CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `death_report_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* header */}
      {/* year selector + export buttons */}
      <div className="flex items-center gap-4">
        <Select
          value={year.toString()}
          onValueChange={(value) => setYear(parseInt(value))}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => setIsExportModalOpen(true)}
          className="ml-auto text-sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Death Statistics Data</DialogTitle>
            <DialogDescription>
              Configure your export options and select which sections to include
              in the exported file.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Alert>
              <AlertDescription>
                The exported file will contain mortality data for{" "}
                {exportOptions.yearRange === "current"
                  ? `the year ${year}`
                  : "the selected year range"}
                .
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm font-medium">Export Format</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="format-csv"
                      checked={exportOptions.format === "csv"}
                      onCheckedChange={() =>
                        setExportOptions({ ...exportOptions, format: "csv" })
                      }
                    />
                    <Label htmlFor="format-csv">CSV</Label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-medium">
                  Sections to Include
                </h4>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-statistics"
                      checked={selectedSections.statistics}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          statistics: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-statistics">Statistics</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-deathReport"
                      checked={selectedSections.deathReport}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          deathReport: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-deathReport">Death Report</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-placeOfDeath"
                      checked={selectedSections.placeOfDeath}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          placeOfDeath: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-placeOfDeath">Place of Death</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-burialMethod"
                      checked={selectedSections.burialMethod}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          burialMethod: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-burialMethod">Burial Method</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-causes"
                      checked={selectedSections.causes}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          causes: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-causes">Causes of Death</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-deathsByDemographic"
                      checked={selectedSections.deathsByDemographic}
                      onCheckedChange={(checked) =>
                        setSelectedSections({
                          ...selectedSections,
                          deathsByDemographic: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="export-deathsByDemographic">
                      Deaths by Demographic
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleExport}>
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* your three report components */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        <DeathStatisticsInterface year={year} />
        <DeathReportInterface year={year} />
        <PlaceOfDeathInterface year={year} />
        <BurialMethodInterface year={year} />
        <CausesOfDeathInterface year={year} />
        <DeathsByDemographicInterface year={year} />
      </div>
    </div>
  );
}
