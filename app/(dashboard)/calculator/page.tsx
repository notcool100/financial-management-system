import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmiCalculator } from "@/components/calculator/emi-calculator"
import { FlatLoanCalculator } from "@/components/calculator/flat-loan-calculator"
import { DiminishingLoanCalculator } from "@/components/calculator/diminishing-loan-calculator"

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Loan Calculator</h1>
        <p className="text-muted-foreground">Calculate EMI for different loan types</p>
      </div>

      <Tabs defaultValue="emi" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="emi" className="flex-1 sm:flex-none">
            EMI Calculator
          </TabsTrigger>
          <TabsTrigger value="flat" className="flex-1 sm:flex-none">
            Flat Loan
          </TabsTrigger>
          <TabsTrigger value="diminishing" className="flex-1 sm:flex-none">
            Diminishing Loan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emi">
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>EMI Calculator</CardTitle>
                <CardDescription>Calculate Equated Monthly Installment for your loan</CardDescription>
              </CardHeader>
              <CardContent>
                <EmiCalculator />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Key Information</CardTitle>
                <CardDescription>Understanding EMI calculations</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <p>
                  <strong>EMI (Equated Monthly Installment)</strong> is the fixed amount paid by a borrower to a lender
                  at a specified date each month. EMIs are used to pay off both interest and principal each month so
                  that over a specified time period, the loan is paid off in full.
                </p>
                <p>The EMI formula is:</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
                  <p className="font-mono">EMI = [P × r × (1 + r)^n] ÷ [(1 + r)^n - 1]</p>
                </div>
                <p>Where:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>P = Principal loan amount</li>
                  <li>r = Monthly interest rate (Annual rate ÷ 12 ÷ 100)</li>
                  <li>n = Loan tenure in months</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flat">
          <Card>
            <CardHeader>
              <CardTitle>Flat Rate Loan Calculator</CardTitle>
              <CardDescription>Calculate total interest and EMI for flat rate loans</CardDescription>
            </CardHeader>
            <CardContent>
              <FlatLoanCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diminishing">
          <Card>
            <CardHeader>
              <CardTitle>Diminishing Balance Loan Calculator</CardTitle>
              <CardDescription>Calculate interest on reducing principal amount</CardDescription>
            </CardHeader>
            <CardContent>
              <DiminishingLoanCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
