// app/(dashboard)/dashboard/demographic-deaths/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header";
import DeathsByDemographicInterface from "./deaths-by-demographic";

export default function DemoPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  const exportCSV = async () => {
    // Fetch data for export
    const [demographicRes] = await Promise.all([
      fetch(`/api/death-report/deaths-by-demographic?year=${year}`),
    ]);

    const [demographicData] = await Promise.all([demographicRes.json()]);

    // Get the full list of barangays
    const legazpiData = await import("@/lib/utils/barangay").then(
      (mod) => mod.legazpiData
    );
    const legazpiBarangays = legazpiData["LEGAZPI CITY"].barangay_list;

    // Initialize CSV string
    let csv = "";

    // Add header
    csv += `Deaths by Barangay, Age Group and Gender (Year ${demographicData.year})
`;

    // Add detailed breakdown by age group
    csv += `Detailed Breakdown by Age Group, Gender and Barangay\n`;
    csv += `Barangay,Gender,<1,1-4,5-14,15-49,50-64,65+,Total\n`;

    // Add rows for each barangay
    legazpiBarangays.forEach((barangay) => {
      if (demographicData.deathsByDemographic[barangay]) {
        const data = demographicData.deathsByDemographic[barangay];

        // Male row
        csv += `${barangay},Male,`;
        csv += `${data.male.lessThan1Year || ""},`;
        csv += `${data.male.oneToFourYears || ""},`;
        csv += `${data.male.fiveToFourteenYears || ""},`;
        csv += `${data.male.fifteenToFortyNineYears || ""},`;
        csv += `${data.male.fiftyToSixtyFourYears || ""},`;
        csv += `${data.male.sixtyFiveAndAbove || ""},`;
        csv += `${data.male.total || ""}\n`;

        // Female row
        csv += `${barangay},Female,`;
        csv += `${data.female.lessThan1Year || ""},`;
        csv += `${data.female.oneToFourYears || ""},`;
        csv += `${data.female.fiveToFourteenYears || ""},`;
        csv += `${data.female.fifteenToFortyNineYears || ""},`;
        csv += `${data.female.fiftyToSixtyFourYears || ""},`;
        csv += `${data.female.sixtyFiveAndAbove || ""},`;
        csv += `${data.female.total || ""}\n`;
      } else {
        // Empty rows for barangay with no data
        csv += `${barangay},Male,,,,,,,\n`;
        csv += `${barangay},Female,,,,,,,\n`;
      }
    });

    // Add total rows
    csv += `TOTAL,Male,`;
    csv += `${demographicData.totalsByDemographic.male.lessThan1Year || ""},`;
    csv += `${demographicData.totalsByDemographic.male.oneToFourYears || ""},`;
    csv += `${
      demographicData.totalsByDemographic.male.fiveToFourteenYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.fifteenToFortyNineYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.fiftyToSixtyFourYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.sixtyFiveAndAbove || ""
    },`;
    csv += `${demographicData.totalsByDemographic.male.total || ""}\n`;

    csv += `TOTAL,Female,`;
    csv += `${demographicData.totalsByDemographic.female.lessThan1Year || ""},`;
    csv += `${
      demographicData.totalsByDemographic.female.oneToFourYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.female.fiveToFourteenYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.female.fifteenToFortyNineYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.female.fiftyToSixtyFourYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.female.sixtyFiveAndAbove || ""
    },`;
    csv += `${demographicData.totalsByDemographic.female.total || ""}\n`;

    csv += `GRAND TOTAL,,`;
    csv += `${
      demographicData.totalsByDemographic.male.lessThan1Year +
        demographicData.totalsByDemographic.female.lessThan1Year || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.oneToFourYears +
        demographicData.totalsByDemographic.female.oneToFourYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.fiveToFourteenYears +
        demographicData.totalsByDemographic.female.fiveToFourteenYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.fifteenToFortyNineYears +
        demographicData.totalsByDemographic.female.fifteenToFortyNineYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.fiftyToSixtyFourYears +
        demographicData.totalsByDemographic.female.fiftyToSixtyFourYears || ""
    },`;
    csv += `${
      demographicData.totalsByDemographic.male.sixtyFiveAndAbove +
        demographicData.totalsByDemographic.female.sixtyFiveAndAbove || ""
    },`;
    csv += `${demographicData.totalsByDemographic.grandTotal || ""}\n`;

    // Download the CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deaths_by_demographic_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
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
      {/* main component */}
      <div className="flex-1 overflow-y-auto">
        <DeathsByDemographicInterface year={year} />
      </div>
    </div>
  );
}
