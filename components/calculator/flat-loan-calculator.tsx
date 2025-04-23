"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function FlatLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(13.5)
  const [loanTenure, setLoanTenure] = useState(12)
  const [emi, setEmi] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  useEffect(() => {
    calculateFlatLoan()
  }, [loanAmount, interestRate, loanTenure])

  const calculateFlatLoan = () => {
    // In flat rate loans, interest is calculated on the full principal for the entire duration
    const totalInterestValue = (loanAmount * interestRate * loanTenure) / 1200 // convert years to months and percentage to decimal
    const totalPaymentValue = loanAmount + totalInterestValue
    const emiValue = totalPaymentValue / loanTenure

    setEmi(emiValue)
    setTotalInterest(totalInterestValue)
    setTotalPayment(totalPaymentValue)
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
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

        <Button onClick={calculateFlatLoan} className="w-full bg-emerald-600 hover:bg-emerald-700">
          Calculate
        </Button>
      </div>

      <div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium">Flat Loan Summary</h3>
                <p className="text-sm text-slate-500">Interest calculated on full principal</p>
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
                  <p className="text-sm text-slate-500">Interest Rate</p>
                  <p className="text-lg font-medium">{interestRate}% p.a.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Total Interest</p>
                  <p className="text-lg font-medium">{formatCurrency(totalInterest)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Total Payment</p>
                  <p className="text-lg font-medium">{formatCurrency(totalPayment)}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-slate-500">Monthly Breakup</p>
                <div className="mt-2 rounded-md border border-slate-200 dark:border-slate-700 p-3 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Principal</p>
                    <p className="text-sm font-medium">{formatCurrency(loanAmount / loanTenure)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Interest</p>
                    <p className="text-sm font-medium">{formatCurrency(totalInterest / loanTenure)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
