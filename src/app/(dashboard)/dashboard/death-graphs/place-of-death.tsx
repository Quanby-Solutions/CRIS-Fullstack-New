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
interface PlaceOfDeathData {
  hospital: number;
  transient: number;
  others: number;
}

interface ApiResponse {
  totalDeaths: number;
  deathsByPlaceOfDeath: PlaceOfDeathData;
  deathsByPlaceOfDeathMonthly: Record<string, PlaceOfDeathData>;
  year: number;
}

interface MonthOption {
  value: string;
  label: string;
}

// Colors for the pie chart segments
const colors = {
  hospital: "#3b82f6", // blue-500
  transient: "#10b981", // emerald-500
  others: "#8b5cf6", // violet-500
};

// Display names for the categories
const categoryLabels = {
  hospital: "Hospital",
  transient: "Transient",
  others: "Others",
};

const PlaceOfDeathPieChart: React.FC = () => {
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
        `/api/death-report/place-of-death?year=${selectedYear}`
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

  // Get the appropriate data based on selected month
  const getCurrentData = (): PlaceOfDeathData | null => {
    if (!data) return null;

    if (selectedMonth === "all") {
      return data.deathsByPlaceOfDeath;
    } else {
      return data.deathsByPlaceOfDeathMonthly[selectedMonth] || null;
    }
  };

  // Calculate percentages for pie chart
  const calculatePercentages = (
    placeOfDeathData: PlaceOfDeathData
  ): Record<keyof PlaceOfDeathData, number> => {
    const total =
      placeOfDeathData.hospital +
      placeOfDeathData.transient +
      placeOfDeathData.others;

    if (total === 0) return { hospital: 0, transient: 0, others: 0 };

    return {
      hospital: parseFloat(((placeOfDeathData.hospital / total) * 100).toFixed(1)),
      transient: parseFloat(((placeOfDeathData.transient / total) * 100).toFixed(1)),
      others: parseFloat(((placeOfDeathData.others / total) * 100).toFixed(1)),
    };
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

  // Get current data and total deaths
  const currentData = getCurrentData();
  const percentages = currentData ? calculatePercentages(currentData) : null;
  const totalDeaths = currentData
    ? currentData.hospital + currentData.transient + currentData.others
    : 0;

  // Render pie chart
  const renderPieChart = () => {
    if (!percentages) return null;

    // Determine which categories have data
    const categories = Object.keys(percentages).filter(
      (key) => percentages[key as keyof PlaceOfDeathData] > 0
    ) as Array<keyof PlaceOfDeathData>;

    // Generate pie chart segments
    let startAngle = 0;
    
    return (
      <div className="w-full flex flex-col items-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {categories.map((category) => {
              const percent = percentages[category];
              // Skip segments with 0%
              if (percent === 0) return null;
              
              const angle = (percent / 100) * 360;
              const endAngle = startAngle + angle;
              
              // Convert angles to radians for calculations
              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              
              // Calculate the SVG arc path
              const x1 = 50 + 50 * Math.cos(startAngleRad);
              const y1 = 50 + 50 * Math.sin(startAngleRad);
              const x2 = 50 + 50 * Math.cos(endAngleRad);
              const y2 = 50 + 50 * Math.sin(endAngleRad);
              
              // Determine if the arc should take the long way around
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              // Create the SVG path for the slice
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Store the end angle as the start for the next slice
              startAngle = endAngle;
              
              return (
                <g key={category} className="hover:opacity-90 transition-opacity cursor-pointer">
                  <path
                    d={path}
                    fill={colors[category]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  
                  {/* Add percentage label if segment is large enough */}
                  {percent >= 10 && (
                    <text
                      x={50 + 35 * Math.cos((startAngleRad + endAngleRad) / 2)}
                      y={50 + 35 * Math.sin((startAngleRad + endAngleRad) / 2)}
                      textAnchor="middle"
                      fontSize="5"
                      fill="white"
                      dominantBaseline="middle"
                    >
                      {percent}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-6 justify-center mt-4">
          {Object.keys(percentages).map((category) => {
            const typedCategory = category as keyof PlaceOfDeathData;
            const percent = percentages[typedCategory];
            const count = currentData ? currentData[typedCategory] : 0;
            
            return (
              <div key={category} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: colors[typedCategory] }}
                ></div>
                <span className="text-sm">
                  {categoryLabels[typedCategory]}: {percent}% ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-2xl font-bold">
            Distribution of Deaths by Place of Death
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
          Legazpi City:{" "}
          {selectedMonth !== "all"
            ? `${months.find((m) => m.value === selectedMonth)?.label} ${year}`
            : year}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          // Show loading skeleton while fetching data
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-64 w-64 rounded-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !data || !currentData || totalDeaths === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No death records found for{" "}
            {selectedMonth !== "all"
              ? `${months.find((m) => m.value === selectedMonth)?.label} ${year}`
              : year}
          </div>
        ) : (
          renderPieChart()
        )}
      </CardContent>

      <CardFooter className="text-xs text-gray-500 pt-2 flex flex-col items-start">
        <div>Source: Legazpi City Civil Registry Data</div>
        <div>
          Total Deaths:{" "}
          {loading ? (
            <Skeleton className="h-3 w-10 inline-block" />
          ) : (
            totalDeaths
          )}
        </div>
        <div className="mt-1">
          Note: Figures are results of actual registration without any
          adjustment for under-registration
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlaceOfDeathPieChart;