"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  experience: string
  status: "pending" | "approved" | "rejected"
  role: "user" | "admin"
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string, isAdminMode?: boolean) => Promise<boolean>
  register: (userData: Omit<User, "id" | "status" | "role" | "createdAt">) => Promise<boolean>
  logout: () => void
  getPendingUsers: () => Promise<User[]>
  approveUser: (userId: string) => Promise<void>
  rejectUser: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }

    // Initialize admin user if not exists
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const adminExists = users.find((u: User) => u.role === "admin")

    if (!adminExists) {
      const adminUser: User = {
        id: "admin-1",
        name: "Administrador",
        email: "admin@exltrading.com",
        phone: "",
        experience: "profissional",
        status: "approved",
        role: "admin",
        createdAt: new Date().toISOString(),
      }

      const passwords = JSON.parse(localStorage.getItem("passwords") || "{}")
      passwords["admin@exltrading.com"] = "admin123"

      localStorage.setItem("users", JSON.stringify([...users, adminUser]))
      localStorage.setItem("passwords", JSON.stringify(passwords))
    }
  }, [])

  const login = async (email: string, password: string, isAdminMode = false): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}")

    const foundUser = users.find((u) => u.email === email)

    if (!foundUser || passwords[email] !== password) {
      return false
    }

    if (isAdminMode && foundUser.role !== "admin") {
      return false
    }

    if (!isAdminMode && foundUser.status !== "approved") {
      // Allow login for pending users to show status message
      setUser(foundUser)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }

    setUser(foundUser)
    setIsAuthenticated(true)
    localStorage.setItem("currentUser", JSON.stringify(foundUser))
    return true
  }

  const register = async (userData: Omit<User, "id" | "status" | "role" | "createdAt">): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}")

    // Check if email already exists
    if (users.find((u) => u.email === userData.email)) {
      return false
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: "pending",
      role: "user",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    passwords[userData.email] = (userData as any).password

    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("passwords", JSON.stringify(passwords))

    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  const getPendingUsers = async (): Promise<User[]> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    return users.filter((u) => u.status === "pending")
  }

  const approveUser = async (userId: string): Promise<void> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].status = "approved"
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  const rejectUser = async (userId: string): Promise<void> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].status = "rejected"
      localStorage.setItem("users", JSON.stringify(users))
    }
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        getPendingUsers,
        approveUser,
        rejectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
