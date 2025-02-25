import { useEffect, useMemo, useState } from "react"
import { getBirthAndDeathGenderCount, getRecentRegistrations } from "@/hooks/count-metrics"
import { GenderDistributionChart } from "@/components/custom/dashboard/components/charts/gender-distribution-chart"
import { RecentRegistrationsTable } from "@/components/custom/dashboard/components/charts/recent-registrations-table"
import { MarriageStatsChart } from "./marriage-distribution-chart"

interface GenderCountData {
    name: string
    male: number
    female: number
}

interface BaseRegistration {
    name: string
    sex: string
    dateOfBirth: string
    registrationDate: string
    formType: string
}

interface RecentRegistration extends BaseRegistration {
    id: string
    type: string
}

interface MonthlyMarriageData {
    month: string
    count: number
}

const TEN_DAYS = 10 * 24 * 60 * 60 * 1000

const calculateTotalsByGender = (data: GenderCountData[]) => {
    return data.reduce(
        (acc, item) => ({
            male: acc.male + item.male,
            female: acc.female + item.female,
        }),
        { male: 0, female: 0 }
    )
}

const filterRecentRegistrations = (registrations: BaseRegistration[], selectedModel: string): RecentRegistration[] => {
    const tenDaysAgo = Date.now() - TEN_DAYS
    return registrations
        .filter(reg => {
            const isRecent = new Date(reg.registrationDate).getTime() >= tenDaysAgo
            const matchesType = selectedModel === "baseRegistryForm" ||
                reg.formType.toLowerCase() === selectedModel.replace("CertificateForm", "").toLowerCase()
            return isRecent && matchesType
        })
        .map((registration, index) => ({
            ...registration,
            id: `registration-${index}`,
            type: registration.formType.charAt(0).toUpperCase() + registration.formType.slice(1).toLowerCase(),
        }))
}

interface ChartsDashboardProps {
    selectedMetric: {
        model: "baseRegistryForm" | "birthCertificateForm" | "deathCertificateForm" | "marriageCertificateForm" | null
    }
}

export default function ChartsDashboard({ selectedMetric }: ChartsDashboardProps) {
    const [chartData, setChartData] = useState<GenderCountData[]>([])
    const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { male: totalMale, female: totalFemale } = useMemo(
        () => calculateTotalsByGender(chartData),
        [chartData]
    )

    const totalRegistrations = totalMale + totalFemale

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                if (!selectedMetric.model) return

                const type = selectedMetric.model === "birthCertificateForm" ? "birth" :
                    selectedMetric.model === "deathCertificateForm" ? "death" : null

                const [genderCountData, recentRegistrationsData] = await Promise.all([
                    type ? getBirthAndDeathGenderCount(type) : Promise.resolve([]),
                    getRecentRegistrations()
                ])

                setChartData(genderCountData)
                setRecentRegistrations(filterRecentRegistrations(recentRegistrationsData, selectedMetric.model))
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [selectedMetric])

    const getMarriageStatsData = (): MonthlyMarriageData[] => {
        const monthlyDataMap = recentRegistrations.reduce<Record<string, number>>((acc, reg) => {
            const month = new Date(reg.registrationDate).toLocaleString('default', { month: 'short' })
            acc[month] = (acc[month] || 0) + 1
            return acc
        }, {})

        return Object.entries(monthlyDataMap).map(([month, count]) => ({
            month,
            count,
        }))
    }

    const calculateMarriageTrend = () => {
        const sortedData = getMarriageStatsData().sort((a, b) =>
            new Date(a.month + ' 2024').getTime() - new Date(b.month + ' 2024').getTime()
        )
        const currentCount = sortedData[sortedData.length - 1]?.count || 0
        const previousCount = sortedData[sortedData.length - 2]?.count || 0
        const percentage = previousCount ? ((currentCount - previousCount) / previousCount * 100).toFixed(1) : '0'

        return {
            percentage,
            isUp: currentCount >= previousCount
        }
    }

    const showGenderDistribution = selectedMetric.model === "birthCertificateForm" || selectedMetric.model === "deathCertificateForm"

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            {showGenderDistribution ? (
                <GenderDistributionChart
                    totalMale={totalMale}
                    totalFemale={totalFemale}
                    totalRegistrations={totalRegistrations}
                    name={selectedMetric.model === "birthCertificateForm" ? "Birth" : "Death"}
                    isLoading={isLoading}
                />
            ) : selectedMetric.model === "marriageCertificateForm" || selectedMetric.model === "baseRegistryForm" ? (
                <MarriageStatsChart
                    data={getMarriageStatsData()}
                    isLoading={isLoading}
                    totalMarriages={recentRegistrations.length}
                    trend={calculateMarriageTrend()}
                />
            ) : null}

            <RecentRegistrationsTable
                recentRegistrations={recentRegistrations}
                isLoading={isLoading}
            />
        </div>
    )
}