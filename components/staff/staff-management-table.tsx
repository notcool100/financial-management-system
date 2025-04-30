"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, AlertCircle, Loader2, ShieldCheck, Key } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

// Define staff roles and their permissions
const staffRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all system features",
    permissions: [
      "manage_staff",
      "manage_clients",
      "manage_loans",
      "approve_loans",
      "view_reports",
      "manage_settings",
      "manage_transactions",
    ],
  },
  {
    id: "manager",
    name: "Manager",
    description: "Oversee operations and staff activities",
    permissions: [
      "manage_clients",
      "manage_loans",
      "approve_loans",
      "view_reports",
      "manage_transactions",
    ],
  },
  {
    id: "loan-officer",
    name: "Loan Officer",
    description: "Handle loan applications and approvals",
    permissions: [
      "manage_clients",
      "manage_loans",
      "approve_loans",
      "view_reports",
    ],
  },
  {
    id: "teller",
    name: "Teller",
    description: "Handle day-to-day transactions",
    permissions: [
      "manage_clients",
      "manage_transactions",
      "view_reports",
    ],
  },
]

// Mock data for staff members
const mockStaff = [
  {
    id: "1",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@example.com",
    phone: "9801234567",
    role: "admin",
    status: "active",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Sunita Poudel",
    email: "sunita.poudel@example.com",
    phone: "9807654321",
    role: "manager",
    status: "active",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Bikash Thapa",
    email: "bikash.thapa@example.com",
    phone: "9812345678",
    role: "loan-officer",
    status: "active",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Anita KC",
    email: "anita.kc@example.com",
    phone: "9854321098",
    role: "teller",
    status: "active",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Deepak Adhikari",
    email: "deepak.adhikari@example.com",
    phone: "9876543210",
    role: "loan-officer",
    status: "inactive",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    last_login: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Helper function to get role name from role ID
const getRoleName = (roleId: string) => {
  const role = staffRoles.find(r => r.id === roleId)
  return role ? role.name : roleId
}

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
}

interface StaffManagementTableProps {
  roleFilter?: string
}

export function StaffManagementTable({ roleFilter = "" }: StaffManagementTableProps) {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([])

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
        if (searchQuery) params.append('search', searchQuery);
        if (roleFilter) params.append('role', roleFilter);

        const response = await fetch(`/api/staff?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await response.json();
        setStaff(data);
        setTotalPages(1); // Adjust if backend supports pagination
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching staff:", err);
        setError("Failed to load staff data. Please try again.");
        setLoading(false);
      }
    }
    
    fetchStaff()
  }, [page, statusFilter, searchQuery, roleFilter])

  // Handle edit staff
  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff)
    setEditFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete staff
  const handleDeleteStaff = (staff: any) => {
    setSelectedStaff(staff)
    setIsDeleteDialogOpen(true)
  }

  // Handle permissions dialog
  const handlePermissionsDialog = (staff: any) => {
    setSelectedStaff(staff)
    
    // Get permissions for the selected role
    const rolePermissions = staffRoles.find(r => r.id === staff.role)?.permissions || []
    setSelectedPermissions(rolePermissions)
    
    // Get all available permissions
    const allPermissions = Array.from(
      new Set(staffRoles.flatMap(r => r.permissions))
    )
    setAvailablePermissions(allPermissions)
    
    setIsPermissionsDialogOpen(true)
  }

  // Handle reset password dialog
  const handleResetPasswordDialog = (staff: any) => {
    setSelectedStaff(staff)
    setResetPasswordData({
      password: "",
      confirmPassword: "",
    })
    setIsResetPasswordDialogOpen(true)
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!response.ok) {
        throw new Error('Failed to update staff');
      }
      const updatedStaffData = await response.json();
      const updatedStaff = staff.map(s => 
        s.id === selectedStaff.id ? updatedStaffData : s
      );
      setStaff(updatedStaff);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      setError('Failed to update staff. Please try again.');
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }
      const updatedStaff = staff.filter(s => s.id !== selectedStaff.id);
      setStaff(updatedStaff);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError('Failed to delete staff. Please try again.');
    }
  }

  // Handle save permissions
  const handleSavePermissions = async () => {
    try {
      // Assuming permissions are part of staff update
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: selectedPermissions })
      });
      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }
      setIsPermissionsDialogOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setError('Failed to update permissions. Please try again.');
    }
  }

  // Handle reset password
  const handleResetPassword = async () => {
    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPasswordData.password })
      });
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      setIsResetPasswordDialogOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400">Staff</th>
                <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400">Role</th>
                <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400">Last Login</th>
                <th className="py-3 px-4 text-left font-medium text-slate-500 dark:text-slate-400">Created</th>
                <th className="py-3 px-4 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 dark:text-slate-400">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((staff) => (
                  <tr key={staff.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${staff.email}`} />
                          <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {staff.email} • {staff.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-medium">
                        {getRoleName(staff.role)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={staff.status === "active" ? "default" : "destructive"}
                      >
                        {staff.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(staff.last_login)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(staff.created_at)}
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePermissionsDialog(staff)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPasswordDialog(staff)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStaff(staff)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing {staff.length} of {staff.length} staff members
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="font-medium mb-2">Role: {selectedStaff && getRoleName(selectedStaff.role)}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {staffRoles.find(r => r.id === selectedStaff?.role)?.description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="font-medium">Permissions:</div>
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPermissions([...selectedPermissions, permission])
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
                      }
                    }}
                  />
                  <Label htmlFor={`permission-${permission}`} className="capitalize">
                    {permission.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={resetPasswordData.password}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              />
              {resetPasswordData.password !== resetPasswordData.confirmPassword && resetPasswordData.confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={!resetPasswordData.password || resetPasswordData.password !== resetPasswordData.confirmPassword}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}