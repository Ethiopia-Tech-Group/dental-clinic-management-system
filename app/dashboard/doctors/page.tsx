"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { mockDoctors, getVisibleDoctors, MockDoctor } from "@/data/mockData"
import { useBranch } from "@/contexts/BranchContext"

interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialties: string[]
  qualifications: string
  experience_years: number
  is_active: boolean
  profile_picture_url?: string // Make it optional to match MockDoctor
  branch_id: string
}

export default function DoctorsPage() {
  const router = useRouter()
  const { currentBranch } = useBranch();
  const [doctors, setDoctors] = useState<MockDoctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<MockDoctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchDoctors()
  }, [currentBranch]) // Add currentBranch as dependency

  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const fullName = `${doctor.user_id.includes("user-1") ? "Dr. John" : doctor.user_id.includes("user-2") ? "Dr. Emily" : "Dr. Robert"} ${doctor.user_id.includes("user-1") ? "Smith" : doctor.user_id.includes("user-2") ? "Johnson" : "Williams"}`.toLowerCase()
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        doctor.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  const fetchDoctors = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock data with branch filtering
      let filteredDoctors = mockDoctors
      if (currentBranch?.id) {
        filteredDoctors = getVisibleDoctors({ selectedBranchId: currentBranch.id, mockDoctors })
      }
      
      setDoctors(filteredDoctors)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (doctorId: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state
      setDoctors(doctors.filter((d) => d.id !== doctorId))
    } catch (error) {
      console.error("Error deleting doctor:", error)
      alert("Failed to delete doctor")
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Doctor Management</h1>
          <p className="text-secondary/60 mt-2">Manage doctors and their specialties</p>
        </div>
        <Button
          onClick={() => {
            router.push("/dashboard/doctors/add")
          }}
          className="bg-primary hover:bg-primary-dark text-white gap-2"
        >
          <Plus size={18} /> Add Doctor
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Search size={20} className="text-secondary/40" />
            <Input
              placeholder="Search by name or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>System Doctors</CardTitle>
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
                    <TableHead>License</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-secondary/60">
                        No doctors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.id} className="border-primary/5">
                        <TableCell className="font-medium">
                          {doctor.user_id.includes("user-1") ? "Dr. John Smith" : 
                           doctor.user_id.includes("user-2") ? "Dr. Emily Johnson" : 
                           "Dr. Robert Williams"}
                        </TableCell>
                        <TableCell className="text-secondary/70">{doctor.license_number}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {doctor.specialties?.map((specialty) => (
                              <Badge key={specialty} className="bg-blue-100 text-blue-800">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{doctor.experience_years || 0} years</TableCell>
                        <TableCell>
                          <Badge
                            className={doctor.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {doctor.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/doctors/${doctor.id}`}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="View Details"
                            >
                              <Eye size={16} className="text-primary" />
                            </Link>
                            <Link
                              href={`/dashboard/doctors/edit/${doctor.id}`}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-primary" />
                            </Link>
                            <button
                              onClick={() => handleDelete(doctor.id)}
                              className="p-2 hover:bg-red-50 rounded transition"
                              title="Delete"
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