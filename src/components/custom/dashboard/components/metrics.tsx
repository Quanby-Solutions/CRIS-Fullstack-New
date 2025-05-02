// src/components/MetricsDashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { getCurrentMonthRegistrations, getPreviousMonthRegistrations, getTotalRegistrations } from "@/hooks/count-metrics"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "react-i18next"

type ModelKey = "baseRegistryForm" | "birthCertificateForm" | "deathCertificateForm" | "marriageCertificateForm"

interface MetricItem {
  model: ModelKey
  titleKey: string
  icon: JSX.Element
}

interface Metric {
  titleKey: string
  currentCount: number
  percentageChange: number
  icon: JSX.Element
  model: ModelKey
}

const METRIC_ITEMS: MetricItem[] = [
  { model: "baseRegistryForm",        titleKey: "metrics.total_registrations",  icon: <Icons.user className="h-4 w-4" /> },
  { model: "birthCertificateForm",    titleKey: "metrics.birth_certificates",  icon: <Icons.cake className="h-4 w-4" /> },
  { model: "deathCertificateForm",    titleKey: "metrics.death_certificates",  icon: <Icons.notebookText className="h-4" /> },
  { model: "marriageCertificateForm", titleKey: "metrics.marriage_certificates", icon: <Icons.gem className="h-4 w-4" /> },
]

export default function MetricsDashboard({
  onSelectMetricAction,
}: {
  onSelectMetricAction: (model: ModelKey, currentCount: number) => void
}) {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [selectedMetric, setSelectedMetric] = useState<string>(METRIC_ITEMS[0].titleKey)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await Promise.all(
          METRIC_ITEMS.map(async ({ model, titleKey, icon }) => {
            let currentCount: number
            let previousCount: number
            let percentageChange: number

            if (model === "birthCertificateForm") {
              currentCount = await getTotalRegistrations(model)
              previousCount = 0
              percentageChange = 0
            } else {
              ;[currentCount, previousCount] = await Promise.all([
                getCurrentMonthRegistrations(model),
                getPreviousMonthRegistrations(model),
              ])
              percentageChange = previousCount === 0
                ? 100
                : ((currentCount - previousCount) / previousCount) * 100
            }

            return { titleKey, currentCount, percentageChange, icon, model }
          })
        )
        setMetrics(data)
      } catch (err) {
        console.error(err)
        setError(t("metrics.fetch_error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetrics()
  }, [t])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {METRIC_ITEMS.map((_, i) => (
          <Card key={i} className="p-4">
            <CardHeader className="flex justify-between pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card
          key={m.titleKey}
          className={`cursor-pointer transition-all ${
            selectedMetric === m.titleKey ? "bg-chart-2 text-white" : ""
          }`}
          onClick={() => {
            setSelectedMetric(m.titleKey)
            onSelectMetricAction(m.model, m.currentCount)
          }}
        >
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t(m.titleKey)}</CardTitle>
            <CardDescription className={
              selectedMetric === m.titleKey
                ? "text-white"
                : "text-muted-foreground"
            }>
              {m.icon}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{m.currentCount.toLocaleString()}</div>
            <p className={`text-xs ${
              selectedMetric === m.titleKey
                ? "text-white/80"
                : "text-muted-foreground"
            }`}>
              {m.model === "birthCertificateForm"
                ? t("metrics.lifetime_total")
                : `${m.percentageChange > 0 ? "+" : ""}${m.percentageChange.toFixed(1)}% ${t("metrics.from_last_month")}`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
