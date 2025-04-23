"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreHorizontal } from "lucide-react"

const smsHistoryData = [
  {
    id: "1",
    recipient: "Rajesh Kumar",
    phone: "+91 98765 43210",
    template: "Payment Reminder",
    message:
      "Dear Rajesh Kumar, your EMI payment of ₹8,450 for loan L789012 is due on 15th Sep 2023. Please make the payment on time to avoid late fees.",
    sentAt: "2023-09-12 10:15 AM",
    status: "delivered",
  },
  {
    id: "2",
    recipient: "Priya Sharma",
    phone: "+91 87654 32109",
    template: "Welcome Message",
    message:
      "Welcome to our Micro Finance family, Priya Sharma! Your account AC123456 has been successfully created. Contact us at +91 1800 123 4567 for any assistance.",
    sentAt: "2023-09-10 11:30 AM",
    status: "delivered",
  },
  {
    id: "3",
    recipient: "Amit Singh",
    phone: "+91 76543 21098",
    template: "Late Payment Notice",
    message:
      "Dear Amit Singh, your EMI payment of ₹14,583 for loan L456789 is overdue by 5 days. Please make the payment immediately to avoid penalty charges.",
    sentAt: "2023-09-08 09:45 AM",
    status: "delivered",
  },
  {
    id: "4",
    recipient: "Sunita Patel",
    phone: "+91 65432 10987",
    template: "Loan Approval",
    message:
      "Congratulations Sunita Patel! Your loan application of ₹3,25,000 has been approved. Loan amount will be credited to your account AC789012 within 24 hours.",
    sentAt: "2023-09-05 02:20 PM",
    status: "delivered",
  },
  {
    id: "5",
    recipient: "Rahul Verma",
    phone: "+91 54321 09876",
    template: "Account Statement",
    message:
      "Dear Rahul Verma, your monthly account statement for August is ready. Current balance: ₹8,750. For details, please visit our office or check the app.",
    sentAt: "2023-08-31 04:10 PM",
    status: "failed",
  },
]

export function SMSHistoryTable() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search messages..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Recipient</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Template</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Sent At</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {smsHistoryData.map((sms) => (
                <tr
                  key={sms.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{sms.recipient}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sms.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{sms.template}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{sms.message}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{sms.sentAt}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        sms.status === "delivered" ? "success" : sms.status === "pending" ? "warning" : "destructive"
                      }
                    >
                      {sms.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Resend Message</DropdownMenuItem>
                        <DropdownMenuItem>Copy Text</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">5</span> of <span className="font-medium">125</span> messages
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
