"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, Edit, Eye, MoreHorizontal, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNepaliCurrency } from "@/lib/format"
import { AddLoanDialog } from "./add-loan-dialog"

const loansData = [
  {
    id: "1",
    borrower: "Rajesh Kumar",
    loanType: "flat",
    amount: 250000,
    interestRate: 13.5,
    duration: "36 months",
    emi: 8450,
    disburseDate: "2023-03-15",
    status: "active",
  },
  {
    id: "2",
    borrower: "Priya Sharma",
    loanType: "diminishing",
    amount: 180000,
    interestRate: 11.75,
    duration: "24 months",
    emi: 8625,
    disburseDate: "2023-04-10",
    status: "active",
  },
  {
    id: "3",
    borrower: "Amit Singh",
    loanType: "flat",
    amount: 500000,
    interestRate: 13.5,
    duration: "48 months",
    emi: 14583,
    disburseDate: "2023-05-22",
    status: "active",
  },
  {
    id: "4",
    borrower: "Sunita Patel",
    loanType: "diminishing",
    amount: 325000,
    interestRate: 11.75,
    duration: "36 months",
    emi: 10747,
    disburseDate: "2023-06-05",
    status: "active",
  },
  {
    id: "5",
    borrower: "Rahul Verma",
    loanType: "flat",
    amount: 120000,
    interestRate: 13.5,
    duration: "24 months",
    emi: 6350,
    disburseDate: "2023-01-15",
    status: "closed",
  },
  {
    id: "6",
    borrower: "Deepika Reddy",
    loanType: "diminishing",
    amount: 275000,
    interestRate: 11.75,
    duration: "30 months",
    emi: 10868,
    disburseDate: "2023-07-20",
    status: "active",
  },
]

interface LoanManagementTableProps {
  loanType?: "flat" | "diminishing"
  addLoanOpen?: boolean
  setAddLoanOpen?: (open: boolean) => void
}

export function LoanManagementTable({ loanType, addLoanOpen = false, setAddLoanOpen }: LoanManagementTableProps) {
  const [loans, setLoans] = useState(loansData)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loanToEdit, setLoanToEdit] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loanToView, setLoanToView] = useState<any>(null)

  const filteredLoans = loanType ? loans.filter((loan) => loan.loanType === loanType) : loans

  const handleEditClick = (loan: any) => {
    setLoanToEdit({ ...loan })
    setEditDialogOpen(true)
  }

  const handleViewClick = (loan: any) => {
    setLoanToView({ ...loan })
    setViewDialogOpen(true)
  }

  const saveLoanEdit = () => {
    // Update the loan in the state
    setLoans(loans.map((loan) => (loan.id === loanToEdit.id ? loanToEdit : loan)))
    setEditDialogOpen(false)
    setLoanToEdit(null)
  }

  const handleLoanAdded = (newLoan: any) => {
    setLoans([...loans, newLoan])
  }

  return (
    <>
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Borrower</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Loan Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Interest Rate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">EMI</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${loan.borrower.charAt(0)}`}
                          alt={loan.borrower}
                        />
                        <AvatarFallback>{loan.borrower.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{loan.borrower}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Loan ID: {loan.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {loan.loanType === "flat" ? (
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      )}
                      <span className="text-slate-700 dark:text-slate-300 capitalize">{loan.loanType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {formatNepaliCurrency(loan.amount)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{loan.interestRate}%</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{loan.duration}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {formatNepaliCurrency(loan.emi)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={loan.status === "active" ? "success" : loan.status === "closed" ? "outline" : "warning"}
                    >
                      {loan.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleViewClick(loan)}>
                        <Eye className="h-4 w-4 text-slate-500" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(loan)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewClick(loan)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(loan)}>Edit Loan</DropdownMenuItem>
                          <DropdownMenuItem>Payment History</DropdownMenuItem>
                          <DropdownMenuItem>Generate Statement</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Loan Dialog */}
      {loanToEdit && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Loan</DialogTitle>
              <DialogDescription>Make changes to the loan information below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="borrower" className="text-right">
                  Borrower
                </Label>
                <Input
                  id="borrower"
                  value={loanToEdit.borrower}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, borrower: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="loanType" className="text-right">
                  Loan Type
                </Label>
                <Select
                  value={loanToEdit.loanType}
                  onValueChange={(value) => setLoanToEdit({ ...loanToEdit, loanType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="diminishing">Diminishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={loanToEdit.amount}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, amount: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interestRate" className="text-right">
                  Interest Rate (%)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={loanToEdit.interestRate}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, interestRate: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={loanToEdit.duration}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, duration: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emi" className="text-right">
                  EMI
                </Label>
                <Input
                  id="emi"
                  type="number"
                  value={loanToEdit.emi}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, emi: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="disburseDate" className="text-right">
                  Disburse Date
                </Label>
                <Input
                  id="disburseDate"
                  type="date"
                  value={loanToEdit.disburseDate}
                  onChange={(e) => setLoanToEdit({ ...loanToEdit, disburseDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={loanToEdit.status}
                  onValueChange={(value) => setLoanToEdit({ ...loanToEdit, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveLoanEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Loan Dialog */}
      {loanToView && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Loan Details</DialogTitle>
              <DialogDescription>Detailed information about the loan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Borrower</h4>
                  <p className="text-base">{loanToView.borrower}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Loan ID</h4>
                  <p className="text-base">{loanToView.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Loan Type</h4>
                  <p className="text-base capitalize">{loanToView.loanType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Status</h4>
                  <Badge
                    variant={
                      loanToView.status === "active"
                        ? "success"
                        : loanToView.status === "closed"
                          ? "outline"
                          : "warning"
                    }
                  >
                    {loanToView.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Amount</h4>
                  <p className="text-base font-medium">{formatNepaliCurrency(loanToView.amount)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Interest Rate</h4>
                  <p className="text-base">{loanToView.interestRate}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Duration</h4>
                  <p className="text-base">{loanToView.duration}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">EMI</h4>
                  <p className="text-base font-medium">{formatNepaliCurrency(loanToView.emi)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Disburse Date</h4>
                  <p className="text-base">{loanToView.disburseDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Total Repayment</h4>
                  <p className="text-base font-medium">
                    {formatNepaliCurrency(loanToView.emi * Number.parseInt(loanToView.duration))}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => handleEditClick(loanToView)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Loan
                </Button>
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Loan Dialog */}
      <AddLoanDialog open={addLoanOpen} onOpenChange={setAddLoanOpen || (() => {})} onLoanAdded={handleLoanAdded} />
    </>
  )
}
