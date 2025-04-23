"use client"

import { useState } from "react"
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
import { Edit, Eye, FileText, MoreHorizontal, Printer } from "lucide-react"

const journalEntriesData = [
  {
    id: "JE-2023-001",
    date: "2023-04-15",
    reference: "INV-2023-001",
    description: "Purchase of office supplies",
    amount: "₹12,500",
    entries: 4,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-002",
    date: "2023-04-18",
    reference: "PAY-2023-001",
    description: "Salary payment for April 2023",
    amount: "₹85,000",
    entries: 6,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-003",
    date: "2023-04-20",
    reference: "LOAN-2023-001",
    description: "Loan disbursement to Rajesh Kumar",
    amount: "₹2,50,000",
    entries: 2,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-004",
    date: "2023-04-25",
    reference: "REC-2023-001",
    description: "Loan repayment from Priya Sharma",
    amount: "₹8,625",
    entries: 2,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-005",
    date: "2023-04-28",
    reference: "INT-2023-001",
    description: "Interest income for April 2023",
    amount: "₹32,450",
    entries: 8,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-006",
    date: "2023-04-30",
    reference: "EXP-2023-001",
    description: "Monthly expenses for April 2023",
    amount: "₹18,750",
    entries: 10,
    status: "posted",
    createdBy: "Admin User",
  },
  {
    id: "JE-2023-007",
    date: "2023-05-02",
    reference: "ADJ-2023-001",
    description: "Adjustment entry for inventory",
    amount: "₹5,800",
    entries: 2,
    status: "draft",
    createdBy: "Admin User",
  },
]

interface JournalEntriesTableProps {
  limit?: number
}

export function JournalEntriesTable({ limit }: JournalEntriesTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredEntries = selectedStatus
    ? journalEntriesData.filter((entry) => entry.status === selectedStatus)
    : journalEntriesData

  const displayedEntries = limit ? filteredEntries.slice(0, limit) : filteredEntries

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant={selectedStatus === null ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus(null)}
        >
          All
        </Button>
        <Button
          variant={selectedStatus === "posted" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("posted")}
        >
          Posted
        </Button>
        <Button
          variant={selectedStatus === "draft" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("draft")}
        >
          Draft
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Entry ID</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Reference</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Amount</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Entries</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{entry.id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.date}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.reference}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{entry.description}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {entry.amount}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">{entry.entries}</td>
                  <td className="py-3 px-4">
                    <Badge variant={entry.status === "posted" ? "success" : "outline"}>{entry.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-slate-500" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon">
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Entry
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {limit && filteredEntries.length > limit && (
          <div className="flex items-center justify-center p-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" size="sm">
              View All Entries
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
