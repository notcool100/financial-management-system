"use client"

import { useState } from "react"
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
import { Edit, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNepaliCurrency } from "@/lib/format"
import { AddInterestRateDialog } from "./add-interest-rate-dialog"

const interestRatesData = [
  {
    id: "1",
    accountType: "SB",
    interestRate: 5.5,
    minBalance: 1000,
    maxBalance: null, // No Limit
    effectiveFrom: "2023-04-01",
    effectiveTo: "2023-12-31",
    status: "active",
  },
  {
    id: "2",
    accountType: "BB",
    interestRate: 6.25,
    minBalance: 500,
    maxBalance: 100000,
    effectiveFrom: "2023-05-01",
    effectiveTo: "2023-12-31",
    status: "active",
  },
  {
    id: "3",
    accountType: "MB",
    interestRate: 7.0,
    minBalance: 5000,
    maxBalance: null, // No Limit
    effectiveFrom: "2023-06-01",
    effectiveTo: "2023-12-31",
    status: "active",
  },
  {
    id: "4",
    accountType: "SB",
    interestRate: 5.0,
    minBalance: 1000,
    maxBalance: null, // No Limit
    effectiveFrom: "2023-01-01",
    effectiveTo: "2023-03-31",
    status: "expired",
  },
  {
    id: "5",
    accountType: "BB",
    interestRate: 6.0,
    minBalance: 500,
    maxBalance: 100000,
    effectiveFrom: "2023-01-01",
    effectiveTo: "2023-04-30",
    status: "expired",
  },
  {
    id: "6",
    accountType: "MB",
    interestRate: 6.75,
    minBalance: 5000,
    maxBalance: null, // No Limit
    effectiveFrom: "2023-01-01",
    effectiveTo: "2023-05-31",
    status: "expired",
  },
  {
    id: "7",
    accountType: "SB",
    interestRate: 5.75,
    minBalance: 1000,
    maxBalance: null, // No Limit
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-06-30",
    status: "upcoming",
  },
]

interface InterestRatesTableProps {
  accountType?: "SB" | "BB" | "MB"
  addRateOpen?: boolean
  setAddRateOpen?: (open: boolean) => void
}

export function InterestRatesTable({ accountType, addRateOpen = false, setAddRateOpen }: InterestRatesTableProps) {
  const [rates, setRates] = useState(interestRatesData)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [rateToEdit, setRateToEdit] = useState<any>(null)

  const filteredRates = accountType ? rates.filter((rate) => rate.accountType === accountType) : rates

  const handleEditClick = (rate: any) => {
    setRateToEdit({ ...rate })
    setEditDialogOpen(true)
  }

  const saveRateEdit = () => {
    // Update the rate in the state
    setRates(rates.map((rate) => (rate.id === rateToEdit.id ? rateToEdit : rate)))
    setEditDialogOpen(false)
    setRateToEdit(null)
  }

  const handleRateAdded = (newRate: any) => {
    setRates([...rates, newRate])
  }

  return (
    <>
      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Account Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Interest Rate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Min Balance</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Max Balance</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Effective From</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Effective To</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate) => (
                <tr
                  key={rate.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs font-normal">
                      {rate.accountType === "SB"
                        ? "Sadaran Bachat"
                        : rate.accountType === "BB"
                          ? "Baal Bachat"
                          : "Masik Bachat"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">{rate.interestRate}%</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {formatNepaliCurrency(rate.minBalance)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {rate.maxBalance ? formatNepaliCurrency(rate.maxBalance) : "No Limit"}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rate.effectiveFrom}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rate.effectiveTo}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        rate.status === "active" ? "success" : rate.status === "upcoming" ? "warning" : "outline"
                      }
                    >
                      {rate.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(rate)}>
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
                          <DropdownMenuItem onClick={() => handleEditClick(rate)}>Edit Rate</DropdownMenuItem>
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
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

      {/* Edit Interest Rate Dialog */}
      {rateToEdit && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Interest Rate</DialogTitle>
              <DialogDescription>Make changes to the interest rate information below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountType" className="text-right">
                  Account Type
                </Label>
                <Select
                  value={rateToEdit.accountType}
                  onValueChange={(value) => setRateToEdit({ ...rateToEdit, accountType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SB">Sadaran Bachat</SelectItem>
                    <SelectItem value="BB">Baal Bachat</SelectItem>
                    <SelectItem value="MB">Masik Bachat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interestRate" className="text-right">
                  Interest Rate (%)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={rateToEdit.interestRate}
                  onChange={(e) => setRateToEdit({ ...rateToEdit, interestRate: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minBalance" className="text-right">
                  Min Balance
                </Label>
                <Input
                  id="minBalance"
                  type="number"
                  value={rateToEdit.minBalance}
                  onChange={(e) => setRateToEdit({ ...rateToEdit, minBalance: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxBalance" className="text-right">
                  Max Balance
                </Label>
                <Input
                  id="maxBalance"
                  type="number"
                  value={rateToEdit.maxBalance || ""}
                  placeholder="Leave empty for no limit"
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : Number(e.target.value)
                    setRateToEdit({ ...rateToEdit, maxBalance: value })
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="effectiveFrom" className="text-right">
                  Effective From
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={rateToEdit.effectiveFrom}
                  onChange={(e) => setRateToEdit({ ...rateToEdit, effectiveFrom: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="effectiveTo" className="text-right">
                  Effective To
                </Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={rateToEdit.effectiveTo}
                  onChange={(e) => setRateToEdit({ ...rateToEdit, effectiveTo: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={rateToEdit.status}
                  onValueChange={(value) => setRateToEdit({ ...rateToEdit, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveRateEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Interest Rate Dialog */}
      <AddInterestRateDialog
        open={addRateOpen}
        onOpenChange={setAddRateOpen || (() => {})}
        onRateAdded={handleRateAdded}
      />
    </>
  )
}
