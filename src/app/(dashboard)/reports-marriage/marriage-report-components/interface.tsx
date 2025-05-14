"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Summary {
  total: number;
  withLicense: number;
  noLicense: number;
  onTime: number;
  late: number;
  civilCeremony: number;
  romanCatholic: number;
  muslim: number;
  tribal: number;
  otherReligious: number;
}

interface AgeCount {
  bucket: string;
  bride: number;
  groom: number;
}

export default function Interface() {
  // --- Filters state ---
  const [startYear, setStartYear] = useState("2024");
  const [startMonth, setStartMonth] = useState("01");
  const [endYear, setEndYear] = useState("2025");
  const [endMonth, setEndMonth] = useState("05");

  // --- Aggregated stats ---
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ageCounts, setAgeCounts] = useState<AgeCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Picker options ---
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // --- Fetch aggregated data ---
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startYear,
        startMonth,
        endYear,
        endMonth,
      });
      const res = await fetch(`/api/marriage-report/base?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const json: { summary: Summary; ageCounts: AgeCount[] } =
        await res.json();
      setSummary(json.summary);
      setAgeCounts(json.ageCounts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- Export helpers (include new fields) ---
  const exportCSV = () => {
    if (!summary) return;
    let csv = "";
    csv +=
      "No. of Marriage,With Marriage License,No Marriage License,On Time Registration,Late Registration,Civil Ceremony,Roman Catholic,Muslim,Tribal,Other Religious Rites\n";
    csv += `${summary.total},${summary.withLicense},${summary.noLicense},${summary.onTime},${summary.late},${summary.civilCeremony},${summary.romanCatholic},${summary.muslim},${summary.tribal},${summary.otherReligious}\n\n`;
    csv += "Age Range,Age of Bride,Age of Groom\n";
    ageCounts.forEach(({ bucket, bride, groom }) => {
      csv += `${bucket},${bride},${groom}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marriage_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!summary) return;
    let html = "<table><tr>";
    [
      "No. of Marriage",
      "With Marriage License",
      "No Marriage License",
      "On Time Registration",
      "Late Registration",
      "Civil Ceremony",
      "Roman Catholic",
      "Muslim",
      "Tribal",
      "Other Religious Rites",
    ].forEach((h) => (html += `<th>${h}</th>`));
    html += "</tr><tr>";
    html += `<td>${summary.total}</td><td>${summary.withLicense}</td><td>${summary.noLicense}</td><td>${summary.onTime}</td><td>${summary.late}</td><td>${summary.civilCeremony}</td><td>${summary.romanCatholic}</td><td>${summary.muslim}</td><td>${summary.tribal}</td><td>${summary.otherReligious}</td></tr><tr><td colspan=\"10\"></td></tr><tr>`;
    ["Age Range", "Age of Bride", "Age of Groom"].forEach(
      (h) => (html += `<th>${h}</th>`)
    );
    html += "</tr>";
    ageCounts.forEach(({ bucket, bride, groom }) => {
      html += `<tr><td>${bucket}</td><td>${bride}</td><td>${groom}</td></tr>`;
    });
    html += "</table>";
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marriage_report.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex flex-row justify-between items-center">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {[
            {
              label: "Start Year",
              value: startYear,
              onChange: setStartYear,
              options: years,
            },
            {
              label: "Start Month",
              value: startMonth,
              onChange: setStartMonth,
              options: months.map((m) => m.value),
            },
            {
              label: "End Year",
              value: endYear,
              onChange: setEndYear,
              options: years,
            },
            {
              label: "End Month",
              value: endMonth,
              onChange: setEndMonth,
              options: months.map((m) => m.value),
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {months.find((m) => m.value === opt)?.label || opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex items-end">
            <Button onClick={fetchData} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-row gap-4 items-center">
          <Button variant="outline" onClick={exportCSV} disabled={!summary}>
            Export CSV
          </Button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* SUMMARY TABLE */}
      {summary && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. of Marriage</TableHead>
              <TableHead>With Marriage License</TableHead>
              <TableHead>No Marriage License</TableHead>
              <TableHead>On Time Registration</TableHead>
              <TableHead>Late Registration</TableHead>
              <TableHead>Civil Ceremony</TableHead>
              <TableHead>Roman Catholic</TableHead>
              <TableHead>Muslim</TableHead>
              <TableHead>Tribal</TableHead>
              <TableHead>Other Religious Rites</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{summary.total}</TableCell>
              <TableCell>{summary.withLicense}</TableCell>
              <TableCell>{summary.noLicense}</TableCell>
              <TableCell>{summary.onTime}</TableCell>
              <TableCell>{summary.late}</TableCell>
              <TableCell>{summary.civilCeremony}</TableCell>
              <TableCell>{summary.romanCatholic}</TableCell>
              <TableCell>{summary.muslim}</TableCell>
              <TableCell>{summary.tribal}</TableCell>
              <TableCell>{summary.otherReligious}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}

      {/* AGE DISTRIBUTION TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Age Range</TableHead>
            <TableHead>Age of Bride</TableHead>
            <TableHead>Age of Groom</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ageCounts.map(({ bucket, bride, groom }) => (
            <TableRow key={bucket}>
              <TableCell>{bucket}</TableCell>
              <TableCell>{bride}</TableCell>
              <TableCell>{groom}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
