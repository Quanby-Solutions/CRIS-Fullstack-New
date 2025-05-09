'use client'

import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { useReportsStore } from '../../report-birth/use-reports-store'


interface BirthPieGraphProps {
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
}

export function BirthPieGraph({ startYear, startMonth, endYear, endMonth }: BirthPieGraphProps) {
  const { attendantTypeGroups, fetchReport, loading, error } = useReportsStore()

  useEffect(() => {
    fetchReport(startYear, startMonth, endYear, endMonth)
  }, [startYear, startMonth, endYear, endMonth, fetchReport])

  const data = Object.entries(attendantTypeGroups).map(([name, value]) => ({ name, value }))

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendant at Birth</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="relative w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend Guide */}
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-2 rounded shadow max-w-xs">
              <h4 className="font-semibold mb-1 text-sm">Legend</h4>
              {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm mb-1">
                  <span
                    className="inline-block w-3 h-3 mr-2 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
