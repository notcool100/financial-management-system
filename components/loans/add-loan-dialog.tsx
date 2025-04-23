"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, TrendingDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNepaliCurrency } from "@/lib/format"

interface AddLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoanAdded: (loan: any) => void
}

export function AddLoanDialog({ open, onOpenChange, onLoanAdded }: AddLoanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loanType, setLoanType] = useState<"flat" | "diminishing">("flat")
  const [newLoan, setNewLoan] = useState({
    borrower: "",
    loanType: "flat",
    amount: 100000,
    interestRate: 13.5,
    duration: "12 months",
    emi: 0,
    disburseDate: new Date().toISOString().split("T")[0],
    status: "active",
  })

  // Calculate EMI whenever amount, interestRate, or duration changes
  useEffect(() => {
    calculateEMI()
  }, [newLoan.amount, newLoan.interestRate, newLoan.duration, newLoan.loanType])

  const calculateEMI = () => {
    const principal = newLoan.amount
    const rate = newLoan.interestRate / 100 / 12 // Monthly interest rate
    const time = Number.parseInt(newLoan.duration.split(" ")[0]) // Duration

    let emi = 0

    if (newLoan.loanType === "flat") {
      // For flat rate: EMI = (P + (P * r * t)) / n
      // Where P = principal, r = annual interest rate, t = time in years, n = number of installments
      const totalInterest = principal * (newLoan.interestRate / 100) * (time / 12)
      emi = (principal + totalInterest) / time
    } else {
      // For diminishing rate: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
      if (rate > 0) {
        emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      } else {
        emi = principal / time
      }
    }

    setNewLoan({ ...newLoan, emi: Math.round(emi) })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setNewLoan({ ...newLoan, [field]: value })

    if (field === "loanType") {
      setLoanType(value as "flat" | "diminishing")
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const loan = {
        ...newLoan,
        id: `${Date.now()}`, // Generate a unique ID
      }

      onLoanAdded(loan)
      setIsSubmitting(false)
      onOpenChange(false)

      // Reset form
      setNewLoan({
        borrower: "",
        loanType: "flat",
        amount: 100000,
        interestRate: 13.5,
        duration: "12 months",
        emi: 0,
        disburseDate: new Date().toISOString().split("T")[0],
        status: "active",
      })
      setLoanType("flat")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>Fill in the details to create a new loan.</DialogDescription>
        </DialogHeader>

        <Tabs value={loanType} onValueChange={(value) => handleInputChange("loanType", value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flat" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Flat Rate Loan
            </TabsTrigger>
            <TabsTrigger value="diminishing" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Diminishing Rate Loan
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="borrower">Borrower Name</Label>
                <Input
                  id="borrower"
                  placeholder="Enter borrower name"
                  value={newLoan.borrower}
                  onChange={(e) => handleInputChange("borrower", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={newLoan.amount}
                  onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  placeholder="13.5"
                  value={newLoan.interestRate}
                  onChange={(e) => handleInputChange("interestRate", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={newLoan.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12 months">12 months</SelectItem>
                    <SelectItem value="24 months">24 months</SelectItem>
                    <SelectItem value="36 months">36 months</SelectItem>
                    <SelectItem value="48 months">48 months</SelectItem>
                    <SelectItem value="60 months">60 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disburseDate">Disburse Date</Label>
                <Input
                  id="disburseDate"
                  type="date"
                  value={newLoan.disburseDate}
                  onChange={(e) => handleInputChange("disburseDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newLoan.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 p-4 border rounded-md bg-slate-50 dark:bg-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Calculated EMI</h3>
                  <p className="text-xs text-muted-foreground">Monthly installment amount</p>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNepaliCurrency(newLoan.emi)}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Repayment</p>
                  <p className="text-sm font-medium">
                    {formatNepaliCurrency(newLoan.emi * Number.parseInt(newLoan.duration.split(" ")[0]))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="text-sm font-medium">
                    {formatNepaliCurrency(
                      newLoan.emi * Number.parseInt(newLoan.duration.split(" ")[0]) - newLoan.amount,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newLoan.borrower}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Loan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
