"use client"

import { BalanceSheetReport } from "@/components/reports/balance-sheet-report"
import { TrialBalanceReport } from "@/components/reports/trial-balance-report"
import { DayBookReport } from "@/components/reports/day-book-report"

interface PrintPreviewProps {
  reportType: string
  date: Date
}

export function PrintPreview({ reportType, date }: PrintPreviewProps) {
  return (
    <div className="border rounded-md p-6 bg-white dark:bg-slate-950 min-h-[600px] shadow-sm">
      <div className="max-h-[600px] overflow-y-auto">
        {reportType === "balance-sheet" && <BalanceSheetReport date={date} />}
        {reportType === "trial-balance" && <TrialBalanceReport date={date} />}
        {reportType === "day-book" && <DayBookReport date={date} />}

        {reportType === "income-statement" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold">Micro Finance Organization</h2>
            <p className="text-muted-foreground">Income Statement</p>
            <p className="text-sm text-muted-foreground">
              For the period ending{" "}
              {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <div className="mt-8 text-muted-foreground">Income Statement preview will be displayed here</div>
          </div>
        )}

        {reportType === "cash-flow" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold">Micro Finance Organization</h2>
            <p className="text-muted-foreground">Cash Flow Statement</p>
            <p className="text-sm text-muted-foreground">
              For the period ending{" "}
              {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <div className="mt-8 text-muted-foreground">Cash Flow Statement preview will be displayed here</div>
          </div>
        )}

        {reportType === "loan-report" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold">Micro Finance Organization</h2>
            <p className="text-muted-foreground">Loan Report</p>
            <p className="text-sm text-muted-foreground">
              As of {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <div className="mt-8 text-muted-foreground">Loan Report preview will be displayed here</div>
          </div>
        )}

        {reportType === "member-savings" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold">Micro Finance Organization</h2>
            <p className="text-muted-foreground">Member Savings Report</p>
            <p className="text-sm text-muted-foreground">
              As of {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <div className="mt-8 text-muted-foreground">Member Savings Report preview will be displayed here</div>
          </div>
        )}
      </div>
    </div>
  )
}
