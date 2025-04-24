"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Role, Permission, hasPermission } from "@/lib/rbac"

interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface UserContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: Permission) => boolean
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on initial render
    const loadUser = () => {
      try {
        const userJson = localStorage.getItem('user')
        if (userJson) {
          const userData = JSON.parse(userJson)
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as Role,
          })
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    // In a real application, you would redirect to the login page
    window.location.href = '/login'
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        hasPermission: checkPermission,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}