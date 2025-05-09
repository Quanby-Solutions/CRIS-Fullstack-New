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
import { DeathReportInterfaceProps } from "./interface-death";

// Define types for our API response
interface PlaceOfDeathData {
  totalDeaths: number;
  deathsByPlaceOfDeath: {
    hospital: number;
    transient: number;
    others: number;
  };
  deathsByPlaceOfDeathMonthly: Record<
    string,
    {
      hospital: number;
      transient: number;
      others: number;
    }
  >;
  year: number;
}

const PlaceOfDeathInterface = ({ year }: DeathReportInterfaceProps) => {
  // State management
  const [yearState, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<PlaceOfDeathData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/death-report/place-of-death?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const reportData: PlaceOfDeathData = await response.json();
      setData(reportData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching place of death reports:", err);
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

  // Calculate totals
  const calculateTotals = () => {
    if (!data) return { hospital: 0, transient: 0, others: 0, total: 0 };

    const { hospital, transient, others } = data.deathsByPlaceOfDeath;
    return {
      hospital,
      transient,
      others,
      total: hospital + transient + others,
    };
  };

  return (
    <div className="p-6">
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
                Monthly Place of Death Statistics - {data?.year || year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Place of Death</TableHead>
                      {Array.from({ length: 12 }, (_, i) => (
                        <TableHead key={i} className="text-center">
                          {formatMonth(i + 1)}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Hospital row */}
                    <TableRow>
                      <TableCell className="font-medium">Hospital</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const count =
                          data?.deathsByPlaceOfDeathMonthly[month.toString()]
                            ?.hospital || 0;
                        return (
                          <TableCell key={i} className="text-center">
                            {count || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">
                        {data?.deathsByPlaceOfDeath.hospital || 0}
                      </TableCell>
                    </TableRow>

                    {/* Transient row */}
                    <TableRow>
                      <TableCell className="font-medium">Transient</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const count =
                          data?.deathsByPlaceOfDeathMonthly[month.toString()]
                            ?.transient || 0;
                        return (
                          <TableCell key={i} className="text-center">
                            {count || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">
                        {data?.deathsByPlaceOfDeath.transient || 0}
                      </TableCell>
                    </TableRow>

                    {/* Others row */}
                    <TableRow>
                      <TableCell className="font-medium">Others</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const count =
                          data?.deathsByPlaceOfDeathMonthly[month.toString()]
                            ?.others || 0;
                        return (
                          <TableCell key={i} className="text-center">
                            {count || "-"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">
                        {data?.deathsByPlaceOfDeath.others || 0}
                      </TableCell>
                    </TableRow>

                    {/* Total row */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthData = data?.deathsByPlaceOfDeathMonthly[
                          month.toString()
                        ] || {
                          hospital: 0,
                          transient: 0,
                          others: 0,
                        };
                        const monthTotal =
                          monthData.hospital +
                          monthData.transient +
                          monthData.others;
                        return (
                          <TableCell key={i} className="text-center font-bold">
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

export default PlaceOfDeathInterface;
