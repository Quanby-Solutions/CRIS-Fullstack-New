"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DeathReportInterfaceProps } from "./interface-death";

// Define interfaces for the enhanced statistics API response
type AgeGroupKey =
  | "lessThan1Year"
  | "oneToFourYears"
  | "fiveToFourteenYears"
  | "fifteenToFortyNineYears"
  | "fiftyToSixtyFourYears"
  | "sixtyFiveAndAbove"
  | "unknown";

interface AgeGroups {
  lessThan1Year: number;
  oneToFourYears: number;
  fiveToFourteenYears: number;
  fifteenToFortyNineYears: number;
  fiftyToSixtyFourYears: number;
  sixtyFiveAndAbove: number;
  unknown: number;
}

interface PlaceOfDeathStats {
  hospital: number;
  barangay: number;
  transient: number;
}

interface DisposalStats {
  burial: number;
  cremation: number;
}

interface TransferPermitStats {
  withTransferPermit: number;
  withoutTransferPermit: number;
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
  ageGroups: AgeGroups;
  placeOfDeath: PlaceOfDeathStats;
  disposal: DisposalStats;
  transferPermit: TransferPermitStats;
  totalDocRegistered: number;
}

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
  ageGroups: AgeGroups;
  placeOfDeath: PlaceOfDeathStats;
  disposal: DisposalStats;
  transferPermit: TransferPermitStats;
  totalDocRegistered: number;
  monthly: Record<string, MonthlyStatistics>;
}

interface DeathStatisticsData {
  statistics: Statistics;
  year: number;
  debug?: any;
}

export interface DeathStatisticsInterfaceProps {
  year?: number;
}

// Type for category data
interface Category {
  key: string;
  label: string;
  section: keyof MonthlyStatistics;
  field: string;
}

const DeathStatisticsInterface = ({ year }: DeathReportInterfaceProps) => {
  // State management
  const [data, setData] = useState<DeathStatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYear] = useState<number>(year);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Fetch data function
  const fetchData = async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/death-report/new?year=${year}`);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const statsData: DeathStatisticsData = await response.json();
      console.log("Fetched statistics data:", statsData);
      setData(statsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching death statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when year changes
  useEffect(() => {
    fetchData(year);
  }, [year]);

  // Handler for year selection
  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value, 10));
  };

  // Generate year options for dropdown (current year - 5 years)
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  // Format month for display
  const formatMonth = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString("default", {
      month: "short",
    });
  };

  // Define the categories for the statistics table
  const categories: Category[] = [
    // Fetal Death row - this would need to be calculated separately if needed
    // Registration timing
    {
      key: "onTimeRegistration",
      label: "On-Time",
      section: "registration",
      field: "onTime",
    },
    {
      key: "lateRegistration",
      label: "Late",
      section: "registration",
      field: "late",
    },
    // Gender
    { key: "male", label: "Male", section: "gender", field: "male" },
    { key: "female", label: "Female", section: "gender", field: "female" },
    // Age groups
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
    // Place of death
    {
      key: "hospital",
      label: "Hospital",
      section: "placeOfDeath",
      field: "hospital",
    },
    {
      key: "barangay",
      label: "Barangay",
      section: "placeOfDeath",
      field: "barangay",
    },
    {
      key: "transient",
      label: "Transient",
      section: "placeOfDeath",
      field: "transient",
    },
    // Disposal method
    {
      key: "burial",
      label: "Burial",
      section: "disposal",
      field: "burial",
    },
    {
      key: "cremation",
      label: "Cremation",
      section: "disposal",
      field: "cremation",
    },
    // Transfer permit
    {
      key: "withTransferPermit",
      label: "W/ Transfer Permit",
      section: "transferPermit",
      field: "withTransferPermit",
    },
    {
      key: "withoutTransferPermit",
      label: "W/O Transfer Permit",
      section: "transferPermit",
      field: "withoutTransferPermit",
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
      return (sectionData as { male: number; female: number; unknown: number })
        .unknown;
    }

    if (section === "ageGroups") {
      return (sectionData as AgeGroups)[field as keyof AgeGroups] || 0;
    }

    if (section === "placeOfDeath") {
      return (
        (sectionData as PlaceOfDeathStats)[field as keyof PlaceOfDeathStats] ||
        0
      );
    }

    if (section === "disposal") {
      return (sectionData as DisposalStats)[field as keyof DisposalStats] || 0;
    }

    if (section === "transferPermit") {
      return (
        (sectionData as TransferPermitStats)[
          field as keyof TransferPermitStats
        ] || 0
      );
    }

    return 0;
  };

  return (
    <div className="space-y-6 mt-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className=" border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <>
          {/* Debug information */}
          {showDebug && data?.debug && (
            <div className=" p-4 rounded-md mb-4 text-xs">
              <h3 className="font-bold mb-2">Debug Information</h3>
              <p>Total Records: {data.debug.totalRecords}</p>
              <div className="mt-2">
                <h4 className="font-semibold">Records By Month:</h4>
                <pre>{JSON.stringify(data.debug.recordsByMonth, null, 2)}</pre>
              </div>
              <div className="mt-2">
                <h4 className="font-semibold">Monthly Statistics:</h4>
                <pre>{JSON.stringify(data.debug.monthlyStats, null, 2)}</pre>
              </div>
              {data.debug.recordDetails && (
                <div className="mt-2">
                  <h4 className="font-semibold">Record Details (first 10):</h4>
                  <pre>{JSON.stringify(data.debug.recordDetails, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Death Statistics by Month - {data?.year || year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Particulars</TableHead>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i} className="text-center">
                          {formatMonth(i + 1)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Fetal Death row - placeholder for now */}
                    <TableRow>
                      <TableCell className="font-medium">Fetal Death</TableCell>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableCell key={i} className="text-center">
                          -
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">
                        -
                      </TableCell>
                    </TableRow>

                    {categories.map((category) => (
                      <TableRow key={category.key}>
                        <TableCell className="font-medium">
                          {category.label}
                        </TableCell>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          const monthKey = month.toString();

                          // Check if we have data for this month
                          const hasMonthData =
                            data?.statistics?.monthly?.[monthKey];

                          // Get the monthly value for this category using our safe function
                          const monthlyValue = hasMonthData
                            ? getSectionValue(
                                data.statistics.monthly[monthKey],
                                category.section,
                                category.field
                              )
                            : 0;

                          // Debugging trick: Special styling for zero values that should have data
                          const shouldHaveData =
                            hasMonthData &&
                            data.debug?.recordsByMonth?.[monthKey] > 0;

                          const cellStyle = {
                            backgroundColor:
                              shouldHaveData && monthlyValue === 0
                                ? ""
                                : undefined,
                          };

                          return (
                            <TableCell
                              key={i}
                              className="text-center"
                              style={cellStyle}
                            >
                              {monthlyValue || "-"}
                            </TableCell>
                          );
                        })}

                        {/* Total column */}
                        <TableCell className="text-center font-medium">
                          {data?.statistics
                            ? getSectionValue(
                                data.statistics,
                                category.section,
                                category.field
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total Documents Registered row */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">
                        Total Doc. Registered
                      </TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthKey = month.toString();

                        // Get total documents registered for the month
                        const monthTotal =
                          data?.statistics?.monthly?.[monthKey]
                            ?.totalDocRegistered || 0;

                        return (
                          <TableCell key={i} className="text-center font-bold">
                            {monthTotal || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">
                        {data?.statistics?.totalDocRegistered || 0}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DeathStatisticsInterface;
