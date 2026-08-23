'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface ExpiryData {
  name: string
  value: number
  color: string
}

interface ExpiryChartProps {
  data: ExpiryData[]
  total: number
}

export default function ExpiryChart({ data, total }: ExpiryChartProps) {
  return (
    <div className="w-32 h-32 relative shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={58}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">Total</span>
        <span className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{total}</span>
      </div>
    </div>
  )
}
