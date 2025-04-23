"use client"

import { useState } from "react"
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
import { Loader2, Percent } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface AddInterestRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRateAdded: (rate: any) => void
}

export function AddInterestRateDialog({ open, onOpenChange, onRateAdded }: AddInterestRateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMaxBalance, setHasMaxBalance] = useState(false)
  const [newRate, setNewRate] = useState({
    accountType: "SB",
    interestRate: 5.5,
    minBalance: 1000,
    maxBalance: null,
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    status: "upcoming",
  })

  const handleInputChange = (field: string, value: string | number | null) => {
    setNewRate({ ...newRate, [field]: value })
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const rate = {
        ...newRate,
        id: `${Date.now()}`, // Generate a unique ID
      }

      onRateAdded(rate)
      setIsSubmitting(false)
      onOpenChange(false)

      // Reset form
      setNewRate({
        accountType: "SB",
        interestRate: 5.5,
        minBalance: 1000,
        maxBalance: null,
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        status: "upcoming",
      })
      setHasMaxBalance(false)
    }, 1000)
  }

  // Calculate default effective to date (6 months from now)
  const defaultEffectiveTo = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 6)
    return date.toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Interest Rate</DialogTitle>
          <DialogDescription>Set up a new interest rate for an account type.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Percent className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">Interest Rate Details</h3>
              <p className="text-sm text-muted-foreground">Configure the new interest rate parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select value={newRate.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SB">Sadaran Bachat</SelectItem>
                  <SelectItem value="BB">Baal Bachat</SelectItem>
                  <SelectItem value="MB">Masik Bachat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="5.5"
                value={newRate.interestRate}
                onChange={(e) => handleInputChange("interestRate", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minBalance">Minimum Balance</Label>
              <Input
                id="minBalance"
                type="number"
                placeholder="1000"
                value={newRate.minBalance}
                onChange={(e) => handleInputChange("minBalance", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxBalance">Maximum Balance</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="max-balance-limit" checked={hasMaxBalance} onCheckedChange={setHasMaxBalance} />
                  <Label htmlFor="max-balance-limit" className="text-xs">
                    Has Limit
                  </Label>
                </div>
              </div>
              <Input
                id="maxBalance"
                type="number"
                placeholder="No Limit"
                disabled={!hasMaxBalance}
                value={hasMaxBalance ? newRate.maxBalance || "" : ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : Number(e.target.value)
                  handleInputChange("maxBalance", value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={newRate.effectiveFrom}
                onChange={(e) => handleInputChange("effectiveFrom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveTo">Effective To</Label>
              <Input
                id="effectiveTo"
                type="date"
                value={newRate.effectiveTo || defaultEffectiveTo()}
                onChange={(e) => handleInputChange("effectiveTo", e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newRate.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger id="status">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Interest Rate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
