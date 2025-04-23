"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface TrialBalanceReportProps {
  date: Date
}

export function TrialBalanceReport({ date }: TrialBalanceReportProps) {
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
        <p className="text-muted-foreground">Trial Balance</p>
        <p className="text-sm text-muted-foreground">
          As of {date.toLocaleDateString("ne-NP", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Account</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Debit (रू)</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Credit (रू)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash in Hand</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">45,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Cash at Bank</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,35,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Accounts Receivable</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">1,25,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Loans Outstanding</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">12,50,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Interest Receivable</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">75,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Furniture and Fixtures</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">2,50,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Office Equipment</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">1,75,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Vehicles</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">3,50,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Accumulated Depreciation</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">1,25,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Accounts Payable</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">85,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Member Savings</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">8,50,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Interest Payable</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">45,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Bank Loans</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">5,00,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Capital</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">7,50,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Retained Earnings</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300"></td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">1,50,000</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">Total</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">25,05,000</td>
                <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">25,05,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
