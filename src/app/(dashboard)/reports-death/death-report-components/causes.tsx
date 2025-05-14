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

// Define types for our API response
interface CausesOfDeathData {
  totalDeaths: number;
  causeCounts: Record<string, number>;
  monthlyData: Record<string, Record<string, number>>;
  year: number;
  causeCategories: string[];
}

const CausesOfDeathInterface = ({ year }: DeathReportInterfaceProps) => {
  // State management
  const [data, setData] = useState<CausesOfDeathData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"alphabetical" | "count">("count");

  // Fetch data function
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/death-report/causes?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const causesData: CausesOfDeathData = await response.json();
      console.log("Causes of death data:", causesData); // Log for debugging
      setData(causesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching causes of death:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when year changes
  useEffect(() => {
    fetchData(year);
  }, [year]);

  // Format month for display
  const formatMonth = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString("default", {
      month: "short",
    });
  };

  // Get sorted causes
  const getSortedCauses = (): string[] => {
    if (!data) return [];

    const causes = Object.keys(data.causeCounts);

    if (sortBy === "alphabetical") {
      return causes.sort((a, b) => a.localeCompare(b));
    } else {
      return causes.sort((a, b) => data.causeCounts[b] - data.causeCounts[a]);
    }
  };

  // Get value for a specific cause and month
  const getCauseMonthValue = (cause: string, month: number): number => {
    if (!data || !data.monthlyData[month]) return 0;
    return data.monthlyData[month][cause] || 0;
  };

  // Calculate total for a month
  const getMonthTotal = (month: number): number => {
    if (!data || !data.monthlyData[month]) return 0;

    let total = 0;
    Object.values(data.monthlyData[month]).forEach((count) => {
      total += count;
    });
    return total;
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>
                Causes of Death by Month - {data?.year || year}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "alphabetical" | "count")
                  }
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="count">Count (Highest First)</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Causes of Death</TableHead>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i} className="text-center">
                          {formatMonth(i + 1)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Causes of death rows */}
                    {getSortedCauses().map((cause) => (
                      <TableRow key={cause}>
                        <TableCell>{cause}</TableCell>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          const value = getCauseMonthValue(cause, month);
                          return (
                            <TableCell key={month} className="text-center">
                              {value || "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium">
                          {data?.causeCounts[cause] || 0}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total row */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthTotal = getMonthTotal(month);
                        return (
                          <TableCell
                            key={month}
                            className="text-center font-bold"
                          >
                            {monthTotal || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">
                        {data?.totalDeaths || 0}
                      </TableCell>
                    </TableRow>
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

export default CausesOfDeathInterface;
