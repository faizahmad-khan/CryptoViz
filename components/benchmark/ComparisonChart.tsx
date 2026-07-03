'use client'

import { BenchmarkResult } from '@/types/benchmark'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts'

interface ComparisonChartProps {
  results: BenchmarkResult[]
  chartType?: 'bar' | 'line' | 'scatter'
}

export default function ComparisonChart({
  results,
  chartType = 'bar',
}: ComparisonChartProps) {
  if (results.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">No data to display. Run a benchmark first.</p>
      </div>
    )
  }

  const chartData = results.map((result) => ({
    name: result.cipherName.substring(0, 15), // Truncate long names
    avgTime: parseFloat(result.averageTime.toFixed(4)),
    minTime: parseFloat(result.minTime.toFixed(4)),
    maxTime: parseFloat(result.maxTime.toFixed(4)),
    opsPerSec: parseFloat(result.operationsPerSecond.toFixed(0)),
    fullName: result.cipherName,
  }))

  const sortedData = [...chartData].sort((a, b) => a.avgTime - b.avgTime)

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgTime"
              stroke="#14b8a6"
              name="Average Time"
              dot={{ fill: '#14b8a6' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="minTime"
              stroke="#22c55e"
              name="Min Time"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="maxTime"
              stroke="#ef4444"
              name="Max Time"
              strokeDasharray="5 5"
            />
          </LineChart>
        )

      case 'scatter':
        return (
          <ScatterChart
            data={sortedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="opsPerSec" name="Ops/Second" />
            <YAxis dataKey="avgTime" name="Avg Time (ms)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
            />
            <Scatter name="Algorithms" data={sortedData} fill="#14b8a6" />
          </ScatterChart>
        )

      default:
        return (
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
            />
            <Legend />
            <Bar dataKey="avgTime" fill="#14b8a6" name="Average Time" radius={[8, 8, 0, 0]} />
            <Bar dataKey="minTime" fill="#22c55e" name="Min Time" radius={[8, 8, 0, 0]} />
            <Bar dataKey="maxTime" fill="#ef4444" name="Max Time" radius={[8, 8, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Performance Comparison
      </h3>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        <p className="font-medium">Algorithms (sorted by average time):</p>
        <div className="mt-2 space-y-1">
          {sortedData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{
                  backgroundColor:
                    index === 0 ? '#14b8a6' : index % 2 === 0 ? '#22c55e' : '#ef4444',
                }}
              ></div>
              <span>{item.fullName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
