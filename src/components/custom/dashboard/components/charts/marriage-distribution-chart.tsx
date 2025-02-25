import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { Skeleton } from "@/components/ui/skeleton"

interface MarriageStatsChartProps {
    data: Array<{
        month: string
        count: number
    }>
    isLoading?: boolean
    totalMarriages: number
    trend: {
        percentage: string
        isUp: boolean
    }
}

export const MarriageStatsChart: React.FC<MarriageStatsChartProps> = ({
    data,
    isLoading = false,
    totalMarriages,
    trend
}) => {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <Card className="lg:col-span-3 flex flex-col min-h-[400px]">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1 flex justify-center items-center">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-4 w-full" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="lg:col-span-3 flex flex-col min-h-[400px]">
            <CardHeader>
                <CardTitle className="text-lg">
                    {t('marriage_registration_trends')}
                </CardTitle>
                <CardDescription className="text-sm">
                    {t('marriage_registrations_over_time')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--chart-3))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--chart-3))' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex-col gap-1 text-sm">
                <div className="flex items-center justify-between w-full">
                    <span className="text-muted-foreground">
                        {t('total_marriages')}: {totalMarriages.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                        {trend.isUp ? '↑' : '↓'} {trend.percentage}% {t('from_last_month')}
                    </span>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                    {t('last_6_months_data')}
                </div>
            </CardFooter>
        </Card>
    )
}