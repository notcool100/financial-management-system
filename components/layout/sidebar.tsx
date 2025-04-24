"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { Permission } from "@/lib/rbac"
import {
  BarChart3,
  Users,
  UserCog,
  Percent,
  CreditCard,
  Calculator,
  MessageSquare,
  BookOpen,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    permission: "dashboard:view" as Permission,
  },
  {
    title: "Client Management",
    href: "/users",
    icon: Users,
    permission: "clients:view" as Permission,
  },
  {
    title: "Staff Management",
    href: "/staff",
    icon: UserCog,
    permission: "staff:view" as Permission,
  },
  {
    title: "Interest Management",
    href: "/interest",
    icon: Percent,
    permission: "interest:view" as Permission,
  },
  {
    title: "Loan Management",
    href: "/loans",
    icon: CreditCard,
    permission: "loans:view" as Permission,
  },
  {
    title: "EMI Calculator",
    href: "/calculator",
    icon: Calculator,
    permission: "loans:view" as Permission,
  },
  {
    title: "SMS Banking",
    href: "/sms",
    icon: MessageSquare,
    permission: "clients:view" as Permission,
  },
  {
    title: "Journal Entry",
    href: "/journal",
    icon: BookOpen,
    permission: "transactions:view" as Permission,
  },
  {
    title: "Financial Reports",
    href: "/reports",
    icon: FileText,
    permission: "reports:view" as Permission,
  },
  {
    title: "Print Preview",
    href: "/print",
    icon: Printer,
    permission: "reports:view" as Permission,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, hasPermission } = useUser()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-all duration-300 ease-in-out md:relative md:z-0",
          collapsed && "md:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className={cn("text-lg font-semibold tracking-tight transition-all", collapsed && "md:hidden")}>
            Micro Finance
          </h2>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            <TooltipProvider delayDuration={0}>
              {navItems.map((item) => (
                // Only show menu items the user has permission to access
                hasPermission(item.permission) && (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                          collapsed && "md:justify-center md:px-2",
                        )}
                      >
                        <item.icon className={cn("mr-2 h-5 w-5", collapsed && "md:mr-0")} />
                        <span className={cn(collapsed && "md:hidden")}>{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("md:hidden", !collapsed && "hidden")}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              ))}
            </TooltipProvider>
          </nav>
        </div>
        <div className="border-t p-4">
          <div className={cn("flex items-center gap-2", collapsed && "md:justify-center")}>
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className={cn("space-y-1", collapsed && "md:hidden")}>
              <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
