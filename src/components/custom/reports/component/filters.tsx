"use client"

import { useTranslation } from 'react-i18next'
import { Label } from "@/components/ui/label"
import { ExportDialog } from "@/components/custom/reports/component/export-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hasPermission } from '@/types/auth'
import { Permission } from '@prisma/client'
import { useUser } from '@/context/user-context'

interface FiltersProps<T> {
    yearFrom: number
    yearTo: number
    setYearFromAction: (year: number) => void
    setYearToAction: (year: number) => void
    data: T[]
    chartType: string
    setChartTypeAction: (type: string) => void
    dataKeyX: keyof T
    dataKeysY: (keyof T)[]
    title: string
}

export const Filters = <T extends { year: number }>({
    yearFrom,
    yearTo,
    setYearFromAction,
    setYearToAction,
    data,
    chartType,
    setChartTypeAction,
    dataKeyX,
    dataKeysY,
    title,
}: FiltersProps<T>) => {
    const { t } = useTranslation()
    const { permissions: userPermissions } = useUser()

    const years = Array.from({ length: 30 }, (_, i) => 2000 + i)

    // Ensure dataKeysY is set to ["male", "female"] for Donut Chart
    const filteredDataKeysY = chartType === "Donut Chart" ? ["male", "female"] as (keyof T)[] : dataKeysY

    return (
        <div className="space-y-4">
            {/* Grid layout for Year selection and Export Dialog */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Year From */}
                {hasPermission(userPermissions, Permission.REPORT_READ) && (
                    <div>
                        <Label className='text-sm text-muted-foreground px-1.5' htmlFor="yearFrom">{t('filters.yearFrom')}</Label>
                        <Select
                            onValueChange={(value) => setYearFromAction(Number(value))}
                            defaultValue={yearFrom.toString()}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.selectYear')} />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Year To */}
                {hasPermission(userPermissions, Permission.REPORT_READ) && (
                    <div>
                        <Label className='text-sm text-muted-foreground px-1.5' htmlFor="yearTo">{t('filters.yearTo')}</Label>
                        <Select
                            onValueChange={(value) => setYearToAction(Number(value))}
                            defaultValue={yearTo.toString()}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.selectYear')} />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Export Dialog */}
                {hasPermission(userPermissions, Permission.REPORT_EXPORT) && (
                    <div className="flex justify-start sm:justify-end">
                        <ExportDialog
                            data={data}
                            chartType={chartType}
                            setChartTypeAction={setChartTypeAction}
                            dataKeyX={dataKeyX}
                            dataKeysY={filteredDataKeysY}
                            title={title} />
                    </div>
                )}
            </div>
        </div>
    )
}
