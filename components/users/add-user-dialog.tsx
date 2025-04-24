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
import { Loader2, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface User {
  id: string
  name: string
  email: string
  phone: string
  account_type: string
  balance: number
  status: "active" | "pending" | "inactive"
  created_at: string
}

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserAdded: (user: User) => void
}

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "client",
  })
  const [avatarPreview, setAvatarPreview] = useState("")

  const handleInputChange = (field: string, value: string | number) => {
    setNewUser({ ...newUser, [field]: value })

    // Update avatar preview when name changes
    if (field === "name" && typeof value === "string") {
      setAvatarPreview(value.charAt(0).toUpperCase())
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Sending user data:', JSON.stringify(newUser))
      
      // Use the Next.js API route to proxy the request to the backend
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]))
      
      // Get the raw text first to see what's being returned
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      if (!response.ok) {
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.message || 'Failed to create user')
        } catch (parseError) {
          // If it's not valid JSON, use the raw text
          throw new Error(responseText || 'Failed to create user')
        }
      }
      
      // Parse the response text as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response data:', data)
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error('Invalid response format from server')
      }
      
      // Check if the response has the expected structure
      if (data && data.success && data.data) {
        console.log('User created successfully:', data.data);
        onUserAdded(data.data)
        onOpenChange(false)
      } else if (data && data.success) {
        // Some APIs might return success without a data property
        console.log('User created successfully, but no data returned:', data);
        // Create a mock user object with the data we sent
        const mockUser = {
          ...newUser,
          id: Date.now().toString(), // Generate a temporary ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        delete mockUser.password; // Remove password from the mock user
        onUserAdded(mockUser);
        onOpenChange(false);
      } else {
        console.error('Unexpected response structure:', data)
        throw new Error(data.message || 'Unexpected response from server')
      }

      // Reset form
      setNewUser({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "client",
      })
      setAvatarPreview("")
    } catch (err: any) {
      console.error('Error creating user:', err)
      setError(err.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
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
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder.svg?height=64&width=64&text=${avatarPreview}`} alt="Preview" />
              <AvatarFallback>{avatarPreview}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-medium">User Profile</h3>
              <p className="text-sm text-muted-foreground">Personal information and account details</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+977 98XXXXXXXX"
                value={newUser.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
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
            disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.phone || !newUser.password} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
