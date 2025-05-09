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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { legazpiData } from "@/lib/utils/barangay";

// Define types for our API response
interface DeathReportData {
  totalDeaths: number;
  deathsByBarangay: Record<string, number>;
  deathsByMonthAndBarangay: Record<string, Record<string, number>>;
  year: number;
}

// Define types for outside Legazpi data
interface OutsideLegazpiData {
  totalDeaths: number;
  deathsByResidenceType: {
    legazpi: number;
    outsideLegazpiPhilippines: number;
    foreignCountries: number;
    outsideLegazpi: number; // For backward compatibility
  };
  deathsByResidenceTypeMonthly: Record<
    string,
    {
      legazpi: number;
      outsideLegazpiPhilippines: number;
      foreignCountries: number;
    }
  >;
  year: number;
}

// Old API format interface for type safety
interface OldOutsideLegazpiData {
  totalDeaths: number;
  deathsByResidenceType: {
    legazpi: number;
    outsideLegazpi: number;
  };
  deathsByResidenceTypeMonthly: Record<
    string,
    {
      legazpi: number;
      outsideLegazpi: number;
    }
  >;
  year: number;
}

interface ForeignResidentsData {
  totalDeaths: number;
  deathsByNationality: {
    philippines: number;
    foreignCountries: number;
  };
  deathsByNationalityMonthly: Record<
    string,
    {
      philippines: number;
      foreignCountries: number;
    }
  >;
  foreignCountryCounts: Record<string, number>;
  year: number;
}

export interface DeathReportInterfaceProps {
  year: number;
}

const DeathReportInterface = ({ year }: DeathReportInterfaceProps) => {
  // State management
  const [data, setData] = useState<DeathReportData | null>(null);
  const [outsideData, setOutsideData] = useState<
    OutsideLegazpiData | OldOutsideLegazpiData | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(true); // Toggle showing all barangays
  const [yearState, setYear] = useState<number>(year);

  // List of all barangays in Legazpi
  const barangays = legazpiData["LEGAZPI CITY"].barangay_list;
  const [foreignData, setForeignData] = useState<ForeignResidentsData | null>(
    null
  );

  // Type guard to check if we have the new API format
  const isNewApiFormat = (
    data: OutsideLegazpiData | OldOutsideLegazpiData
  ): data is OutsideLegazpiData => {
    return "outsideLegazpiPhilippines" in data.deathsByResidenceType;
  };

  // Type guard to check if we have the old API format
  const isOldApiFormat = (
    data: OutsideLegazpiData | OldOutsideLegazpiData
  ): data is OldOutsideLegazpiData => {
    return (
      !("outsideLegazpiPhilippines" in data.deathsByResidenceType) &&
      "outsideLegazpi" in data.deathsByResidenceType
    );
  };

  // Fetch data function
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all datasets in parallel
      const [reportResponse, outsideResponse, foreignResponse] =
        await Promise.all([
          fetch(`/api/death-report?year=${selectedYear}`),
          fetch(`/api/death-report/outside-legazpi?year=${selectedYear}`),
          fetch(`/api/death-report/foreign-residents?year=${selectedYear}`),
        ]);

      if (!reportResponse.ok) {
        throw new Error(`Error fetching data: ${reportResponse.statusText}`);
      }

      if (!outsideResponse.ok) {
        throw new Error(
          `Error fetching outside data: ${outsideResponse.statusText}`
        );
      }

      if (!foreignResponse.ok) {
        throw new Error(
          `Error fetching foreign data: ${foreignResponse.statusText}`
        );
      }

      const reportData: DeathReportData = await reportResponse.json();
      const outsideReportData = await outsideResponse.json();
      const foreignReportData: ForeignResidentsData =
        await foreignResponse.json();

      setData(reportData);
      setOutsideData(outsideReportData);
      setForeignData(foreignReportData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching death reports:", err);
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
    setYear(parseInt(value, 10));
  };

  // Get death count for a specific barangay
  const getBarangayDeathCount = (barangay: string): number => {
    if (!data) return 0;

    // Check for exact match only
    return data.deathsByBarangay[barangay] || 0;
  };

  // Get death count for a specific barangay in a specific month
  const getMonthlyBarangayDeathCount = (
    barangay: string,
    month: number
  ): number => {
    if (!data || !data.deathsByMonthAndBarangay[month.toString()]) return 0;

    const monthData = data.deathsByMonthAndBarangay[month.toString()];

    // Check for exact match only
    return monthData[barangay] || 0;
  };

  // Format month for display
  const formatMonth = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString("default", {
      month: "short",
    });
  };

  // Generate year options for dropdown (current year - 5 years)
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  // Prepare monthly barangay data for the table
  const prepareMonthlyBarangayData = () => {
    // Create array for barangay data
    const specialCategories = [];
    const regularBarangays: {
      name: string;
      monthlyData: number[];
      totalCount: number;
      isSpecial: boolean;
    }[] = [];

    // Add "Outside Legazpi (Philippines)" if we have that data
    if (outsideData && isNewApiFormat(outsideData)) {
      // Add Philippines (non-Legazpi) category
      const outsidePhTotal =
        outsideData.deathsByResidenceType.outsideLegazpiPhilippines;
      const outsidePhMonthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString();
        return (
          outsideData.deathsByResidenceTypeMonthly[month]
            ?.outsideLegazpiPhilippines || 0
        );
      });

      specialCategories.push({
        name: "Outside Legazpi (Philippines)",
        monthlyData: outsidePhMonthlyData,
        totalCount: outsidePhTotal,
        isSpecial: true,
        order: 1,
      });

      // Add Foreign Countries category right after Outside Legazpi
      const foreignTotal = outsideData.deathsByResidenceType.foreignCountries;
      const foreignMonthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString();
        return (
          outsideData.deathsByResidenceTypeMonthly[month]?.foreignCountries || 0
        );
      });

      specialCategories.push({
        name: "Outside Country",
        monthlyData: foreignMonthlyData,
        totalCount: foreignTotal,
        isSpecial: true,
        order: 2,
      });
    } else if (outsideData && isOldApiFormat(outsideData)) {
      // Fallback to the old API format
      const outsideTotal = outsideData.deathsByResidenceType.outsideLegazpi;
      const outsideMonthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString();
        return (
          (outsideData.deathsByResidenceTypeMonthly[month] as any)
            ?.outsideLegazpi || 0
        );
      });

      specialCategories.push({
        name: "Outside Legazpi",
        monthlyData: outsideMonthlyData,
        totalCount: outsideTotal,
        isSpecial: true,
        order: 1,
      });
    }

    // Now add all Legazpi barangays
    barangays.forEach((barangay) => {
      const totalCount = getBarangayDeathCount(barangay);
      const monthlyData = Array.from({ length: 12 }, (_, i) =>
        getMonthlyBarangayDeathCount(barangay, i + 1)
      );

      regularBarangays.push({
        name: barangay,
        monthlyData,
        totalCount,
        isSpecial: false,
      });
    });

    // Sort special categories by order
    specialCategories.sort((a, b) => a.order - b.order);

    // Sort regular barangays alphabetically by name
    regularBarangays.sort((a, b) => a.name.localeCompare(b.name));

    // Combine special categories and regular barangays
    const combinedData = [...specialCategories, ...regularBarangays];

    // Filter out zero counts if not showing all
    return showAll
      ? combinedData
      : combinedData.filter((item) => item.totalCount > 0);
  };

  // Calculate grand total including both Legazpi and outside
  const calculateGrandTotal = () => {
    const legazpiTotal = data?.totalDeaths || 0;

    // Calculate total deaths
    if (outsideData) {
      if (isNewApiFormat(outsideData)) {
        // For the new API format
        return legazpiTotal;
      } else if (isOldApiFormat(outsideData)) {
        // For the old API format
        const outsideTotal =
          outsideData.deathsByResidenceType.outsideLegazpi || 0;
        return legazpiTotal + outsideTotal;
      }
    }

    return legazpiTotal;
  };

  return (
    <div className=" p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Monthly Death Statistics by Barangay - {data?.year || year}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAll"
                    checked={showAll}
                    onChange={() => setShowAll(!showAll)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="showAll"
                    className="text-sm font-medium text-gray-700"
                  >
                    Show All Barangays
                  </label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barangay</TableHead>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i} className="text-center">
                          {formatMonth(i + 1)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prepareMonthlyBarangayData().map(
                      ({ name, monthlyData, totalCount, isSpecial }) => (
                        <TableRow
                          key={name}
                          className={
                            name === "Outside Legazpi" ||
                            name === "Outside Legazpi (Philippines)"
                              ? "bg-gray-50"
                              : name === "Outside Country"
                              ? "bg-gray-100"
                              : ""
                          }
                        >
                          <TableCell
                            className={isSpecial ? "font-semibold" : ""}
                          >
                            {name}
                          </TableCell>
                          {monthlyData.map((count, i) => (
                            <TableCell key={i} className="text-center">
                              {count || "-"}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-medium">
                            {totalCount}
                          </TableCell>
                        </TableRow>
                      )
                    )}

                    {/* Total row */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        // Sum all barangays plus outside
                        let monthTotal = 0;

                        // Add Legazpi barangays
                        if (data?.deathsByMonthAndBarangay[month.toString()]) {
                          Object.values(
                            data.deathsByMonthAndBarangay[month.toString()]
                          ).forEach((count) => {
                            monthTotal += count;
                          });
                        }

                        // Add outside Legazpi and foreign countries if available
                        if (
                          outsideData?.deathsByResidenceTypeMonthly[
                            month.toString()
                          ]
                        ) {
                          if (isNewApiFormat(outsideData)) {
                            // New API format
                            monthTotal +=
                              outsideData.deathsByResidenceTypeMonthly[
                                month.toString()
                              ].outsideLegazpiPhilippines || 0;
                            monthTotal +=
                              outsideData.deathsByResidenceTypeMonthly[
                                month.toString()
                              ].foreignCountries || 0;
                          } else if (isOldApiFormat(outsideData)) {
                            // Old API format
                            monthTotal +=
                              (
                                outsideData.deathsByResidenceTypeMonthly[
                                  month.toString()
                                ] as any
                              ).outsideLegazpi || 0;
                          }
                        }

                        return (
                          <TableCell key={i} className="text-center font-bold">
                            {monthTotal || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">
                        {calculateGrandTotal()}
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

export default DeathReportInterface;
