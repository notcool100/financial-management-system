"use client"

import { ReactNode, useEffect, useState } from "react"
import { Permission, Role, hasPermission } from "@/lib/rbac"

interface PermissionGateProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

/**
 * A component that conditionally renders its children based on user permissions
 * If the user doesn't have the required permission, it renders the fallback or nothing
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // In a real application, you would fetch the user's role from your auth system
    // For now, we'll get it from localStorage or default to 'teller' for demo purposes
    const getUserRole = () => {
      try {
        const userJson = localStorage.getItem('user')
        if (userJson) {
          const user = JSON.parse(userJson)
          return user.role as Role || 'teller'
        }
        return 'teller' // Default role for demo
      } catch (error) {
        console.error('Error getting user role:', error)
        return 'teller' // Default role for demo
      }
    }

    const role = getUserRole()
    setUserRole(role)
    setHasAccess(role ? hasPermission(role, permission) : false)
    setLoading(false)
  }, [permission])

  if (loading) {
    return null
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}