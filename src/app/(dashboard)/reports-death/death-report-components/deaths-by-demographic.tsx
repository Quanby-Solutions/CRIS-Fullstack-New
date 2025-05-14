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
import { legazpiData } from "@/lib/utils/barangay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

interface DeathsByDemographicProps {
  year: number;
}

interface AgeGenderCount {
  male: {
    lessThan1Year: number;
    oneToFourYears: number;
    fiveToFourteenYears: number;
    fifteenToFortyNineYears: number;
    fiftyToSixtyFourYears: number;
    sixtyFiveAndAbove: number;
    total: number;
  };
  female: {
    lessThan1Year: number;
    oneToFourYears: number;
    fiveToFourteenYears: number;
    fifteenToFortyNineYears: number;
    fiftyToSixtyFourYears: number;
    sixtyFiveAndAbove: number;
    total: number;
  };
  grandTotal: number;
}

interface DeathsByDemographicData {
  deathsByDemographic: Record<string, AgeGenderCount>;
  totalsByDemographic: AgeGenderCount;
  monthlyData: Record<string, Record<string, AgeGenderCount>>;
  totalsByMonth: Record<string, AgeGenderCount>;
  year: number;
}

const DeathsByDemographicInterface = ({ year }: DeathsByDemographicProps) => {
  // State management
  const [data, setData] = useState<DeathsByDemographicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"byBarangay" | "byMonth">(
    "byBarangay"
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Fetch data function
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/death-report/deaths-by-demographic?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const demographicData: DeathsByDemographicData = await response.json();
      console.log("Deaths by demographic data:", demographicData); // Log for debugging
      setData(demographicData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching deaths by demographic:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when year changes
  useEffect(() => {
    fetchData(year);
  }, [year]);

  // Get sorted list of barangays
  const getSortedBarangays = (): string[] => {
    if (!data) return [];

    // Get Legazpi barangays in their defined order
    const legazpiBarangays = legazpiData["LEGAZPI CITY"].barangay_list;

    // Get all barangays from the data
    const dataBarangays = Object.keys(data.deathsByDemographic);

    // Filter out special categories
    const specialCategories = [
      "Outside Legazpi (Philippines)",
      "Foreign Countries",
      "Outside Legazpi",
      "Unknown",
    ];

    // Sort Legazpi barangays first, then special categories
    return [
      ...legazpiBarangays.filter((b) => dataBarangays.includes(b)),
      ...specialCategories.filter((c) => dataBarangays.includes(c)),
    ];
  };

  // Helper to determine if a row should be displayed (has at least one non-zero value)
  const shouldDisplayRow = (barangay: string): boolean => {
    if (!data) return false;

    if (displayMode === "byBarangay") {
      return data.deathsByDemographic[barangay]?.grandTotal > 0;
    } else {
      // By month mode
      const monthStr = selectedMonth.toString();
      return data.monthlyData[monthStr]?.[barangay]?.grandTotal > 0;
    }
  };

  // Format month name
  const formatMonth = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString("default", {
      month: "long",
    });
  };

  // Get data for the current view mode
  const getCurrentData = (barangay: string) => {
    if (!data) return null;

    if (displayMode === "byBarangay") {
      return data.deathsByDemographic[barangay];
    } else {
      const monthStr = selectedMonth.toString();
      return data.monthlyData[monthStr]?.[barangay];
    }
  };

  // Get totals for the current view mode
  const getCurrentTotals = () => {
    if (!data) return null;

    if (displayMode === "byBarangay") {
      return data.totalsByDemographic;
    } else {
      const monthStr = selectedMonth.toString();
      return data.totalsByMonth[monthStr];
    }
  };

  return (
    <>
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
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>
                  Number of Deaths by Barangays, Age Group and Gender -{" "}
                  {data?.year || year}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={
                      displayMode === "byBarangay" ? "default" : "outline"
                    }
                    onClick={() => setDisplayMode("byBarangay")}
                    size="sm"
                  >
                    By Barangay
                  </Button>
                  <Button
                    variant={displayMode === "byMonth" ? "default" : "outline"}
                    onClick={() => setDisplayMode("byMonth")}
                    size="sm"
                  >
                    By Month
                  </Button>
                </div>
              </div>
            </CardHeader>

            {displayMode === "byMonth" && (
              <div className="px-6 pt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm font-medium">Select Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="rounded border border-gray-300 px-2 py-1"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {formatMonth(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <CardContent>
              <div className="overflow-x-auto">
                <Table className="border-collapse border border-gray-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        rowSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center align-middle"
                      >
                        Name of Barangay
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        &lt;1
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        1-4
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        5-14
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        15-49
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        50-64
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        65 ABOVE
                      </TableHead>
                      <TableHead
                        colSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center"
                      >
                        TOTAL
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className="border border-gray-200 bg-yellow-100 font-bold text-center align-middle"
                      >
                        GRAND TOTAL
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      {/* M/F headers for each age group */}
                      {Array(7)
                        .fill(0)
                        .map((_, i) => (
                          <React.Fragment key={`header-group-${i}`}>
                            <TableHead className="border border-gray-200 bg-yellow-100 font-bold text-center">
                              M
                            </TableHead>
                            <TableHead className="border border-gray-200 bg-yellow-100 font-bold text-center">
                              F
                            </TableHead>
                          </React.Fragment>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Barangay rows */}
                    {data &&
                      getSortedBarangays()
                        .filter((barangay) => shouldDisplayRow(barangay))
                        .map((barangay) => {
                          const barangayData = getCurrentData(barangay);
                          if (!barangayData) return null;

                          return (
                            <TableRow key={barangay}>
                              <TableCell className="border border-gray-200 font-medium">
                                {barangay}
                              </TableCell>
                              {/* Less than 1 year */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.lessThan1Year || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.lessThan1Year || ""}
                              </TableCell>
                              {/* 1-4 years */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.oneToFourYears || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.oneToFourYears || ""}
                              </TableCell>
                              {/* 5-14 years */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.fiveToFourteenYears || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.fiveToFourteenYears || ""}
                              </TableCell>
                              {/* 15-49 years */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.fifteenToFortyNineYears ||
                                  ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.fifteenToFortyNineYears ||
                                  ""}
                              </TableCell>
                              {/* 50-64 years */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.fiftyToSixtyFourYears || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.fiftyToSixtyFourYears ||
                                  ""}
                              </TableCell>
                              {/* 65+ years */}
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.male.sixtyFiveAndAbove || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center">
                                {barangayData.female.sixtyFiveAndAbove || ""}
                              </TableCell>
                              {/* Total */}
                              <TableCell className="border border-gray-200 text-center font-semibold">
                                {barangayData.male.total || ""}
                              </TableCell>
                              <TableCell className="border border-gray-200 text-center font-semibold">
                                {barangayData.female.total || ""}
                              </TableCell>
                              {/* Grand Total */}
                              <TableCell className="border border-gray-200 text-center font-bold">
                                {barangayData.grandTotal || ""}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                    {/* Totals row */}
                    {data && (
                      <TableRow className="bg-gray-100">
                        <TableCell className="border border-gray-200 font-bold">
                          TOTAL
                        </TableCell>
                        {/* Less than 1 year */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.lessThan1Year || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.lessThan1Year || ""}
                        </TableCell>
                        {/* 1-4 years */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.oneToFourYears || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.oneToFourYears || ""}
                        </TableCell>
                        {/* 5-14 years */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.fiveToFourteenYears || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.fiveToFourteenYears || ""}
                        </TableCell>
                        {/* 15-49 years */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.fifteenToFortyNineYears ||
                            ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.fifteenToFortyNineYears ||
                            ""}
                        </TableCell>
                        {/* 50-64 years */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.fiftyToSixtyFourYears || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.fiftyToSixtyFourYears ||
                            ""}
                        </TableCell>
                        {/* 65+ years */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.sixtyFiveAndAbove || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.sixtyFiveAndAbove || ""}
                        </TableCell>
                        {/* Total */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.male.total || ""}
                        </TableCell>
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.female.total || ""}
                        </TableCell>
                        {/* Grand Total */}
                        <TableCell className="border border-gray-200 text-center font-bold">
                          {getCurrentTotals()?.grandTotal || ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default DeathsByDemographicInterface;
