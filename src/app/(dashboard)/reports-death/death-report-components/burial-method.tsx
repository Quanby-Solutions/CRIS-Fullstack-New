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
interface BurialMethodData {
  totalDeaths: number;
  burialCounts: {
    legazpi: {
      publicCemetery: number;
      privateCemetery: number;
    };
    outsideLegazpi: {
      publicCemetery: number;
      privateCemetery: number;
    };
    cremation: number;
    withTransferPermit: number;
    withoutTransferPermit: number;
    notStated: number; // Only global Not Stated
  };
  burialCountsMonthly: Record<
    string,
    {
      legazpi: {
        publicCemetery: number;
        privateCemetery: number;
      };
      outsideLegazpi: {
        publicCemetery: number;
        privateCemetery: number;
      };
      cremation: number;
      withTransferPermit: number;
      withoutTransferPermit: number;
      notStated: number; // Only global Not Stated
    }
  >;
  year: number;
}

const BurialMethodInterface = ({ year }: DeathReportInterfaceProps) => {
  // State management
  const [yearState, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<BurialMethodData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/death-report/burial-method?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const burialData: BurialMethodData = await response.json();
      console.log("Burial method data:", burialData); // Log for debugging
      setData(burialData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching burial method reports:", err);
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

  // Calculate a total for each category
  const calculateTotals = () => {
    if (!data)
      return {
        burial: 0,
        cremation: 0,
        total: 0,
        withTransfer: 0,
        notStated: 0, // Added Not Stated
      };

    const burialInLegazpi =
      data.burialCounts.legazpi.publicCemetery +
      data.burialCounts.legazpi.privateCemetery;

    const burialOutsideLegazpi =
      data.burialCounts.outsideLegazpi.publicCemetery +
      data.burialCounts.outsideLegazpi.privateCemetery;

    const totalBurial = burialInLegazpi + burialOutsideLegazpi;
    const withTransfer = data.burialCounts.withTransferPermit;
    const notStated = data.burialCounts.notStated; // Global Not Stated

    // Include withTransferPermit and notStated in the grand total
    return {
      burial: totalBurial,
      cremation: data.burialCounts.cremation,
      total:
        totalBurial + data.burialCounts.cremation + withTransfer + notStated,
      withTransfer: withTransfer,
      notStated: notStated,
    };
  };

  // Calculate total for a specific month
  const calculateMonthTotal = (month: number): number => {
    if (!data) return 0;
    const monthData = data.burialCountsMonthly[month.toString()];
    if (!monthData) return 0;
    return (
      monthData.legazpi.publicCemetery +
      monthData.legazpi.privateCemetery +
      monthData.outsideLegazpi.publicCemetery +
      monthData.outsideLegazpi.privateCemetery +
      monthData.cremation +
      monthData.withTransferPermit + // Include Transfer Permit
      monthData.notStated // Include global Not Stated
    );
  };

  // Get data for a specific burial method and month
  const getMethodMonthData = (method: string, month: number): number => {
    if (!data) return 0;

    const monthStr = month.toString();
    const monthData = data.burialCountsMonthly[monthStr];

    if (!monthData) return 0;

    switch (method) {
      case "publicCemeteryLegazpi":
        return monthData.legazpi.publicCemetery;
      case "privateCemeteryLegazpi":
        return monthData.legazpi.privateCemetery;
      case "publicCemeteryOutside":
        return monthData.outsideLegazpi.publicCemetery;
      case "privateCemeteryOutside":
        return monthData.outsideLegazpi.privateCemetery;
      case "cremation":
        return monthData.cremation;
      case "withTransferPermit":
        return monthData.withTransferPermit;
      case "notStated": // Only global Not Stated
        return monthData.notStated;
      default:
        return 0;
    }
  };

  // Get annual total for a specific burial method
  const getMethodTotal = (method: string): number => {
    if (!data) return 0;

    switch (method) {
      case "publicCemeteryLegazpi":
        return data.burialCounts.legazpi.publicCemetery;
      case "privateCemeteryLegazpi":
        return data.burialCounts.legazpi.privateCemetery;
      case "publicCemeteryOutside":
        return data.burialCounts.outsideLegazpi.publicCemetery;
      case "privateCemeteryOutside":
        return data.burialCounts.outsideLegazpi.privateCemetery;
      case "cremation":
        return data.burialCounts.cremation;
      case "withTransferPermit":
        return data.burialCounts.withTransferPermit;
      case "notStated": // Only global Not Stated
        return data.burialCounts.notStated;
      default:
        return 0;
    }
  };

  // Define the burial methods for the table rows
  const burialMethods = [
    { id: "publicCemeteryLegazpi", label: "Public Cemetery (Legazpi)" },
    { id: "privateCemeteryLegazpi", label: "Private Cemetery (Legazpi)" },
    { id: "publicCemeteryOutside", label: "Public Cemetery (Outside)" },
    { id: "privateCemeteryOutside", label: "Private Cemetery (Outside)" },
    { id: "cremation", label: "Cremation" },
    { id: "withTransferPermit", label: "With Transfer Permit" },
    { id: "notStated", label: "Not Stated" }, // Just one global Not Stated
  ];

  return (
    <div className="space-y-6 p-6">
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
              <CardTitle>
                Monthly Burial Method Statistics - {data?.year || year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Burial Method</TableHead>
                      {/* Month columns */}
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i} className="text-center">
                          {formatMonth(i + 1)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Burial method rows */}
                    {burialMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell>{method.label}</TableCell>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          const value = getMethodMonthData(method.id, month);
                          return (
                            <TableCell key={month} className="text-center">
                              {value || "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-medium">
                          {getMethodTotal(method.id)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Total row */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthTotal = calculateMonthTotal(month);
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
                        {calculateTotals().total}
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

export default BurialMethodInterface;
