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
import { Loader2, Percent, AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InterestRate {
  id: string
  account_type: "SB" | "BB" | "MB"
  interest_rate: number
  min_balance: number
  max_balance: number | null
  effective_from: string
  effective_to: string
  status: "active" | "upcoming" | "expired"
  created_at: string
  updated_at: string
}

interface AddInterestRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRateAdded: (rate: InterestRate) => void
}

export function AddInterestRateDialog({ open, onOpenChange, onRateAdded }: AddInterestRateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMaxBalance, setHasMaxBalance] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRate, setNewRate] = useState({
    account_type: "SB",
    interest_rate: 5.5,
    min_balance: 1000,
    max_balance: null as number | null,
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
    status: "upcoming" as "active" | "upcoming" | "expired",
  })

  const handleInputChange = (field: string, value: string | number | null) => {
    setNewRate({ ...newRate, [field]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Make sure effective_to is set
      if (!newRate.effective_to) {
        newRate.effective_to = defaultEffectiveTo()
      }

      const response = await fetch('/api/interest/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRate)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create interest rate')
      }
      
      const data = await response.json()
      onRateAdded(data.rate)
      onOpenChange(false)

      // Reset form
      setNewRate({
        account_type: "SB",
        interest_rate: 5.5,
        min_balance: 1000,
        max_balance: null,
        effective_from: new Date().toISOString().split("T")[0],
        effective_to: "",
        status: "upcoming",
      })
      setHasMaxBalance(false)
    } catch (err: any) {
      console.error('Error creating interest rate:', err)
      setError(err.message || 'Failed to create interest rate')
    } finally {
      setIsSubmitting(false)
    }
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
              <Label htmlFor="account_type">Account Type</Label>
              <Select value={newRate.account_type} onValueChange={(value) => handleInputChange("account_type", value)}>
                <SelectTrigger id="account_type">
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
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                placeholder="5.5"
                value={newRate.interest_rate}
                onChange={(e) => handleInputChange("interest_rate", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_balance">Minimum Balance</Label>
              <Input
                id="min_balance"
                type="number"
                placeholder="1000"
                value={newRate.min_balance}
                onChange={(e) => handleInputChange("min_balance", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="max_balance">Maximum Balance</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="max-balance-limit" checked={hasMaxBalance} onCheckedChange={setHasMaxBalance} />
                  <Label htmlFor="max-balance-limit" className="text-xs">
                    Has Limit
                  </Label>
                </div>
              </div>
              <Input
                id="max_balance"
                type="number"
                placeholder="No Limit"
                disabled={!hasMaxBalance}
                value={hasMaxBalance ? newRate.max_balance || "" : ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : Number(e.target.value)
                  handleInputChange("max_balance", value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_from">Effective From</Label>
              <Input
                id="effective_from"
                type="date"
                value={newRate.effective_from}
                onChange={(e) => handleInputChange("effective_from", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_to">Effective To</Label>
              <Input
                id="effective_to"
                type="date"
                value={newRate.effective_to || defaultEffectiveTo()}
                onChange={(e) => handleInputChange("effective_to", e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newRate.status} 
                onValueChange={(value: "active" | "upcoming" | "expired") => 
                  handleInputChange("status", value)
                }
              >
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !newRate.interest_rate || !newRate.min_balance || !newRate.effective_from} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
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
