"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

// Mock user data for different roles
const mockUsers = [
  { email: "superadmin@dentalclinic.com", password: "password", role: "super_admin", name: "Super Admin" },
  { email: "admin@dentalclinic.com", password: "password", role: "admin", name: "Admin User" },
  { email: "doctor@dentalclinic.com", password: "password", role: "doctor", name: "Dr. Smith" },
  { email: "dr.john.doe@dentalclinic.com", password: "password123", role: "doctor", name: "Dr. John Doe" },
  { email: "dr.emily.smith@dentalclinic.com", password: "password123", role: "doctor", name: "Dr. Emily Smith" },
  { email: "receptionist@dentalclinic.com", password: "password", role: "receptionist", name: "Receptionist" },
  { email: "accountant@dentalclinic.com", password: "password", role: "accountant", name: "Accountant" },
  { email: "xray@dentalclinic.com", password: "password", role: "xray_technician", name: "X-Ray Tech" },
  { email: "manager@dentalclinic.com", password: "password", role: "branch_manager", name: "Branch Manager" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find user in mock data
      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Store user session in localStorage
      // For doctors, use the user_id that matches their mockDoctors entry
      let userId = `user-${Date.now()}`;
      if (user.role === 'doctor') {
        // Map specific doctor emails to their user_ids
        if (user.email === 'dr.john.doe@dentalclinic.com') {
          userId = 'user-1';
        } else if (user.email === 'dr.emily.smith@dentalclinic.com') {
          userId = 'user-2';
        } else if (user.email === 'dr.michael.johnson@dentalclinic.com') {
          userId = 'user-3';
        } else {
          // Default doctor user_id
          userId = 'user-2';
        }
      }
      
      const session = {
        user: {
          id: userId,
          email: user.email,
          role: user.role,
          name: user.name
        },
        expires_at: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
      }
      
      localStorage.setItem("userSession", JSON.stringify(session))
      
      // For demo purposes, we'll redirect based on role
      switch (user.role) {
        case "super_admin":
          router.push("/dashboard")
          break
        case "admin":
          router.push("/dashboard")
          break
        case "doctor":
          router.push("/dashboard/treatments")
          break
        case "receptionist":
          router.push("/dashboard/patients")
          break
        case "accountant":
          router.push("/dashboard/invoices")
          break

        case "branch_manager":
          router.push("/dashboard")
          break
        default:
          router.push("/dashboard")
      }
      
      router.refresh()
      toast.success("Login successful!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/10 to-neutral">
      <div className="w-full max-w-sm">
        <Card className="border-primary/20">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">DC</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-secondary">Dental Clinic</CardTitle>
            <CardDescription className="text-center text-secondary/80">Management System - Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-secondary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dentalclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-secondary">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-900 text-sm">{error}</div>}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-secondary/80">
              <p>Demo credentials:</p>
              <p className="mt-1">superadmin@dentalclinic.com / password</p>
              <p className="mt-1">doctor@dentalclinic.com / password</p>
              <p className="mt-1">receptionist@dentalclinic.com / password</p>
              <p className="mt-1 font-medium">Specific Doctor Credentials:</p>
              <p className="mt-1">dr.john.doe@dentalclinic.com / password123</p>
              <p className="mt-1">dr.emily.smith@dentalclinic.com / password123</p>
              <p className="mt-2 italic">Receptionists can assign doctors when adding new patients</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}