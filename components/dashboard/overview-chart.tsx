"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", loans: 4000, deposits: 2400, interest: 1500 },
  { name: "Feb", loans: 3000, deposits: 2800, interest: 1600 },
  { name: "Mar", loans: 2000, deposits: 3800, interest: 1900 },
  { name: "Apr", loans: 2780, deposits: 3908, interest: 2000 },
  { name: "May", loans: 1890, deposits: 4800, interest: 2200 },
  { name: "Jun", loans: 2390, deposits: 3800, interest: 2100 },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <YAxis
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(value) => <span className="text-xs">{value}</span>} />
        <Bar dataKey="loans" name="Loans" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="deposits" name="Deposits" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="interest" name="Interest" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
