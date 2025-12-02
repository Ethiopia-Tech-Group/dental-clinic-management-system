"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState({
    incomeByBranch: [] as any[],
    incomeByDoctor: [] as any[],
    serviceUsage: [] as any[],
    patientGrowth: [] as any[],
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data for demonstration
      setReportData({
        incomeByBranch: [
          { branch: "Main Branch", income: 15000 },
          { branch: "Downtown", income: 12000 },
          { branch: "Uptown", income: 9000 },
        ],
        incomeByDoctor: [
          { doctor: "Dr. Smith", income: 8000 },
          { doctor: "Dr. Johnson", income: 7500 },
          { doctor: "Dr. Williams", income: 6500 },
        ],
        serviceUsage: [
          { service: "Cleaning", count: 45 },
          { service: "Filling", count: 32 },
          { service: "Root Canal", count: 18 },
          { service: "Extraction", count: 12 },
        ],
        patientGrowth: [
          { month: "Jan", patients: 120 },
          { month: "Feb", patients: 135 },
          { month: "Mar", patients: 155 },
          { month: "Apr", patients: 168 },
          { month: "May", patients: 182 },
          { month: "Jun", patients: 195 },
        ],
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ["#D4AF37", "#AA8C2C", "#E5C158", "#1F2937"]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Reports & Analytics</h1>
          <p className="text-secondary/60 mt-2">View clinic performance and statistics</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
          <Download size={18} /> Export Report
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Branch */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Income by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.incomeByBranch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#D4AF37" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Income by Doctor */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Income by Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.incomeByDoctor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="doctor" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#D4AF37" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Service Usage */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Service Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.serviceUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ service, count }) => `${service}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.serviceUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Patient Growth */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Patient Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#D4AF37" dot={{ fill: "#D4AF37" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}