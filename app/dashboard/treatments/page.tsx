"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Eye, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { mockTreatments, mockPatients, mockDoctors, mockEmployees, getVisibleTreatments } from "@/data/mockData"
import { useBranch } from "@/contexts/BranchContext"

interface Treatment {
  id: string
  patient_id: string
  doctor_id: string
  status: string
  total_cost: number
  treatment_date: string
  patients?: { first_name: string; last_name: string }
  doctors?: { profiles: { first_name: string; last_name: string } }
}

// Helper function to get doctor name
const getDoctorName = (doctorId: string) => {
  // Find the doctor
  const doctor = mockDoctors.find(d => d.id === doctorId)
  if (!doctor) return "Unknown Doctor"
  
  // Find the employee/user associated with this doctor
  const employee = mockEmployees.find(e => e.id === doctor.user_id.replace('user-', 'emp-'))
  if (employee) {
    return `${employee.first_name} ${employee.last_name}`
  }
  
  // Fallback names based on doctor ID
  if (doctorId === "doctor-1") return "John Smith"
  if (doctorId === "doctor-2") return "Emily Johnson"
  if (doctorId === "doctor-3") return "Robert Williams"
  
  return "Doctor"
}

export default function TreatmentsPage() {
  const router = useRouter()
  const { currentBranch } = useBranch();
  const [treatments, setTreatments] = useState<any[]>([])
  const [filteredTreatments, setFilteredTreatments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTreatments()
  }, [currentBranch]) // Add currentBranch as dependency

  useEffect(() => {
    const filtered = treatments.filter(
      (treatment) =>
        treatment.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTreatments(filtered)
  }, [searchTerm, treatments])

  const fetchTreatments = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data with branch filtering
      let filteredTreatments = mockTreatments
      if (currentBranch?.id) {
        filteredTreatments = getVisibleTreatments({ selectedBranchId: currentBranch.id, mockTreatments })
      }
      
      // Use mock data with enriched patient and doctor information
      const enrichedTreatments = filteredTreatments.map(treatment => {
        const patient = mockPatients.find(p => p.id === treatment.patient_id)
        const doctorName = getDoctorName(treatment.doctor_id)
        
        return {
          ...treatment,
          patients: patient ? {
            first_name: patient.first_name,
            last_name: patient.last_name
          } : undefined,
          doctorName // Add doctor name to the treatment object
        }
      })
      
      setTreatments(enrichedTreatments)
    } catch (error) {
      console.error("Error fetching treatments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const handleDelete = async (treatmentId: string) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setTreatments(treatments.filter((t) => t.id !== treatmentId))
    } catch (error) {
      console.error("Error deleting treatment:", error)
      alert("Failed to delete treatment")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Treatment Records</h1>
          <p className="text-secondary/60 mt-2">Manage patient treatment records</p>
        </div>
        <Button
          onClick={() => {
            router.push("/dashboard/treatments/add")
          }}
          className="bg-primary hover:bg-primary-dark text-white gap-2"
        >
          <Plus size={18} /> New Treatment
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search size={20} className="text-secondary/40" />
            <Input
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Treatments Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-secondary/60">
                        No treatments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTreatments.map((treatment) => (
                      <TableRow key={treatment.id} className="border-primary/5">
                        <TableCell className="font-medium">
                          {treatment.patients?.first_name} {treatment.patients?.last_name}
                        </TableCell>
                        <TableCell className="text-secondary/70">
                          Dr. {treatment.doctorName}
                        </TableCell>
                        <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold text-primary">${treatment.total_cost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[treatment.status] || "bg-gray-100"}>{treatment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/treatments/${treatment.id}`}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="View"
                            >
                              <Eye size={16} className="text-primary" />
                            </Link>
                            <Link
                              href={`/dashboard/treatments/edit/${treatment.id}`}
                              className="p-2 hover:bg-primary/10 rounded transition"
                            >
                              <Edit2 size={16} className="text-primary" />
                            </Link>
                            <button
                              onClick={() => handleDelete(treatment.id)}
                              className="p-2 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}