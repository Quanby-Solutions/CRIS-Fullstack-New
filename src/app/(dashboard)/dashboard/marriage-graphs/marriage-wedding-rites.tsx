"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface WeddingRitesTotals {
  civil: number;
  catholic: number;
  muslim: number;
  tribal: number;
  other: number;
  total: number;
}

interface ComparisonData {
  name: string;
  firstYear: number;
  secondYear: number;
  percentFirst: number;
  percentSecond: number;
}

export function WeddingRitesComparison() {
  // Get current year and previous year as defaults
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Set initial states with current and previous year
  const [firstYear, setFirstYear] = useState<number>(previousYear);
  const [secondYear, setSecondYear] = useState<number>(currentYear);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate available years (10 years back from current)
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Fetch and process data when years change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch data for both years
        const [firstRes, secondRes] = await Promise.all([
          fetch(`/api/marriage-report/wedding-rites?year=${firstYear}`),
          fetch(`/api/marriage-report/wedding-rites?year=${secondYear}`),
        ]);
        if (!firstRes.ok || !secondRes.ok) {
          throw new Error(
            `Fetch failed: ${!firstRes.ok ? firstRes.status : secondRes.status}`
          );
        }
        const firstData = await firstRes.json();
        const secondData = await secondRes.json();
        setComparisonData(
          processDataForComparison(
            firstYear,
            secondYear,
            firstData.totals,
            secondData.totals
          )
        );
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [firstYear, secondYear]);

  // Prepare comparison dataset
  function processDataForComparison(
    y1: number,
    y2: number,
    t1: WeddingRitesTotals,
    t2: WeddingRitesTotals
  ): ComparisonData[] {
    const pct = (v: number, tot: number) =>
      tot > 0 ? +((v / tot) * 100).toFixed(1) : 0;
    return [
      {
        name: "Roman Catholic",
        firstYear: t1.catholic,
        secondYear: t2.catholic,
        percentFirst: pct(t1.catholic, t1.total),
        percentSecond: pct(t2.catholic, t2.total),
      },
      {
        name: "Civil Ceremony",
        firstYear: t1.civil,
        secondYear: t2.civil,
        percentFirst: pct(t1.civil, t1.total),
        percentSecond: pct(t2.civil, t2.total),
      },
      {
        name: "Muslim Tadition",
        firstYear: t1.muslim,
        secondYear: t2.muslim,
        percentFirst: pct(t1.muslim, t1.total),
        percentSecond: pct(t2.muslim, t2.total),
      },
      {
        name: "Tribal Ceremony",
        firstYear: t1.tribal,
        secondYear: t2.tribal,
        percentFirst: pct(t1.tribal, t1.total),
        percentSecond: pct(t2.tribal, t2.total),
      },
      {
        name: "Other Rites",
        firstYear: t1.other,
        secondYear: t2.other,
        percentFirst: pct(t1.other, t1.total),
        percentSecond: pct(t2.other, t2.total),
      },
    ];
  }

  // Render labels on top of bars
  const renderCustomizedLabel = ({ x, y, width, value }: any) =>
    value > 0 ? (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {value}%
      </text>
    ) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Percent Distribution of Registered Marriages by Type of Ceremony
        </CardTitle>
        <CardDescription>
          City of Legazpi: {firstYear}–{secondYear}
        </CardDescription>
        <div className="flex gap-4 mt-2">
          {/** Year selectors **/}
          {[
            { label: "First Year", value: firstYear, onChange: setFirstYear },
            {
              label: "Second Year",
              value: secondYear,
              onChange: setSecondYear,
            },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-sm text-muted-foreground mb-1">
                {label}
              </label>
              <Select
                value={value.toString()}
                onValueChange={(v) => onChange(+v)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 0, left: 0, bottom: 30 }}
                barCategoryGap="30%"
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  interval={0}
                />
                <YAxis
                  label={{
                    angle: -90,
                    position: "insideLeft",
                    offset: 0,
                  }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="percentFirst"
                  name={firstYear.toString()}
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                >
                  <LabelList
                    dataKey="percentFirst"
                    position="top"
                    content={renderCustomizedLabel}
                  />
                </Bar>
                <Bar
                  dataKey="percentSecond"
                  name={secondYear.toString()}
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                >
                  <LabelList
                    dataKey="percentSecond"
                    position="top"
                    content={renderCustomizedLabel}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Source: City of Legazpi Civil Registry Office
      </CardFooter>
    </Card>
  );
}
