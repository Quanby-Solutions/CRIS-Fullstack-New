"use client";

import React, { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useReportsStore } from "../../report-birth/use-reports-store";

interface PlaceChartProps {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

// Define custom colors for each segment
const PLACE_CHART_COLORS = [
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

// Alternative color palette for place of birth
const PLACE_CHART_COLORS_ALTERNATIVE = [
  "#059669", // Emerald
  "#DC2626", // Red
  "#7C3AED", // Violet
  "#DB2777", // Pink
  "#0891B2", // Sky
  "#CA8A04", // Yellow
  "#16A34A", // Green
  "#EA580C", // Orange
  "#4338CA", // Indigo
  "#BE185D", // Rose
];

// Earth tone palette for place of birth
const PLACE_CHART_COLORS_EARTH = [
  "#8B4513", // Saddle Brown
  "#228B22", // Forest Green
  "#FF6347", // Tomato
  "#4682B4", // Steel Blue
  "#DAA520", // Goldenrod
  "#CD853F", // Peru
  "#20B2AA", // Light Sea Green
  "#9370DB", // Medium Purple
  "#FF4500", // Orange Red
  "#32CD32", // Lime Green
];

// Custom Legend component with percentages
interface LegendPayloadItem {
  value: string;
  type?: string;
  id?: string;
  color: string;
  payload?: {
    name: string;
    value: number;
  };
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
  totalValue: number;
}

const CustomLegend: React.FC<CustomLegendProps> = ({
  payload = [],
  totalValue,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry, index) => {
        // Calculate percentage
        const value = entry.payload?.value || 0;
        const percentage =
          totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0";

        return (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {entry.value} ({percentage}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get period description
const getPeriodDescription = (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): string => {
  const startDate = new Date(startYear, startMonth - 1);
  const endDate = new Date(endYear, endMonth - 1);

  return `${startDate.toLocaleDateString("default", {
    month: "short",
    year: "numeric",
  })} - 
          ${endDate.toLocaleDateString("default", {
            month: "short",
            year: "numeric",
          })}`;
};

export function PlaceChart({
  startYear,
  startMonth,
  endYear,
  endMonth,
}: PlaceChartProps): React.ReactElement {
  const { totalBirthCount, placeOfBirthGroups, fetchReport, loading, error } =
    useReportsStore();

  useEffect(() => {
    fetchReport(startYear, startMonth, endYear, endMonth);
  }, [startYear, startMonth, endYear, endMonth, fetchReport]);

  // Create formatted data for chart with custom colors
  const placeData = Object.entries(placeOfBirthGroups).map(
    ([name, value], index) => ({
      name,
      value,
      fill: PLACE_CHART_COLORS[index % PLACE_CHART_COLORS.length], // Use custom colors
    })
  );

  // Calculate total for percentages
  const totalPlaceCount = placeData.reduce((sum, item) => sum + item.value, 0);

  // Chart configuration
  const chartConfig: ChartConfig = {
    value: {
      label: "Count",
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Place of Birth</CardTitle>
        <CardDescription>
          {getPeriodDescription(startYear, startMonth, endYear, endMonth)}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex justify-center items-center h-[450px]">
            Loading data...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[450px] text-red-500">
            Error: {error}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[450px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={placeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {placeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  content={<CustomLegend totalValue={totalPlaceCount} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total births recorded: {totalBirthCount}
          <TrendingUp className="h-4 w-4 ml-2" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing place of birth statistics for{" "}
          {getPeriodDescription(startYear, startMonth, endYear, endMonth)}
        </div>
      </CardFooter>
    </Card>
  );
}
