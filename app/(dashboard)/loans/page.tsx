"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanManagementTable } from "@/components/loans/loan-management-table"
import { CreditCard, Plus, TrendingDown } from "lucide-react"
import { useState } from "react"

export default function LoansPage() {
  const [addLoanOpen, setAddLoanOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Loan Management</h1>
          <p className="text-muted-foreground">Manage flat and diminishing loans</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddLoanOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Loan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LoanTypeCard
          title="Flat Rate Loans"
          description="Fixed interest rate throughout the loan term"
          icon={CreditCard}
          activeLoans={156}
          totalAmount="रू 76.5L"
          interestRate="13.5%"
          color="emerald"
        />
        <LoanTypeCard
          title="Diminishing Rate Loans"
          description="Interest calculated on outstanding principal"
          icon={TrendingDown}
          activeLoans={92}
          totalAmount="रू 48.2L"
          interestRate="11.75%"
          color="sky"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="flat">Flat Loans</TabsTrigger>
          <TabsTrigger value="diminishing">Diminishing Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <LoanManagementTable addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
        <TabsContent value="flat">
          <LoanManagementTable loanType="flat" addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
        <TabsContent value="diminishing">
          <LoanManagementTable loanType="diminishing" addLoanOpen={addLoanOpen} setAddLoanOpen={setAddLoanOpen} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoanTypeCard({
  title,
  description,
  icon: Icon,
  activeLoans,
  totalAmount,
  interestRate,
  color,
}: {
  title: string
  description: string
  icon: React.ElementType
  activeLoans: number
  totalAmount: string
  interestRate: string
  color: "emerald" | "sky"
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className={`rounded-full p-2 bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active Loans</span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeLoans}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Amount</span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalAmount}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Interest Rate</span>
            <p className={`text-xl font-bold text-${color}-600 dark:text-${color}-400`}>{interestRate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
