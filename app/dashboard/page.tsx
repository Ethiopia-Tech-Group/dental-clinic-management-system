"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { mockPatients, mockDoctors, mockInvoices, mockBranches, getVisiblePatients, getVisibleDoctors, getVisibleInvoices } from "@/data/mockData"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalBranches: 0,
    totalDoctors: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null) // Add branch ID state
  const [userRole, setUserRole] = useState<string | null>(null) // Add user role state
  const [userId, setUserId] = useState<string | null>(null) // Add user ID state

  // Get selected branch and user info from localStorage
  useEffect(() => {
    const branchId = localStorage.getItem("currentBranchId")
    if (branchId) {
      setSelectedBranchId(branchId)
    }
    
    const sessionStr = localStorage.getItem("userSession")
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr)
        setUserRole(session.user.role)
        setUserId(session.user.id)
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Use mock data with branch filtering
        let filteredPatients = mockPatients
        let filteredDoctors = mockDoctors
        let filteredInvoices = mockInvoices
        
        if (selectedBranchId) {
          // Filter patients by branch and doctor role
          filteredPatients = getVisiblePatients({ 
            role: userRole || '', 
            userId: userId || '', 
            selectedBranchId, 
            mockPatients 
          })
          
          // Filter doctors by branch
          filteredDoctors = getVisibleDoctors({ selectedBranchId, mockDoctors })
          
          // Filter invoices by branch
          filteredInvoices = getVisibleInvoices({ selectedBranchId, mockInvoices })
        }
        
        const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid")
        const revenue = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
        
        setStats({
          totalPatients: filteredPatients.length,
          totalBranches: mockBranches.length, // Always show all branches
          totalDoctors: filteredDoctors.length,
          totalInvoices: filteredInvoices.length,
          totalRevenue: parseFloat(revenue.toFixed(2)),
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [selectedBranchId, userRole, userId]) // Add dependencies

  const chartData = [
    { month: "Jan", revenue: 4000, patients: 240 },
    { month: "Feb", revenue: 3000, patients: 221 },
    { month: "Mar", revenue: 2000, patients: 229 },
    { month: "Apr", revenue: 2780, patients: 200 },
    { month: "May", revenue: 1890, patients: 229 },
    { month: "Jun", revenue: 2390, patients: 200 },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-secondary/60 mt-2">Welcome back! Here's your clinic overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Patients", value: stats.totalPatients },
          { label: "Total Branches", value: stats.totalBranches },
          { label: "Total Doctors", value: stats.totalDoctors },
          { label: "Total Invoices", value: stats.totalInvoices },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}` },
        ].map((stat, index) => (
          <Card key={index} className="border-primary/10">
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <>
                  <p className="text-secondary/60 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary mt-2">{stat.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" dot={{ fill: "#D4AF37" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Patient Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}