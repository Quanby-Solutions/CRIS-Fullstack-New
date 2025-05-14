"use client";

import { useState, useEffect } from "react";
import { useReportsStore, type AgeGroups } from "./use-reports-store";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export default function LiveBirthGenderReportWithFilter() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [endYear, setEndYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth);

  const {
    totalBirthCount,
    liveBirthGenderData,
    fatherAgeGroups,
    motherAgeGroups,
    motherBarangayGroups,
    marriageLegitimacyGroups,
    attendantTypeGroups,
    birthRegistrationStatusGroups,
    weightGroups,
    placeOfBirthGroups,
    loading,
    error,
    fetchReport,
  } = useReportsStore();

  useEffect(() => {
    fetchReport(startYear, startMonth, endYear, endMonth);
  }, [startYear, startMonth, endYear, endMonth, fetchReport]);

  const exportAllToCSV = () => {
    const rows: (string | number)[][] = [];

    rows.push(["Live births by gender — Legazpi City"]);
    rows.push(["Total registered births", totalBirthCount]);
    rows.push([]);

    // Gender
    rows.push(["Gender"]);
    rows.push(["Month", "Male", "Female"]);
    liveBirthGenderData.forEach((r) => {
      rows.push([r.month, r.male, r.female]);
    });
    rows.push([]);

    // Age distribution
    rows.push(["Age distribution (Father vs Mother)"]);
    rows.push(["Age Group", "Fathers", "Mothers"]);
    const ageGroupKeys = Object.keys(fatherAgeGroups) as Array<keyof AgeGroups>;
    ageGroupKeys.forEach((group) => {
      rows.push([group, fatherAgeGroups[group], motherAgeGroups[group]]);
    });
    rows.push([]);

    // Mother's Barangay
    rows.push(["Mother's Barangay Distribution"]);
    rows.push(["Barangay", "Count"]);
    Object.entries(motherBarangayGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });
    rows.push([]);

    // Marriage Legitimacy
    rows.push(["Marriage Legitimacy"]);
    rows.push(["Status", "Count"]);
    Object.entries(marriageLegitimacyGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });
    rows.push([]);

    // Attendant at Birth
    rows.push(["Attendant at Birth"]);
    rows.push(["Type", "Count"]);
    Object.entries(attendantTypeGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });
    rows.push([]);

    // Birth Registration Status
    rows.push(["Birth Registration Status"]);
    rows.push(["Status", "Count"]);
    Object.entries(birthRegistrationStatusGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });
    rows.push([]);

    // Weight at Birth
    rows.push(["Weight at Birth"]);
    rows.push(["Range", "Count"]);
    Object.entries(weightGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });
    rows.push([]);

    // Place of Birth
    rows.push(["Place of Birth Distribution"]);
    rows.push(["Category", "Count"]);
    Object.entries(placeOfBirthGroups).forEach(([k, v]) => {
      rows.push([k, v]);
    });

    // generate CSV with UTF-8 BOM
    const rawCsv = Papa.unparse(rows, { header: false });
    const csvWithBom = "\uFEFF" + rawCsv;
    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `live_births_by_gender_${timestamp}.csv`;
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(`Exported CSV as ${filename}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">
          Live births by gender — Legazpi City
        </CardTitle>
        <Button size="sm" onClick={exportAllToCSV} className="h-8">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          Total registered births: <span>{totalBirthCount}</span>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
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

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="space-y-8">
            {/* Gender */}
            <div>
              <DataTable
                headers={["Month", "Male", "Female"]}
                rows={liveBirthGenderData.map((r) => [
                  r.month,
                  r.male,
                  r.female,
                ])}
              />
            </div>

            <Separator />

            {/* Age */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Age distribution (Father vs Mother)
              </h3>
              <DataTable
                headers={["Age Group", "Fathers", "Mothers"]}
                rows={Object.keys(fatherAgeGroups).map((group) => [
                  group,
                  fatherAgeGroups[group as keyof AgeGroups],
                  motherAgeGroups[group as keyof AgeGroups],
                ])}
              />
            </div>

            <Separator />

            {/* Barangay */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Mother's Barangay Distribution
              </h3>
              <DataTable
                headers={["Barangay", "Count"]}
                rows={Object.entries(motherBarangayGroups)}
              />
            </div>

            <Separator />

            {/* Legitimacy */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Marriage Legitimacy
              </h3>
              <DataTable
                headers={["Status", "Count"]}
                rows={Object.entries(marriageLegitimacyGroups)}
              />
            </div>

            <Separator />

            {/* Attendant */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Attendant at Birth
              </h3>
              <DataTable
                headers={["Type", "Count"]}
                rows={Object.entries(attendantTypeGroups)}
              />
            </div>

            <Separator />

            {/* Registration Status */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Birth Registration Status
              </h3>
              <DataTable
                headers={["Status", "Count"]}
                rows={Object.entries(birthRegistrationStatusGroups)}
              />
            </div>

            <Separator />

            {/* Weight at Birth */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Weight at Birth
              </h3>
              <DataTable
                headers={["Range", "Count"]}
                rows={Object.entries(weightGroups)}
              />
            </div>

            <Separator />

            {/* Place of Birth */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                Place of Birth Distribution
              </h3>
              <DataTable
                headers={["Category", "Count"]}
                rows={Object.entries(placeOfBirthGroups)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Select
          value={month.toString()}
          onValueChange={(value) => onMonthChange(+value)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(value) => onYearChange(+value)}
        >
          <SelectTrigger className="w-[80px] h-8">
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
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<(string | number)[]>;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead
                key={header}
                className={header !== headers[0] ? "text-right" : ""}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className={cellIndex !== 0 ? "text-right" : ""}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
