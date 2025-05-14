"use client";

import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import Interface from "@/app/(dashboard)/reports-marriage/marriage-report-components/interface";
import LiveBirthGenderReportWithFilter from "@/app/(dashboard)/report-birth/birth-report";
import DeathReport from "@/app/(dashboard)/reports-death/death-report-components/all-component";

export type ReportKey = "marriage" | "birth" | "death";

const reports: { key: ReportKey; labelKey: string }[] = [
  { key: "marriage", labelKey: "marriage_reports" },
  { key: "birth", labelKey: "birth_reports" },
  { key: "death", labelKey: "death_reports" },
];

export const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState<ReportKey>("marriage");
  const { t } = useTranslation();

  const renderReport = () => {
    switch (selectedReport) {
      case "marriage":
        return <Interface />;
      case "birth":
        return <LiveBirthGenderReportWithFilter />;
      case "death":
        return <DeathReport />;
      default:
        return <Interface />; // Default to marriage if somehow invalid state
    }
  };

  return (
    <div className="w-full ml-0 mr-auto relative h-screen overflow-y-auto">
      <CardHeader>
        <CardTitle>{t("reports_dashboard")}</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-full">
        <Tabs
          value={selectedReport}
          onValueChange={(value) => setSelectedReport(value as ReportKey)}
          className="w-full"
        >
          <TabsList className="grid w-full p-1 grid-cols-3 mb-6 max-h-10">
            {reports.map((report) => (
              <TabsTrigger
                key={report.key}
                value={report.key}
                className="p-1 px-4"
              >
                {t(report.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
          {reports.map((report) => (
            <TabsContent key={report.key} value={report.key} className="w-full">
              <div className="w-full">{renderReport()}</div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </div>
  );
};
