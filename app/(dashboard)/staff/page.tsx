"use client"

import { useState } from "react"
import { Metadata } from "next"
import { StaffManagementTable } from "@/components/staff/staff-management-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus } from "lucide-react"
import { AddStaffDialog } from "@/components/staff/add-staff-dialog"

export default function StaffManagementPage() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button onClick={() => setIsAddStaffOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="admin">Administrators</TabsTrigger>
          <TabsTrigger value="manager">Managers</TabsTrigger>
          <TabsTrigger value="loan-officer">Loan Officers</TabsTrigger>
          <TabsTrigger value="teller">Tellers</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Staff Members</CardTitle>
              <CardDescription>
                View and manage all staff members regardless of role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagementTable roleFilter="" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                Administrators have full access to all system features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagementTable roleFilter="admin" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manager">
          <Card>
            <CardHeader>
              <CardTitle>Managers</CardTitle>
              <CardDescription>
                Managers can oversee operations and staff activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagementTable roleFilter="manager" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="loan-officer">
          <Card>
            <CardHeader>
              <CardTitle>Loan Officers</CardTitle>
              <CardDescription>
                Loan officers manage loan applications and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagementTable roleFilter="loan-officer" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="teller">
          <Card>
            <CardHeader>
              <CardTitle>Tellers</CardTitle>
              <CardDescription>
                Tellers handle day-to-day transactions with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffManagementTable roleFilter="teller" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddStaffDialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen} />
    </div>
  )
}