"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/utils/currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ReceiptIndianRupee, Users } from "lucide-react"
import type { Student, Payment, Settings } from "@/types"

interface CollectionByGradeChartProps {
  students: Student[]
  payments: Payment[]
  settings: Settings
}

export function CollectionByGradeChart({ students, payments, settings }: CollectionByGradeChartProps) {
  const currency = settings?.currency || "INR"

  const chartData = useMemo(() => {
    const gradeData = new Map<string, { collection: number; count: number }>()

    // Group payments by student grade
    payments.forEach((payment) => {
      const student = students.find((s) => s.id === payment.studentId)
      if (student && student.status === "active") {
        const existing = gradeData.get(student.grade) || { collection: 0, count: 0 }
        gradeData.set(student.grade, {
          collection: existing.collection + payment.amount,
          count: existing.count + 1,
        })
      }
    })

    return Array.from(gradeData.entries())
      .map(([grade, data]) => ({
        grade,
        collection: data.collection,
        count: data.count,
        average: data.collection / data.count,
        color: data.collection > 50000 ? "#10b981" : data.collection > 25000 ? "#3b82f6" : "#8b5cf6",
      }))
      .sort((a, b) => {
        const aNum = Number.parseInt(a.grade) || (a.grade === "K" ? 0 : 999)
        const bNum = Number.parseInt(b.grade) || (b.grade === "K" ? 0 : 999)
        return aNum - bNum
      })
  }, [students, payments])

  const totalCollection = chartData.reduce((sum, item) => sum + item.collection, 0)
  const totalPayments = chartData.reduce((sum, item) => sum + item.count, 0)
  const highestGrade = chartData.reduce(
    (max, item) => (item.collection > max.collection ? item : max),
    chartData[0] || { collection: 0, grade: "N/A" },
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptIndianRupee className="h-4 w-4 text-green-500" />
            <p className="font-semibold text-foreground">Grade {label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-green-600">{formatCurrency(data.collection, currency)}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                {data.count} payment{data.count !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avg: {formatCurrency(data.average, currency)}</p>
          </div>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Collection by Grade</span>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              No Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[320px] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ReceiptIndianRupee className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-foreground">No Collection Data!</p>
            <p className="text-muted-foreground">No payments have been recorded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Collection by Grade
            <ReceiptIndianRupee className="h-4 w-4 text-green-500" />
          </CardTitle>
          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
            {totalPayments} payment{totalPayments !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Total collected:{" "}
            <strong className="text-green-600">{formatCurrency(totalCollection, currency)}</strong>
          </span>
          <span>
            Highest: <strong className="text-foreground">Grade {highestGrade.grade}</strong>
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="collectionBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="grade"
              className="text-muted-foreground"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatCurrency(value, currency, true)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="collection" radius={[6, 6, 0, 0]} stroke="hsl(var(--border))">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
