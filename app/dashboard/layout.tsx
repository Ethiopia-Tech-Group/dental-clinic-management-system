"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import { getUserProfile, canAccessRoute } from "@/lib/utils/rbac"
import { toast } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // Check for mock session in localStorage
      const sessionStr = localStorage.getItem("userSession")
      
      if (!sessionStr) {
        router.push("/auth/login")
        return
      }

      try {
        const session = JSON.parse(sessionStr)
        
        // Check if session is expired
        if (Date.now() > session.expires_at) {
          localStorage.removeItem("userSession")
          router.push("/auth/login")
          return
        }

        // Set user data from session
        setUserEmail(session.user.email)
        setUserRole(session.user.role)

        // Check if user can access this route
        if (!canAccessRoute(session.user.role as any, pathname)) {
          toast.error("Access denied. You don't have permission to access this page.")
          router.push("/dashboard")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error parsing session:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-secondary/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral">
      <DashboardNav userRole={userRole} userEmail={userEmail} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}