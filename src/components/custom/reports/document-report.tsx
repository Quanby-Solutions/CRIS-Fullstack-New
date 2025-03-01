"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useTranslation } from "react-i18next"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExportDialog } from "@/hooks/use-export-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ApiResponse, ReportDataItem } from "@/types/report"
import { ReportSkeleton } from "./component/report-skeleton"

export type GroupByOption = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
export type DisplayMode = "all" | "hasDocuments"
export type ClassificationFilter = "all" | "marriage" | "birth" | "death"

const defaultGroupBy: GroupByOption = "yearly"
const defaultYearFilter: string = "All"
const defaultMonthFilter: string = "All"
const defaultDisplayMode: DisplayMode = "all"
const defaultClassification: ClassificationFilter = "all"

const fetcher = async (url: string): Promise<ApiResponse> => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }
    return response.json()
}

export const DocumentReport = () => {
    const { t, i18n } = useTranslation()

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(20)

    // Filter states
    const [availableYears, setAvailableYears] = useState<string[]>([])
    const [groupBy, setGroupBy] = useState<GroupByOption>(defaultGroupBy)
    const [yearFilter, setYearFilter] = useState<string>(defaultYearFilter)
    const [monthFilter, setMonthFilter] = useState<string>(defaultMonthFilter)
    const [displayMode, setDisplayMode] = useState<DisplayMode>(defaultDisplayMode)
    const [classification, setClassification] = useState<ClassificationFilter>(defaultClassification)

    const queryParams = new URLSearchParams()
    queryParams.append("groupBy", groupBy)
    queryParams.append("displayMode", displayMode)
    queryParams.append("classification", classification)
    queryParams.append("page", currentPage.toString())
    queryParams.append("pageSize", pageSize.toString())

    // When a year is selected, include a start and end date filter.
    if (yearFilter !== t("documentReport.all")) {
        const year = parseInt(yearFilter)
        if (!isNaN(year)) {
            if (groupBy === "monthly") {
                // Always include month parameter, even if it's "All"
                queryParams.append("month", monthFilter)
                if (monthFilter !== t("documentReport.all")) {
                    const month = parseInt(monthFilter)
                    if (!isNaN(month)) {
                        const startDate = new Date(year, month - 1, 1)
                        const endDate = new Date(year, month, 0, 23, 59, 59, 999)
                        queryParams.append("startDate", startDate.toISOString())
                        queryParams.append("endDate", endDate.toISOString())
                    }
                } else {
                    // If month is "All", filter for the whole year.
                    const startDate = new Date(year, 0, 1)
                    const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
                    queryParams.append("startDate", startDate.toISOString())
                    queryParams.append("endDate", endDate.toISOString())
                }
            } else {
                const startDate = new Date(year, 0, 1)
                const endDate = new Date(year, 11, 31, 23, 59, 59, 999)
                queryParams.append("startDate", startDate.toISOString())
                queryParams.append("endDate", endDate.toISOString())
            }
        }
    }

    const { data, error } = useSWR<ApiResponse>(
        `/api/reports/document?${queryParams.toString()}`,
        fetcher
    )

    // Update available years when data changes
    useEffect(() => {
        if (data?.meta?.availableYears) {
            const uniqueYears = Array.from(new Set<number>(data.meta.availableYears))
            const sortedYears = uniqueYears.sort((a, b) => b - a)
            setAvailableYears(sortedYears.map((year) => year.toString()))

            // Reset year filter if the current year is no longer available
            if (yearFilter !== t("documentReport.all") && !uniqueYears.includes(parseInt(yearFilter))) {
                setYearFilter(t("documentReport.all"))
            }
        }
    }, [data?.meta?.availableYears, yearFilter, t])

    // Enhanced filter change handlers
    const handleGroupByChange = (value: GroupByOption) => {
        setGroupBy(value)
        if (value !== "monthly" && monthFilter !== t("documentReport.all")) {
            setMonthFilter(t("documentReport.all"))
        }
        setCurrentPage(1)
    }

    const handleYearChange = (value: string) => {
        setYearFilter(value)
        if (value === t("documentReport.all")) {
            setMonthFilter(t("documentReport.all"))
        }
        setCurrentPage(1)
    }

    const handleMonthChange = (value: string) => {
        setMonthFilter(value)
        setCurrentPage(1)
    }

    // Check if any filter differs from default
    const filtersChanged =
        groupBy !== defaultGroupBy ||
        yearFilter !== t("documentReport.all") ||
        monthFilter !== t("documentReport.all") ||
        displayMode !== defaultDisplayMode ||
        classification !== defaultClassification

    const resetFilters = () => {
        setGroupBy(defaultGroupBy)
        setYearFilter(t("documentReport.all"))
        setMonthFilter(t("documentReport.all"))
        setDisplayMode(defaultDisplayMode)
        setClassification(defaultClassification)
        setCurrentPage(1)
    }

    // Error and loading states
    if (error) {
        return (
            <div className="p-4 text-center text-destructive">
                {t("documentReport.loadError")}
            </div>
        )
    }
    if (!data) {
        return <ReportSkeleton />
    }

    const reportData: ReportDataItem[] = Array.isArray(data?.data) ? data.data : []

    // Calculate classification summary
    let classificationSummary = data.meta?.classification
    if (classification !== "all") {
        classificationSummary = {
            marriage: classification === "marriage" ? classificationSummary.marriage : 0,
            birth: classification === "birth" ? classificationSummary.birth : 0,
            death: classification === "death" ? classificationSummary.death : 0,
        }
    }

    // Export data preparation
    const exportData = reportData.map((item: ReportDataItem) => ({
        ...item,
        averageProcessingTime: item.averageProcessingTime.toString(),
    })) as Record<string, unknown>[]

    const { exportToCSV, exportToExcel, exportToPDF } = useExportDialog(
        exportData,
        () => { },
        t("documentReport.exportTitle")
    )

    // Pagination calculations
    const totalGroups = data.meta.totalGroups
    const computedPageSize = data.meta.pageSize
    const totalPages = Math.ceil(totalGroups / computedPageSize)

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
    }

    return (
        <Card className="p-4">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>{t("documentReport.title")}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("documentReport.subtitle")}
                    </p>
                    {classificationSummary && (
                        <div className="mt-1 text-sm text-muted-foreground pt-2">
                            {t("documentReport.classificationSummary")}:&nbsp;
                            <span>
                                {t("documentReport.marriage")}: {classificationSummary.marriage}
                            </span>,&nbsp;
                            <span>
                                {t("documentReport.birth")}: {classificationSummary.birth}
                            </span>,&nbsp;
                            <span>
                                {t("documentReport.death")}: {classificationSummary.death}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <Select
                        value={i18n.language}
                        onValueChange={(value: string) => i18n.changeLanguage(value)}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder={t("documentReport.selectLanguage")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fil">Tagalog</SelectItem>
                        </SelectContent>
                    </Select>
                    {filtersChanged && (
                        <Button onClick={resetFilters} variant="outline" size="sm">
                            {t("documentReport.resetFilters")}
                        </Button>
                    )}
                    <Button onClick={() => exportToCSV()} variant="outline" size="sm">
                        {t("documentReport.exportCSV")}
                    </Button>
                    <Button onClick={() => exportToExcel()} variant="outline" size="sm">
                        {t("documentReport.exportExcel")}
                    </Button>
                    <Button onClick={() => exportToPDF()} variant="outline" size="sm">
                        {t("documentReport.exportPDF")}
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                {t("documentReport.help")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("documentReport.helpTitle")}</DialogTitle>
                                <DialogDescription>
                                    {t("documentReport.helpDescription")}
                                    <br />
                                    <br />
                                    {t("documentReport.helpFormulaIntro")}
                                    <br />
                                    <code>{t("documentReport.formula")}</code>
                                    <br />
                                    {t("documentReport.helpFormulaOutro")}
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">{t("documentReport.groupBy")}</label>
                        <Select
                            value={groupBy}
                            onValueChange={handleGroupByChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={t("documentReport.selectGroupBy")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">{t("documentReport.daily")}</SelectItem>
                                <SelectItem value="weekly">{t("documentReport.weekly")}</SelectItem>
                                <SelectItem value="monthly">{t("documentReport.monthly")}</SelectItem>
                                <SelectItem value="quarterly">{t("documentReport.quarterly")}</SelectItem>
                                <SelectItem value="yearly">{t("documentReport.yearly")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">{t("documentReport.year")}</label>
                        <Select
                            value={yearFilter}
                            onValueChange={handleYearChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={t("documentReport.selectYear")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={t("documentReport.all")}>
                                    {t("documentReport.all")}
                                </SelectItem>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {groupBy === "monthly" && yearFilter !== t("documentReport.all") && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("documentReport.month")}</label>
                            <Select
                                value={monthFilter}
                                onValueChange={handleMonthChange}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder={t("documentReport.selectMonth")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={t("documentReport.all")}>
                                        {t("documentReport.all")}
                                    </SelectItem>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                        <SelectItem key={month} value={month.toString()}>
                                            {new Date(2000, month - 1, 1).toLocaleDateString(i18n.language, { month: "long" })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">{t("documentReport.display")}</label>
                        <Select
                            value={displayMode}
                            onValueChange={(value: DisplayMode) => {
                                setDisplayMode(value)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={t("documentReport.selectDisplayMode")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("documentReport.allPeriods")}</SelectItem>
                                <SelectItem value="hasDocuments">{t("documentReport.hasDocumentsOnly")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">{t("documentReport.classification")}</label>
                        <Select
                            value={classification}
                            onValueChange={(value: ClassificationFilter) => {
                                setClassification(value)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder={t("documentReport.selectClassification")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("documentReport.all")}</SelectItem>
                                <SelectItem value="marriage">{t("documentReport.marriage")}</SelectItem>
                                <SelectItem value="birth">{t("documentReport.birth")}</SelectItem>
                                <SelectItem value="death">{t("documentReport.death")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {reportData.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                        {t("documentReport.noDocuments")}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full table-fixed">
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="bg-muted">{t("documentReport.period")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.totalDocuments")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.processed")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.pending")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.averageProcessingTime")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.marriage")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.birth")}</TableHead>
                                        <TableHead className="bg-muted text-right">{t("documentReport.death")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>

                            <div className="relative overflow-y-auto max-h-[40dvh]">
                                <Table className="min-w-full table-fixed">
                                    <TableBody>
                                        {reportData.map((item: ReportDataItem) => (
                                            <TableRow key={item.period}>
                                                <TableCell>{item.period}</TableCell>
                                                <TableCell className="text-right">{item.totalDocuments}</TableCell>
                                                <TableCell className="text-right">{item.processedDocuments}</TableCell>
                                                <TableCell className="text-right">{item.pendingDocuments}</TableCell>
                                                <TableCell className="text-right">{item.averageProcessingTime}</TableCell>
                                                <TableCell className="text-right">{item.marriageCount}</TableCell>
                                                <TableCell className="text-right">{item.birthCount}</TableCell>
                                                <TableCell className="text-right">{item.deathCount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => goToPage(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            // Show first page, last page, and 2 pages around current page
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            onClick={() => goToPage(page)}
                                                            isActive={page === currentPage}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )
                                            }

                                            // Show ellipsis for gaps
                                            if (
                                                page === currentPage - 3 ||
                                                page === currentPage + 3
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )
                                            }

                                            return null
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => goToPage(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default DocumentReport
