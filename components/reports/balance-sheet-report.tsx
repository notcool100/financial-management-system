"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { formatNepaliCurrency } from "@/lib/format"

interface BalanceSheetReportProps {
  date: Date
}

export function BalanceSheetReport({ date }: BalanceSheetReportProps) {
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
        <p className="text-muted-foreground">Balance Sheet</p>
        <p className="text-sm text-muted-foreground">
          As of {date.toLocaleDateString("ne-NP", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Assets */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Assets</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Current Assets</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Cash in Hand</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(45000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Cash at Bank</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(235000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Accounts Receivable</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(125000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Loans Outstanding</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(1250000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Interest Receivable</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(75000)}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2">Total Current Assets</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(1730000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Fixed Assets</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Furniture and Fixtures</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(250000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Office Equipment</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(175000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Vehicles</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(350000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Less: Accumulated Depreciation</td>
                    <td className="py-1 text-right">({formatNepaliCurrency(125000)})</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2">Total Fixed Assets</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(650000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="font-bold border-t border-b">
                    <td className="py-2">Total Assets</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(2380000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Liabilities and Equity */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Liabilities and Equity</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Current Liabilities</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Accounts Payable</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(85000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Member Savings</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(850000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Interest Payable</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(45000)}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2">Total Current Liabilities</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(980000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Long-term Liabilities</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Bank Loans</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(500000)}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2">Total Long-term Liabilities</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(500000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Equity</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Capital</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(750000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Retained Earnings</td>
                    <td className="py-1 text-right">{formatNepaliCurrency(150000)}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="py-2">Total Equity</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(900000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="font-bold border-t border-b">
                    <td className="py-2">Total Liabilities and Equity</td>
                    <td className="py-2 text-right">{formatNepaliCurrency(2380000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
