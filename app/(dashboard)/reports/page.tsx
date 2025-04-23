"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BalanceSheetReport } from "@/components/reports/balance-sheet-report"
import { TrialBalanceReport } from "@/components/reports/trial-balance-report"
import { DayBookReport } from "@/components/reports/day-book-report"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, Printer } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function ReportsPage() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view financial statements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="space-y-1 flex-1">
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

        <div className="space-y-1 flex-1">
          <label className="text-sm font-medium">Report Format</label>
          <Select defaultValue="detailed">
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="comparative">Comparative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-emerald-600 hover:bg-emerald-700">Generate Report</Button>
      </div>

      <Tabs defaultValue="balance-sheet" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="balance-sheet" className="flex-1 sm:flex-none">
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex-1 sm:flex-none">
            Trial Balance
          </TabsTrigger>
          <TabsTrigger value="day-book" className="flex-1 sm:flex-none">
            Day Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>Statement of financial position as of {format(date, "PPP")}</CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceSheetReport date={date} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>Summary of all ledger accounts as of {format(date, "PPP")}</CardDescription>
            </CardHeader>
            <CardContent>
              <TrialBalanceReport date={date} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day-book">
          <Card>
            <CardHeader>
              <CardTitle>Day Book</CardTitle>
              <CardDescription>Daily transaction record for {format(date, "PPP")}</CardDescription>
            </CardHeader>
            <CardContent>
              <DayBookReport date={date} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
