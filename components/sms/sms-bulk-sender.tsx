"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, CheckCircle, Users } from "lucide-react"

export function SMSBulkSender() {
  const [recipients, setRecipients] = useState<string>("all")
  const [message, setMessage] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPreview(true)
  }

  const sendMessages = () => {
    setShowPreview(false)
    setShowConfirmation(true)
    // Reset form after sending
    setTimeout(() => {
      setMessage("")
      setRecipients("all")
      setShowConfirmation(false)
    }, 3000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipients">Select Recipients</Label>
            <Select value={recipients} onValueChange={setRecipients}>
              <SelectTrigger id="recipients">
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active-loans">Active Loan Customers</SelectItem>
                <SelectItem value="due-payments">Customers with Due Payments</SelectItem>
                <SelectItem value="overdue-payments">Customers with Overdue Payments</SelectItem>
                <SelectItem value="sb">Sadaran Bachat Customers</SelectItem>
                <SelectItem value="bb">Baal Bachat Customers</SelectItem>
                <SelectItem value="mb">Masik Bachat Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <span className="text-xs text-slate-500">Characters: {message.length}/160</span>
            </div>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Variables</Label>
            <div className="flex flex-wrap gap-2">
              {["name", "account_id", "loan_id", "amount", "date", "balance"].map((variable) => (
                <Button
                  key={variable}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(message + `{${variable}}`)}
                >
                  {`{${variable}}`}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Click on a variable to add it to your message. These will be replaced with actual customer data when sent.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Preview & Send
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-lg font-medium mb-2">Recipient Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Selected Group:</span>
              <span className="text-sm font-medium capitalize">{recipients.replace(/-/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Estimated Recipients:</span>
              <span className="text-sm font-medium">
                {recipients === "all"
                  ? "3,456"
                  : recipients === "active-loans"
                    ? "248"
                    : recipients === "due-payments"
                      ? "86"
                      : recipients === "overdue-payments"
                        ? "32"
                        : recipients === "sb"
                          ? "1,850"
                          : recipients === "bb"
                            ? "720"
                            : "886"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Estimated Credits:</span>
              <span className="text-sm font-medium">
                {recipients === "all"
                  ? "3,456"
                  : recipients === "active-loans"
                    ? "248"
                    : recipients === "due-payments"
                      ? "86"
                      : recipients === "overdue-payments"
                        ? "32"
                        : recipients === "sb"
                          ? "1,850"
                          : recipients === "bb"
                            ? "720"
                            : "886"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-lg font-medium mb-2">Sending Tips</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Keep messages concise and under 160 characters when possible.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Include clear call-to-action for better customer response.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Avoid sending messages during odd hours (before 8 AM or after 9 PM).</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Always include opt-out instructions for marketing messages.</span>
            </li>
          </ul>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview SMS</DialogTitle>
            <DialogDescription>Review your message before sending</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Message Preview:</span>
                </div>
                <p className="text-sm">
                  {message.replace(/{(\w+)}/g, (match, variable) => {
                    switch (variable) {
                      case "name":
                        return "Customer Name"
                      case "account_id":
                        return "AC123456"
                      case "loan_id":
                        return "L789012"
                      case "amount":
                        return "₹8,450"
                      case "date":
                        return "15th Sep 2023"
                      case "balance":
                        return "₹42,500"
                      default:
                        return match
                    }
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Users className="h-4 w-4" />
              <p className="text-sm">
                This message will be sent to{" "}
                <strong>
                  {recipients === "all"
                    ? "3,456"
                    : recipients === "active-loans"
                      ? "248"
                      : recipients === "due-payments"
                        ? "86"
                        : recipients === "overdue-payments"
                          ? "32"
                          : recipients === "sb"
                            ? "1,850"
                            : recipients === "bb"
                              ? "720"
                              : "886"}
                </strong>{" "}
                recipients.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Edit Message
            </Button>
            <Button onClick={sendMessages} className="bg-emerald-600 hover:bg-emerald-700">
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-16 w-16 text-emerald-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Messages Sent!</h2>
            <p className="text-center text-slate-500 dark:text-slate-400">
              Your messages have been queued and will be delivered shortly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
