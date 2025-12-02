"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Phone, Mail, User, FileText, Image as ImageIcon, Plus } from "lucide-react"
import { mockPatients, mockDoctors, mockTreatments, mockInvoices, mockXRayFiles, mockEmployees, mockVisits } from "@/data/mockData"
import { toast } from "sonner"
import AttachXrayModal from "@/components/dashboard/attach-xray-modal"
import ContinueVisitModal from "@/components/dashboard/continue-visit-modal"

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

interface Treatment {
  id: string
  patient_id: string
  doctor_id: string
  branch_id: string
  status: string
  treatment_date: string
  notes: string
  total_cost: number
}

interface Invoice {
  id: string
  invoice_number: string
  patient_id: string
  doctor_id: string
  branch_id: string
  treatment_id: string
  subtotal: number
  tax: number
  discount: number
  total_amount: number
  amount_paid: number
  balance_remaining: number
  status: string
  invoice_date: string
  due_date: string
  created_at: string
  updated_at: string
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

export default function PatientDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [xrayFiles, setXrayFiles] = useState<any[]>([])
  const [visits, setVisits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null) // Add user ID state
  const [showXrayModal, setShowXrayModal] = useState(false)
  const [showContinueVisitModal, setShowContinueVisitModal] = useState(false) // Add state for continue visit modal

  // Get user role and ID from localStorage
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
    if (id) {
      fetchPatientDetails()
    }
  }, [id, userRole, userId])

  const fetchPatientDetails = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Find patient in mock data
      const patientData = mockPatients.find(p => p.id === id)
      
      // Check if doctor has permission to view this patient
      if (userRole === 'doctor' && patientData) {
        // For mock data, we'll simulate doctor-patient assignment
        // In a real app, this would check actual assignments
        const doctorPatientMatch = (id as string) === `patient-${userId?.split('-')[1] || '1'}` || 
                                 (id as string).includes(`patient-${userId?.split('-')[1] || '1'}`);
        
        if (!doctorPatientMatch) {
          // Doctor doesn't have access to this patient
          setPatient(null);
          setTreatments([]);
          setInvoices([]);
          setXrayFiles([]);
          setVisits([]);
          setIsLoading(false);
          return;
        }
      }
      
      setPatient(patientData || null)
      
      // Get patient's treatments
      const patientTreatments = mockTreatments.filter(t => t.patient_id === id)
      
      // Filter treatments by doctor if user is a doctor
      const filteredTreatments = userRole === 'doctor' 
        ? patientTreatments.filter(t => t.doctor_id === `doctor-${userId?.split('-')[1] || '1'}`)
        : patientTreatments;
      
      setTreatments(filteredTreatments)
      
      // Get patient's invoices
      const patientInvoices = mockInvoices.filter(i => i.patient_id === id)
      setInvoices(patientInvoices)
      
      // Get patient's X-ray files
      const patientXrays = mockXRayFiles.filter(x => x.patient_id === id)
      setXrayFiles(patientXrays)
      
      // Get patient's visits
      const patientVisits = mockVisits.filter(v => v.patient_id === id)
      setVisits(patientVisits)
    } catch (error) {
      console.error("Error fetching patient details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle X-ray file upload
  const handleXrayUpload = async (file: File, description: string) => {
    try {
      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file)
      
      // Create new X-ray file object
      const newXrayFile = {
        id: `xray-${Date.now()}`,
        patient_id: id as string,
        uploaded_by: "current-user-id",
        file_type: "xray",
        file_url: localUrl,
        file_size: file.size,
        description,
        treatment_id: "",
        is_active: true,
        branch_id: patient?.branch_id || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to mock data (in a real app, this would be saved to the database)
      mockXRayFiles.push(newXrayFile)
      
      // Update state
      setXrayFiles([...xrayFiles, newXrayFile])
      
      // Close modal
      setShowXrayModal(false)
      
      toast.success("X-ray file uploaded successfully")
    } catch (error) {
      console.error("Error uploading X-ray:", error)
      toast.error("Failed to upload X-ray file")
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

  if (!patient) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-secondary">Patient Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-secondary/60">The requested patient could not be found.</p>
            <Button onClick={() => router.push("/dashboard/patients")} className="mt-4">
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    unpaid: "bg-red-100 text-red-800",
  }

  // Get the most recent visit for the patient
  const getLastVisit = () => {
    if (visits.length === 0) return null
    
    // Sort visits by date (most recent first)
    const sortedVisits = [...visits].sort((a, b) => 
      new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
    )
    
    return sortedVisits[0]
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Patient Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-gray-200 border-4 border-primary mb-4 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-secondary">
                {patient.first_name} {patient.last_name}
              </h2>
              
              <div className="mt-2 flex items-center gap-2">
                <Badge className={patient.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {patient.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="mt-4 w-full space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary" />
                  <span className="text-secondary/80">{patient.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary" />
                  <span className="text-secondary/80">{patient.phone}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-secondary/80">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-secondary/80">
                    {patient.address}, {patient.city}, {patient.postal_code}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-secondary mb-2">Emergency Contact</h3>
                <p className="text-secondary/80">{patient.emergency_contact_name}</p>
                <p className="text-secondary/60">{patient.emergency_contact_phone}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-secondary mb-2">Gender</h3>
                <p className="text-secondary/80 capitalize">{patient.gender}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-secondary mb-2">Medical History</h3>
                <p className="text-secondary/80">
                  {patient.medical_history || "No medical history recorded"}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-secondary mb-2">Dental History</h3>
                <p className="text-secondary/80">
                  {patient.dental_history || "No dental history recorded"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-secondary mb-2">Allergies</h3>
                  <p className="text-secondary/80">
                    {patient.allergies || "No allergies recorded"}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-secondary mb-2">Current Medications</h3>
                  <p className="text-secondary/80">
                    {patient.current_medications || "No medications recorded"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* X-Ray Files Section - Only show for doctors and xray_technicians */}
          {(userRole === "doctor" || userRole === "xray_technician") && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>X-Ray Files</CardTitle>
                  {userRole === "xray_technician" && patient && (
                    <Button 
                      onClick={() => setShowXrayModal(true)}
                      size="sm"
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <Plus size={16} className="mr-2" />
                      Attach X-Ray
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {xrayFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {xrayFiles.map((xray) => (
                      <div key={xray.id} className="border rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <img 
                            src={xray.file_url} 
                            alt={xray.description || "X-ray image"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{xray.description || "X-ray Image"}</p>
                          <p className="text-xs text-secondary/60 mt-1">
                            {new Date(xray.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary/60">
                    {userRole === "xray_technician" 
                      ? "No X-ray files attached. Click 'Attach X-Ray' to add one." 
                      : "No X-ray files available for this patient."}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Treatments */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Treatment History</CardTitle>
                {/* Continue Last Visit button for receptionists */}
                {userRole === "receptionist" && getLastVisit() && (
                  <Button 
                    onClick={() => setShowContinueVisitModal(true)}
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Continue Last Visit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {treatments.length > 0 ? (
                <div className="space-y-6">
                  {treatments.map((treatment) => {
                    const doctorName = getDoctorName(treatment.doctor_id)
                    
                    // Get services for this treatment
                    const treatmentServices: any[] = [] // In a real app, this would fetch services for the treatment
                    
                    // Get invoice for this treatment
                    const treatmentInvoice = invoices.find(inv => (inv as any).treatment_id === treatment.id)
                    
                    return (
                      <div key={treatment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">Treatment #{treatment.id.slice(-4)}</h3>
                            <p className="text-sm text-secondary/60">
                              {new Date(treatment.treatment_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="capitalize">{treatment.status}</Badge>
                        </div>
                        <p className="text-secondary/80 mb-3">{treatment.notes}</p>
                        
                        {/* Services for this treatment */}
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-2">Services:</h4>
                          {treatmentServices.length > 0 ? (
                            <div className="space-y-2">
                              {treatmentServices.map((service: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{service.name}</span>
                                  <span>${service.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-secondary/60 text-sm">No services recorded</p>
                          )}
                        </div>
                        
                        {/* Invoice for this treatment */}
                        {treatmentInvoice && (
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Invoice Details:</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Invoice #:</span>
                                <span>{treatmentInvoice.invoice_number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${treatmentInvoice.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${treatmentInvoice.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>${treatmentInvoice.total_amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge className={statusColors[treatmentInvoice.status] || "bg-gray-100"}>
                                  {treatmentInvoice.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <p className="font-medium">${treatment.total_cost.toFixed(2)}</p>
                          <p className="text-sm text-secondary/60">
                            Dr. {doctorName}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-secondary/60">No treatments recorded</p>
              )}
            </CardContent>
          </Card>
          
          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Invoice #</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Total</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b">
                          <td className="py-2 font-medium">{invoice.invoice_number}</td>
                          <td className="py-2 text-secondary/80">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="py-2">${invoice.total_amount.toFixed(2)}</td>
                          <td className="py-2">
                            <Badge className={statusColors[invoice.status] || "bg-gray-100"}>
                              {invoice.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary/60">No invoices recorded</p>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push("/dashboard/patients")}
              variant="outline"
            >
              Back to Patients
            </Button>
            <Button>
              Edit Patient
            </Button>
          </div>
        </div>
      </div>
      
      {/* X-Ray Attachment Modal */}
      {showXrayModal && patient && (
        <AttachXrayModal
          patientId={patient.id}
          patientName={`${patient.first_name} ${patient.last_name}`}
          branchId={patient.branch_id}
          onClose={() => setShowXrayModal(false)}
          onSave={() => {
            // Refresh X-ray files
            const patientXrays = mockXRayFiles.filter(x => x.patient_id === patient.id)
            setXrayFiles(patientXrays)
          }}
        />
      )}
      
      {/* Continue Last Visit Modal */}
      {showContinueVisitModal && patient && (
        <ContinueVisitModal
          patientId={patient.id}
          patientName={`${patient.first_name} ${patient.last_name}`}
          lastVisit={getLastVisit()}
          onClose={() => setShowContinueVisitModal(false)}
          onSave={() => {
            // Refresh visits and treatments
            const patientVisits = mockVisits.filter(v => v.patient_id === patient.id)
            setVisits(patientVisits)
            
            const patientTreatments = mockTreatments.filter(t => t.patient_id === patient.id)
            setTreatments(patientTreatments)
          }}
        />
      )}
    </div>
  )
}