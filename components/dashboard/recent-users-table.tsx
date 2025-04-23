"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { MoreHorizontal } from "lucide-react"

const users = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    accountType: "SB",
    status: "active",
    dateCreated: "2023-04-12",
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    accountType: "BB",
    status: "active",
    dateCreated: "2023-05-18",
  },
  {
    id: "3",
    name: "Amit Singh",
    email: "amit.singh@example.com",
    accountType: "MB",
    status: "pending",
    dateCreated: "2023-06-02",
  },
  {
    id: "4",
    name: "Sunita Patel",
    email: "sunita.patel@example.com",
    accountType: "SB",
    status: "active",
    dateCreated: "2023-06-15",
  },
  {
    id: "5",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    accountType: "BB",
    status: "inactive",
    dateCreated: "2023-07-01",
  },
]

export function RecentUsersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">User</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Account Type</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Date Created</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${user.name.charAt(0)}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="text-xs font-normal">
                  {user.accountType === "SB"
                    ? "Sadaran Bachat"
                    : user.accountType === "BB"
                      ? "Baal Bachat"
                      : "Masik Bachat"}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant={user.status === "active" ? "success" : user.status === "pending" ? "warning" : "destructive"}
                >
                  {user.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{user.dateCreated}</td>
              <td className="py-3 px-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">Delete User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
