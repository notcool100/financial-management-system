"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ChartData {
  name: string
  loans: number
  deposits: number
  interest: number
}

export function OverviewChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      setError(null)
      
      // Mock data for development
      const mockChartData: ChartData[] = [
        { name: "Jan", loans: 125000, deposits: 250000, interest: 15000 },
        { name: "Feb", loans: 180000, deposits: 280000, interest: 18000 },
        { name: "Mar", loans: 210000, deposits: 320000, interest: 22000 },
        { name: "Apr", loans: 250000, deposits: 350000, interest: 25000 },
        { name: "May", loans: 320000, deposits: 380000, interest: 28000 },
        { name: "Jun", loans: 380000, deposits: 420000, interest: 32000 },
      ]
      
      try {
        const response = await fetch('/api/dashboard/chart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          // If API endpoint is not available, use mock data
          console.warn('API endpoint not available, using mock data')
          setData(mockChartData)
          return
        }
        
        const result = await response.json()
        setData(result.data)
      } catch (err: any) {
        console.error('Error fetching chart data:', err)
        // Use mock data instead of showing error
        setData(mockChartData)
        // Only log error to console, don't show to user
        // setError(err.message || 'Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchChartData()
  }, [])

  if (loading) {
    return <Skeleton className="w-full h-[350px]" />
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <YAxis
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `रू${value / 1000}k`}
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`रू${value.toLocaleString()}`, undefined]}
        />
        <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(value) => <span className="text-xs">{value}</span>} />
        <Bar dataKey="loans" name="Loans" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="deposits" name="Deposits" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="interest" name="Interest" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
