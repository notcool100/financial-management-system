"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface DayBookReportProps {
  date: Date
}

export function DayBookReport({ date }: DayBookReportProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Micro Finance Organization</h2>
        <p className="text-muted-foreground">Day Book</p>
        <p className="text-sm text-muted-foreground">
          For {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Entry ID</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Time</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Account</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Debit (₹)</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  JE-2023-001
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  09:15 AM
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  Purchase of office supplies
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Office Supplies</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">12,500</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">12,500</td>
              </tr>

              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  JE-2023-002
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  10:30 AM
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  Loan disbursement to Rajesh Kumar
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Loans Outstanding</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,50,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Bank</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,50,000</td>
              </tr>

              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  JE-2023-003
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  11:45 AM
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  Loan repayment from Priya Sharma
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">8,625</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Loans Outstanding</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">8,625</td>
              </tr>

              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  JE-2023-004
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  02:15 PM
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  Member savings deposit
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">15,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Member Savings</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">15,000</td>
              </tr>

              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  JE-2023-005
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  04:30 PM
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" rowSpan={2}>
                  Utility bill payment
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Utilities Expense</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">5,800</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">5,800</td>
              </tr>

              <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300" colSpan={4}>
                  Total
                </td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,91,925</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,91,925</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
