"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

export function DiminishingLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(11.75)
  const [loanTenure, setLoanTenure] = useState(12)
  const [emi, setEmi] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [amortizationData, setAmortizationData] = useState<any[]>([])

  useEffect(() => {
    calculateDiminishingLoan()
  }, [loanAmount, interestRate, loanTenure])

  const calculateDiminishingLoan = () => {
    // Convert annual interest rate to monthly rate and decimal form
    const monthlyRate = interestRate / 12 / 100

    // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emiValue =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) / (Math.pow(1 + monthlyRate, loanTenure) - 1)

    let outstandingPrincipal = loanAmount
    let totalInterestValue = 0
    const amortizationSchedule = []

    for (let i = 1; i <= loanTenure; i++) {
      const interestForMonth = outstandingPrincipal * monthlyRate
      const principalForMonth = emiValue - interestForMonth

      totalInterestValue += interestForMonth
      outstandingPrincipal -= principalForMonth

      amortizationSchedule.push({
        month: i,
        emi: emiValue,
        principal: principalForMonth,
        interest: interestForMonth,
        outstandingPrincipal: outstandingPrincipal > 0 ? outstandingPrincipal : 0,
      })
    }

    setEmi(emiValue)
    setTotalInterest(totalInterestValue)
    setTotalPayment(loanAmount + totalInterestValue)
    setAmortizationData(amortizationSchedule)
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  }

  // Display only a subset of months for the chart
  const displayData = amortizationData.filter(
    (_, index) => loanTenure <= 12 || index % Math.ceil(loanTenure / 12) === 0,
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min={0}
              step={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min={1}
              max={30}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTenure">Loan Tenure (months)</Label>
            <Input
              id="loanTenure"
              type="number"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              min={1}
              max={360}
              step={1}
            />
          </div>

          <Button onClick={calculateDiminishingLoan} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Calculate
          </Button>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Loan Summary</h3>
                    <p className="text-sm text-slate-500">Interest calculated on reducing principal</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Monthly EMI</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(emi)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Principal</p>
                      <p className="text-lg font-medium">{formatCurrency(loanAmount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Total Interest</p>
                      <p className="text-lg font-medium">{formatCurrency(totalInterest)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Total Payment</p>
                      <p className="text-lg font-medium">{formatCurrency(totalPayment)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Interest Rate</p>
                      <p className="text-lg font-medium">{interestRate}% p.a.</p>
                    </div>
                  </div>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: 0 }} />
                      <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="outstandingPrincipal" stroke="#10b981" name="Principal" />
                      <Line type="monotone" dataKey="interest" stroke="#8b5cf6" name="Interest" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Amortization Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 font-medium text-slate-500 dark:text-slate-400">Month</th>
                  <th className="text-left py-2 px-4 font-medium text-slate-500 dark:text-slate-400">EMI</th>
                  <th className="text-left py-2 px-4 font-medium text-slate-500 dark:text-slate-400">Principal</th>
                  <th className="text-left py-2 px-4 font-medium text-slate-500 dark:text-slate-400">Interest</th>
                  <th className="text-left py-2 px-4 font-medium text-slate-500 dark:text-slate-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amortizationData.slice(0, 12).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-4">{item.month}</td>
                    <td className="py-2 px-4">{formatCurrency(item.emi)}</td>
                    <td className="py-2 px-4">{formatCurrency(item.principal)}</td>
                    <td className="py-2 px-4">{formatCurrency(item.interest)}</td>
                    <td className="py-2 px-4">{formatCurrency(item.outstandingPrincipal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
