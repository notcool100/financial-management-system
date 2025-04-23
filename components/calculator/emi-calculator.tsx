"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { formatNepaliCurrency } from "@/lib/format"

export function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(10)
  const [loanTenure, setLoanTenure] = useState(12)
  const [emi, setEmi] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, loanTenure])

  const calculateEMI = () => {
    // Convert annual interest rate to monthly rate and decimal form
    const monthlyRate = interestRate / 12 / 100

    // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emiValue =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) / (Math.pow(1 + monthlyRate, loanTenure) - 1)

    const totalPaymentValue = emiValue * loanTenure
    const totalInterestValue = totalPaymentValue - loanAmount

    setEmi(Number.isNaN(emiValue) ? 0 : emiValue)
    setTotalInterest(Number.isNaN(totalInterestValue) ? 0 : totalInterestValue)
    setTotalPayment(Number.isNaN(totalPaymentValue) ? 0 : totalPaymentValue)
  }

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const parsedValue = Number.parseFloat(value)
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setter(parsedValue)
    }
  }

  const chartData = [
    { name: "Principal", value: loanAmount },
    { name: "Interest", value: totalInterest },
  ]

  const COLORS = ["#10b981", "#8b5cf6"]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <span className="text-sm font-medium">{formatNepaliCurrency(loanAmount)}</span>
          </div>
          <div className="space-y-3">
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => handleInputChange(setLoanAmount, e.target.value)}
              min={0}
              step={1000}
            />
            <Slider
              value={[loanAmount]}
              min={10000}
              max={10000000}
              step={1000}
              onValueChange={(value) => setLoanAmount(value[0])}
              aria-label="Loan Amount"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>रू 10K</span>
              <span>रू 1Cr</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <span className="text-sm font-medium">{interestRate}%</span>
          </div>
          <div className="space-y-3">
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => handleInputChange(setInterestRate, e.target.value)}
              min={1}
              max={30}
              step={0.1}
            />
            <Slider
              value={[interestRate]}
              min={1}
              max={30}
              step={0.1}
              onValueChange={(value) => setInterestRate(value[0])}
              aria-label="Interest Rate"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="loanTenure">Loan Tenure (months)</Label>
            <span className="text-sm font-medium">{loanTenure} months</span>
          </div>
          <div className="space-y-3">
            <Input
              id="loanTenure"
              type="number"
              value={loanTenure}
              onChange={(e) => handleInputChange(setLoanTenure, e.target.value)}
              min={1}
              max={360}
              step={1}
            />
            <Slider
              value={[loanTenure]}
              min={1}
              max={120}
              step={1}
              onValueChange={(value) => setLoanTenure(value[0])}
              aria-label="Loan Tenure"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 month</span>
              <span>10 years</span>
            </div>
          </div>
        </div>

        <Button onClick={calculateEMI} className="w-full bg-emerald-600 hover:bg-emerald-700">
          Calculate EMI
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly EMI</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatNepaliCurrency(emi)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Interest</p>
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {formatNepaliCurrency(totalInterest)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Payment</p>
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {formatNepaliCurrency(totalPayment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNepaliCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
