"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, SendHorizontal, Copy } from "lucide-react"

const templatesData = [
  {
    id: "1",
    name: "Payment Reminder",
    template:
      "Dear {name}, your EMI payment of {amount} for loan {loan_id} is due on {date}. Please make the payment on time to avoid late fees.",
    type: "reminder",
    status: "active",
    lastUsed: "2023-08-15",
  },
  {
    id: "2",
    name: "Welcome Message",
    template:
      "Welcome to our Micro Finance family, {name}! Your account {account_id} has been successfully created. Contact us at {helpline} for any assistance.",
    type: "onboarding",
    status: "active",
    lastUsed: "2023-08-10",
  },
  {
    id: "3",
    name: "Late Payment Notice",
    template:
      "Dear {name}, your EMI payment of {amount} for loan {loan_id} is overdue by {days} days. Please make the payment immediately to avoid penalty charges.",
    type: "reminder",
    status: "active",
    lastUsed: "2023-08-12",
  },
  {
    id: "4",
    name: "Loan Approval",
    template:
      "Congratulations {name}! Your loan application of {amount} has been approved. Loan amount will be credited to your account {account_id} within 24 hours.",
    type: "notification",
    status: "active",
    lastUsed: "2023-08-05",
  },
  {
    id: "5",
    name: "Account Statement",
    template:
      "Dear {name}, your monthly account statement for {month} is ready. Current balance: {balance}. For details, please visit our office or check the app.",
    type: "statement",
    status: "inactive",
    lastUsed: "2023-07-30",
  },
]

export function SMSTemplatesTable() {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Template Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Type</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Last Used</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templatesData.map((template) => (
              <tr
                key={template.id}
                className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{template.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{template.template}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="text-xs font-normal capitalize">
                    {template.type}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={template.status === "active" ? "success" : "outline"}>{template.status}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{template.lastUsed}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-1">
                    <Button variant="ghost" size="icon">
                      <SendHorizontal className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Send</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Copy</span>
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
                        <DropdownMenuItem>Send SMS</DropdownMenuItem>
                        <DropdownMenuItem>Edit Template</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{template.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
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
  )
}
