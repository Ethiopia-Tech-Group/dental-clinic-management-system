"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { mockPatients, mockDoctors, mockEmployees, getVisiblePatients } from "@/data/mockData"
import { useBranch } from "@/contexts/BranchContext"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  postal_code: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  dental_history: string
  allergies: string
  current_medications: string
  is_active: boolean
  branch_id: string
}

// Helper function to get doctor name (similar to the one in patient detail page)
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

export default function PatientsPage() {
  const router = useRouter()
  const { currentBranch } = useBranch();
  const [patients, setPatients] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchBy, setSearchBy] = useState("name") // name or card_id
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null) // Add user ID state

  // Get user role and user ID from localStorage
  useEffect(() => {
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
    fetchPatients()
  }, [currentBranch, userRole, userId]) // Add dependencies

  useEffect(() => {
    const filtered = patients.filter((patient) => {
      if (searchBy === "card_id") {
        // Search by card ID
        return patient.card_id?.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        // Search by name, email, or phone
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    })
    setFilteredPatients(filtered)
  }, [searchTerm, patients, searchBy])

  const fetchPatients = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data with branch and doctor filtering
      let filteredPatients = mockPatients
      if (currentBranch?.id) {
        filteredPatients = getVisiblePatients({ 
          role: userRole || '', 
          userId: userId || '', 
          selectedBranchId: currentBranch.id, 
          mockPatients 
        })
      }
      
      setPatients(filteredPatients)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setPatients(patients.filter((p) => p.id !== patientId))
    } catch (error) {
      console.error("Error deleting patient:", error)
      alert("Failed to delete patient")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Patient Management</h1>
          <p className="text-secondary/60 mt-2">Manage patient records and information</p>
        </div>
        {userRole !== "doctor" && (
          <Button
            onClick={() => {
              // Navigate to add patient page
              router.push("/dashboard/patients/add")
            }}
            className="bg-primary hover:bg-primary-dark text-white gap-2"
          >
            <Plus size={18} /> Add Patient
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="name">Search by Name</option>
                <option value="card_id">Search by Card ID</option>
              </select>
              <Search size={20} className="text-secondary/40 self-center" />
            </div>
            <Input
              placeholder={searchBy === "card_id" ? "Enter card ID..." : "Search by name, email, or phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Card ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-secondary/60">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => {
                      return (
                        <TableRow key={patient.id} className="border-primary/5">
                          <TableCell className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{patient.email}</p>
                              <p className="text-secondary/70">{patient.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {patient.card_id || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={patient.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {patient.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link
                                href={`/dashboard/patients/${patient.id}`}
                                className="p-2 hover:bg-primary/10 rounded transition"
                                title="View Details"
                              >
                                <Eye size={16} className="text-primary" />
                              </Link>
                              <Link
                                href={`/dashboard/patients/edit/${patient.id}`}
                                className="p-2 hover:bg-primary/10 rounded transition"
                                title="Edit"
                              >
                                <Edit2 size={16} className="text-primary" />
                              </Link>
                              <button
                                onClick={() => handleDelete(patient.id)}
                                className="p-2 hover:bg-red-50 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
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
