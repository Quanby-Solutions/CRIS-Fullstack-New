"use client";

import * as React from "react";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgeBucketData {
  label: string;
  male: number;
  female: number;
}

interface MarriageAgeData {
  year: number;
  ageBucketData: AgeBucketData[];
  totalMarriages: number;
  totalMale: number;
  totalFemale: number;
}

// Custom tooltip to display the values
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold">{label}</p>
        <p className="text-pink-600">
          Female: {Math.abs(data.female).toFixed(1)}%
        </p>
        <p className="text-purple-700">
          Male: {Math.abs(data.male).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function MarriageAgePyramidChart() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [data, setData] = useState<MarriageAgeData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate available years (5 years back from current)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    setAvailableYears(years);
  }, []);

  // Fetch data when year changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/marriage-report/marriage-bar-graph?year=${selectedYear}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const data = await response.json();
        setData(data);

        // Process data for the pyramid chart
        processChartData(data);
      } catch (err) {
        console.error("Error fetching marriage age data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Process data for pyramid chart
  const processChartData = (data: MarriageAgeData) => {
    if (!data || !data.ageBucketData) return;

    // Calculate total to determine percentages
    const totalMale =
      data.totalMale ||
      data.ageBucketData.reduce((sum, item) => sum + item.male, 0);
    const totalFemale =
      data.totalFemale ||
      data.ageBucketData.reduce((sum, item) => sum + item.female, 0);

    // Convert to percentages and negate male values for left side of chart
    const processed = data.ageBucketData.map((item) => ({
      label: item.label,
      // Negate male values for left side of the pyramid
      male: -((item.male / totalMale) * 100),
      female: (item.female / totalFemale) * 100,
      // Keep original values for tooltip display
      originalMale: item.male,
      originalFemale: item.female,
    }));

    // Sort from youngest to oldest
    const orderedBuckets = [
      "Not Stated",
      "60+",
      "55-59",
      "50-54",
      "45-49",
      "40-44",
      "35-39",
      "30-34",
      "25-29",
      "20-24",
      "15-19",
      "Under 15",
    ];

    // Sort by the custom order
    processed.sort(
      (a, b) =>
        orderedBuckets.indexOf(a.label) - orderedBuckets.indexOf(b.label)
    );

    setChartData(processed);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>Marriage Age Distribution - City of Legazpi</CardTitle>
            <CardDescription>
              Percent Distribution of Marriages by Age Group and Sex:{" "}
              {selectedYear}
            </CardDescription>
          </div>
          <div className="mt-2 sm:mt-0 w-32">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : (
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${Math.abs(value).toFixed(1)}%`}
                  domain={[-40, 40]}
                  ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine x={0} stroke="#000" />
                <Bar
                  dataKey="male"
                  name="Male"
                  fill="#9c27b0"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="female"
                  name="Female"
                  fill="#f48fb1"
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground text-center">
          Data shows percentage distribution of marriages registered in the City
          of Legazpi.
        </div>
      </CardContent>
    </Card>
  );
}
