"use client";

import Link from "next/link";
import ChartsDashboard from "@/components/custom/dashboard/components/charts";
import MetricsDashboard from "@/components/custom/dashboard/components/metrics";
import StatisticsDashboard from "@/components/custom/dashboard/components/statistics";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MarriageAgePyramidChart } from "./components/marriage-per-age";
import { WeddingRitesComparison } from "./components/marriage-wedding-rites";

export default function DashboardContent() {
  const { t } = useTranslation();
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
      {/* <Alert>
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

      <ChartsDashboard selectedMetric={selectedMetric} /> */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MarriageAgePyramidChart />
        <WeddingRitesComparison />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{/* birth */}</div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{/* death */}</div>
    </div>
  );
}
