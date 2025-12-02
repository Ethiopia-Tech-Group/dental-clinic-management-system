"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Phone, Mail, User, FileText, Stethoscope } from "lucide-react"
import { mockDoctors, mockBranches, mockPatients, mockTreatments } from "@/data/mockData"

interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialties: string[]
  qualifications: string
  experience_years: number
  is_active: boolean
  profile_picture_url: string
  branch_id: string
}

interface Branch {
  id: string
  name: string
}

interface PatientCount {
  count: number
}

interface TreatmentCount {
  count: number
}

export default function DoctorDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [patientCount, setPatientCount] = useState<number>(0)
  const [treatmentCount, setTreatmentCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchDoctorDetails()
    }
  }, [id])

  const fetchDoctorDetails = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Find doctor in mock data
      const doctorData = mockDoctors.find(d => d.id === id)
      setDoctor(doctorData || null)
      
      // Find branch for this doctor
      if (doctorData) {
        const branchData = mockBranches.find(b => b.id === doctorData.branch_id)
        setBranch(branchData || null)
        
        // Count patients and treatments for this doctor
        const doctorPatients = mockPatients.filter(p => p.branch_id === doctorData.branch_id)
        setPatientCount(doctorPatients.length)
        
        const doctorTreatments = mockTreatments.filter(t => t.doctor_id === doctorData.id)
        setTreatmentCount(doctorTreatments.length)
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-48 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Doctor Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-secondary/60">The requested doctor could not be found.</p>
            <Button onClick={() => router.push("/dashboard/doctors")} className="mt-4">
              Back to Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get doctor name based on user_id
  const doctorName = doctor.user_id.includes("user-1") ? "Dr. John Smith" : 
                    doctor.user_id.includes("user-2") ? "Dr. Emily Johnson" : 
                    "Dr. Robert Williams"

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Doctor Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {doctor.profile_picture_url ? (
                <img 
                  src={doctor.profile_picture_url} 
                  alt={doctorName}
                  className="w-48 h-48 rounded-full object-cover border-4 border-primary mb-4"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-200 border-4 border-primary mb-4 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-secondary">
                {doctorName}
              </h2>
              
              <div className="mt-2 flex items-center gap-2">
                <Badge className={doctor.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {doctor.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="mt-4 w-full space-y-3">
                <div className="flex items-center gap-3">
                  <Stethoscope size={18} className="text-primary" />
                  <span className="text-secondary/80">License: {doctor.license_number}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-secondary/80">{doctor.experience_years} years of experience</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-secondary/80">
                    {branch ? branch.name : "Unknown Branch"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specialties and Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-secondary mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specialties && doctor.specialties.length > 0 ? (
                    doctor.specialties.map((specialty) => (
                      <Badge key={specialty} className="bg-blue-100 text-blue-800">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-secondary/60">No specialties listed</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-secondary mb-2">Qualifications</h3>
                <p className="text-secondary/80">
                  {doctor.qualifications || "No qualifications listed"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary/60">Patients Treated</p>
                    <p className="text-3xl font-bold text-primary mt-1">{patientCount}</p>
                  </div>
                  <User size={32} className="text-primary/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary/60">Treatments Handled</p>
                    <p className="text-3xl font-bold text-primary mt-1">{treatmentCount}</p>
                  </div>
                  <FileText size={32} className="text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push(`/dashboard/doctors`)}
              variant="outline"
            >
              Back to Doctors
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard/patients?doctor=${doctor.id}`)}
            >
              View Patients
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard/treatments?doctor=${doctor.id}`)}
              variant="outline"
            >
              View Treatments
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}