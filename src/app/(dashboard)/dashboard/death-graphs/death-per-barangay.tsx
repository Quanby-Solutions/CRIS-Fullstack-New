import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define TypeScript interfaces for our data
interface BarangayPercentage {
  barangay: string;
  percentage: number;
}

interface ApiResponse {
  totalDeathsInLegazpi: number;
  percentagesByBarangay: {
    [barangay: string]: number;
  };
  percentagesByMonth: {
    [month: string]: {
      [barangay: string]: number;
    };
  };
  visualizationData: BarangayPercentage[];
  year: number;
}

interface MonthOption {
  value: string;
  label: string;
}

// Custom colors for charts with good contrast
const colors = [
  "#3b82f6", // blue-500
  "#0d9488", // teal-600
  "#6366f1", // indigo-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
  "#0891b2", // cyan-600
  "#84cc16", // lime-500
  "#14b8a6", // teal-500
  "#8b5cf6", // violet-500
  "#f97316", // orange-500
  "#06b6d4", // cyan-500
  "#a855f7", // purple-500
];

const BarangayDeathReport: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Function to fetch data from our API
  const fetchData = async (selectedYear: number): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/death-report/graph/bar-per-death?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result: ApiResponse = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  // Fetch data when the component mounts or year changes
  useEffect(() => {
    fetchData(year);
  }, [year]);

  // Prepare data for visualization based on selected month
  const getVisualizationData = (): BarangayPercentage[] => {
    if (!data) return [];

    let sortedData: BarangayPercentage[] = [];

    if (selectedMonth === "all") {
      // Use overall percentages for all months
      sortedData = [...data.visualizationData];
    } else {
      // Use percentages for the selected month
      const monthData = data.percentagesByMonth[selectedMonth];
      if (monthData) {
        sortedData = Object.entries(monthData)
          .filter(([_, percentage]) => percentage > 0)
          .map(([barangay, percentage]) => ({
            barangay,
            percentage,
          }))
          .sort((a, b) => b.percentage - a.percentage);
      }
    }

    return sortedData;
  };

  // Generate years for the dropdown (5 years back from current)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Month names for the dropdown
  const months: MonthOption[] = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const visualizationData = getVisualizationData();
  const maxPercentage =
    visualizationData.length > 0
      ? Math.max(...visualizationData.map((item) => item.percentage))
      : 0.1;

  // Get total deaths count based on selected view
  const getTotalDeathsCount = (): number | string => {
    if (!data) return 0;

    if (selectedMonth === "all") {
      return data.totalDeathsInLegazpi;
    } else {
      // Calculate total deaths for the selected month
      const monthData = data.percentagesByMonth[selectedMonth];
      if (!monthData) return 0;

      // Since we have percentages, we need to estimate the total
      // Let's find a barangay with data in both views to use as a reference
      for (const barangay of data.visualizationData.map((d) => d.barangay)) {
        if (monthData[barangay] && data.percentagesByBarangay[barangay]) {
          const overallCount =
            (data.percentagesByBarangay[barangay] / 100) *
            data.totalDeathsInLegazpi;
          const monthPercentage = monthData[barangay];
          // Estimate total month deaths using this barangay as reference
          return Math.round(overallCount / (monthPercentage / 100));
        }
      }

      // Fallback: just say "N/A" if we can't calculate
      return "N/A";
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-2xl font-bold">
            Percentage Distribution of Registered Deaths
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedMonth}
              onValueChange={(value: string) => setSelectedMonth(value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(value: string) => setYear(parseInt(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          by Barangay of Usual Residence, Legazpi City:{" "}
          {selectedMonth !== "all"
            ? `${months.find((m) => m.value === selectedMonth)?.label} ${year}`
            : year}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          // Show loading skeletons while fetching data
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !data || visualizationData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No death records found for{" "}
            {selectedMonth !== "all"
              ? `${
                  months.find((m) => m.value === selectedMonth)?.label
                } ${year}`
              : year}
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {visualizationData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-40 text-sm font-medium text-right truncate"
                  title={item.barangay}
                >
                  {item.barangay}
                </div>
                <div className="flex-1 relative h-6 bg-gray-100 rounded">
                  <div
                    className="absolute top-0 left-0 h-full rounded transition-all duration-500 ease-in-out"
                    style={{
                      width: `${Math.max(
                        (item.percentage / maxPercentage) * 100,
                        1
                      )}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-medium text-right">
                  {item.percentage.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-gray-500 pt-2 flex flex-col items-start">
        <div>Source: Legazpi City Civil Registry Data</div>
        <div>
          Total Deaths:{" "}
          {loading ? (
            <Skeleton className="h-3 w-10 inline-block" />
          ) : (
            getTotalDeathsCount()
          )}
          {selectedMonth !== "all" && " (estimated)"}
        </div>
        <div className="mt-1">
          Note: Figures are results of actual registration without any
          adjustment for under-registration
        </div>
      </CardFooter>
    </Card>
  );
};

export default BarangayDeathReport;
