"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagementTable } from "@/components/users/user-management-table"
import { Plus, Search } from "lucide-react"
import { useState, useEffect } from "react"

export default function UsersPage() {
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleTabChange = (value: string) => {
    switch (value) {
      case "sb":
        setAccountTypeFilter("SB")
        break
      case "bb":
        setAccountTypeFilter("BB")
        break
      case "mb":
        setAccountTypeFilter("MB")
        break
      default:
        setAccountTypeFilter("all")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="text-muted-foreground">Manage all users and clients in the system</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddUserOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="sb">Sadaran Bachat</TabsTrigger>
            <TabsTrigger value="bb">Baal Bachat</TabsTrigger>
            <TabsTrigger value="mb">Masik Bachat</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 w-[250px]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <UserManagementTable 
            addUserOpen={addUserOpen} 
            setAddUserOpen={setAddUserOpen} 
            searchQuery={debouncedSearchQuery}
            statusFilter={statusFilter !== "all" ? statusFilter : undefined}
          />
        </TabsContent>
        <TabsContent value="sb">
          <UserManagementTable 
            filterType="SB" 
            addUserOpen={addUserOpen} 
            setAddUserOpen={setAddUserOpen} 
            searchQuery={debouncedSearchQuery}
            statusFilter={statusFilter !== "all" ? statusFilter : undefined}
          />
        </TabsContent>
        <TabsContent value="bb">
          <UserManagementTable 
            filterType="BB" 
            addUserOpen={addUserOpen} 
            setAddUserOpen={setAddUserOpen} 
            searchQuery={debouncedSearchQuery}
            statusFilter={statusFilter !== "all" ? statusFilter : undefined}
          />
        </TabsContent>
        <TabsContent value="mb">
          <UserManagementTable 
            filterType="MB" 
            addUserOpen={addUserOpen} 
            setAddUserOpen={setAddUserOpen} 
            searchQuery={debouncedSearchQuery}
            statusFilter={statusFilter !== "all" ? statusFilter : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
