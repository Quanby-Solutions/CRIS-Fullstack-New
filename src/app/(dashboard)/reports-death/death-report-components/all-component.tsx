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
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  // Format month names
  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString("default", { month: "short" })
    );
  };

  // --- EXPORT CSV ------------------------------------------------------------
  const exportCSV = async () => {
    // 1) fetch all four in parallel
    const [statsRes, deathRes, placeRes, burialRes] = await Promise.all([
      fetch(`/api/death-report/statistics?year=${year}`),
      fetch(`/api/death-report?year=${year}`),
      fetch(`/api/death-report/place-of-death?year=${year}`),
      fetch(`/api/death-report/burial-method?year=${year}`),
    ]);
    const [statsData, deathData, placeData, burialData] = await Promise.all([
      statsRes.json(),
      deathRes.json(),
      placeRes.json(),
      burialRes.json(),
    ]);

    // Get month names
    const months = getMonthNames();
    // Get the full list of barangays
    const legazpiBarangays = legazpiData["LEGAZPI CITY"].barangay_list;

    // Initialize CSV string
    let csv = "";

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
      { key: "female", label: "Female", section: "gender", field: "female" },
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
    csv += "\n\n";

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
            deathData.deathsByMonthAndBarangay[monthStr]["Foreign Countries"]
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
            deathData.deathsByMonthAndBarangay[monthStr]["Outside Legazpi"]
              ? deathData.deathsByMonthAndBarangay[monthStr]["Outside Legazpi"]
              : 0;
          row += `${count > 0 ? count : ""},`;
          total += count;
        }
        row += total > 0 ? total : "";
        csv += row + "\n";
      }
    }
    csv += "\n";

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
        burialData.burialCountsMonthly[monthStr]?.legazpi.publicCemetery || 0;
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
        burialData.burialCountsMonthly[monthStr]?.legazpi.privateCemetery || 0;
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
      const count = burialData.burialCountsMonthly[monthStr]?.cremation || 0;
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
        burialData.burialCountsMonthly[monthStr]?.withTransferPermit || 0;
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
          burialData.burialCountsMonthly[monthStr]?.withoutTransferPermit || 0;
        noTransferRow += `${count > 0 ? count : ""},`;
        noTransferTotal += count;
      }
      noTransferRow += noTransferTotal > 0 ? noTransferTotal : "";
      csv += noTransferRow + "\n";
    }

    // 3) download
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
      <div className="flex items-center p-4 gap-4">
        <select
          className="border rounded px-2 py-1"
          value={year}
          onChange={(e) => setYear(+e.target.value)}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>
      {/* your three report components */}
      <div className="flex-1 overflow-y-auto p-4">
        <DeathStatisticsInterface year={year} />
        <DeathReportInterface year={year} />
        <PlaceOfDeathInterface year={year} />
        <BurialMethodInterface year={year} />
      </div>
    </div>
  );
}
