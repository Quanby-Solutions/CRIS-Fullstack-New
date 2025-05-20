"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import ChartsDashboard from "@/components/custom/dashboard/components/charts";
import MetricsDashboard from "@/components/custom/dashboard/components/metrics";
import StatisticsDashboard from "@/components/custom/dashboard/components/statistics";

import { MarriageAgePyramidChart } from "./marriage-graphs/marriage-per-age";
import { WeddingRitesComparison } from "./marriage-graphs/marriage-wedding-rites";
import BarangayDeathReport from "./death-graphs/death-per-barangay";
import PlaceOfDeathPieChart from "./death-graphs/place-of-death";
import { AttendantChart } from "./birth-graphs/attendant";
import { PlaceChart } from "./birth-graphs/palce-of-birth";

// Import the birth statistics components

export default function DashboardContent() {
  const { t } = useTranslation();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const threeMonthsAgo = now.getMonth() - 2;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(
    threeMonthsAgo > 0 ? threeMonthsAgo : 1
  );
  const [endYear, setEndYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth);

  const [selectedMetric, setSelectedMetric] = useState<{
    model:
      | "baseRegistryForm"
      | "birthCertificateForm"
      | "deathCertificateForm"
      | "marriageCertificateForm"
      | null;
    currentCount: number | null;
  }>({
    model: "baseRegistryForm",
    currentCount: null,
  });

  const handleSelectMetric = (
    model:
      | "baseRegistryForm"
      | "birthCertificateForm"
      | "deathCertificateForm"
      | "marriageCertificateForm",
    currentCount: number
  ) => {
    setSelectedMetric({ model, currentCount });
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto w-full flex flex-1 flex-col gap-4 p-4">
      {/* Optional: Alert and other dashboards */}
      {/* 
      <Alert>
        <Icons.infoCircledIcon className="h-4 w-4" />
        <AlertTitle>{t("summary_view")}</AlertTitle>
        <AlertDescription>
          {t("dashboard_description")}{" "}
          <Link href="/reports" className="text-blue-700 underline hover:text-blue-900">
            {t("reports_section")}
          </Link>
          .
        </AlertDescription>
      </Alert>

      <MetricsDashboard onSelectMetricAction={handleSelectMetric} />
      <StatisticsDashboard selectedMetric={selectedMetric} />
      <ChartsDashboard selectedMetric={selectedMetric} />
      */}

      {/* Static Charts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MarriageAgePyramidChart />
        <WeddingRitesComparison />
      </div>

      {/* Date range filters for BirthPieGraph */}
      <div className="flex flex-wrap gap-4 items-end mt-4">
        <FilterPicker
          label="Start"
          month={startMonth}
          year={startYear}
          onMonthChange={setStartMonth}
          onYearChange={setStartYear}
          years={years}
        />
        <FilterPicker
          label="End"
          month={endMonth}
          year={endYear}
          onMonthChange={setEndMonth}
          onYearChange={setEndYear}
          years={years}
        />
      </div>

      {/* Filtered BirthPieGraph */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
        {/* Birth charts */}
        <AttendantChart
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
        />
        <PlaceChart
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
        />
      </div>

      {/* Placeholder for DeathPieGraph or others */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* death */}
        <BarangayDeathReport />
        <PlaceOfDeathPieChart />
      </div>
    </div>
  );
}

function FilterPicker({
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
  years,
}: {
  label: string;
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  years: number[];
}) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <div className="flex gap-2">
        <select
          className="border px-2 py-1 rounded"
          value={month}
          onChange={(e) => onMonthChange(+e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          className="border px-2 py-1 rounded"
          value={year}
          onChange={(e) => onYearChange(+e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
