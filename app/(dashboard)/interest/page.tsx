"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InterestRatesTable } from "@/components/interest/interest-rates-table"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function InterestPage() {
  const [addRateOpen, setAddRateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Interest Management</h1>
          <p className="text-muted-foreground">Manage interest rates for different account types</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddRateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Rate
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <InterestTypeCard
          title="Sadaran Bachat (SB)"
          description="Regular savings accounts with standard interest rates"
          currentRate="5.5%"
          lastUpdated="24 Apr 2023"
        />
        <InterestTypeCard
          title="Baal Bachat (BB)"
          description="Children savings accounts with higher interest rates"
          currentRate="6.25%"
          lastUpdated="15 May 2023"
        />
        <InterestTypeCard
          title="Masik Bachat (MB)"
          description="Monthly deposit scheme with competitive rates"
          currentRate="7.0%"
          lastUpdated="02 Jun 2023"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Rates</TabsTrigger>
          <TabsTrigger value="sb">Sadaran Bachat</TabsTrigger>
          <TabsTrigger value="bb">Baal Bachat</TabsTrigger>
          <TabsTrigger value="mb">Masik Bachat</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <InterestRatesTable addRateOpen={addRateOpen} setAddRateOpen={setAddRateOpen} />
        </TabsContent>
        <TabsContent value="sb">
          <InterestRatesTable accountType="SB" addRateOpen={addRateOpen} setAddRateOpen={setAddRateOpen} />
        </TabsContent>
        <TabsContent value="bb">
          <InterestRatesTable accountType="BB" addRateOpen={addRateOpen} setAddRateOpen={setAddRateOpen} />
        </TabsContent>
        <TabsContent value="mb">
          <InterestRatesTable accountType="MB" addRateOpen={addRateOpen} setAddRateOpen={setAddRateOpen} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InterestTypeCard({
  title,
  description,
  currentRate,
  lastUpdated,
}: {
  title: string
  description: string
  currentRate: string
  lastUpdated: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Rate:</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{currentRate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Updated:</span>
            <span className="text-sm text-slate-700 dark:text-slate-300">{lastUpdated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
