"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PrintPreview } from "@/components/print/print-preview"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Printer } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function PrintPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [reportType, setReportType] = useState("balance-sheet")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Print Preview</h1>
        <p className="text-muted-foreground">Preview and print financial reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>Configure report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                  <SelectItem value="trial-balance">Trial Balance</SelectItem>
                  <SelectItem value="day-book">Day Book</SelectItem>
                  <SelectItem value="income-statement">Income Statement</SelectItem>
                  <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                  <SelectItem value="loan-report">Loan Report</SelectItem>
                  <SelectItem value="member-savings">Member Savings Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report Format</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Size</label>
              <Select defaultValue="a4">
                <SelectTrigger>
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex gap-2">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {reportType === "balance-sheet" && "Balance Sheet as of " + format(date, "PPP")}
              {reportType === "trial-balance" && "Trial Balance as of " + format(date, "PPP")}
              {reportType === "day-book" && "Day Book for " + format(date, "PPP")}
              {reportType === "income-statement" && "Income Statement for period ending " + format(date, "PPP")}
              {reportType === "cash-flow" && "Cash Flow Statement for period ending " + format(date, "PPP")}
              {reportType === "loan-report" && "Loan Report as of " + format(date, "PPP")}
              {reportType === "member-savings" && "Member Savings Report as of " + format(date, "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrintPreview reportType={reportType} date={date} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
