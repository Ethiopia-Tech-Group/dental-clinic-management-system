"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Upload, Eye, Download, Trash2, FileImage } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// @ts-ignore
import XrayModal from "@/components/dashboard/xray-modal"
import { mockXRayFiles, mockPatients, mockTreatments } from "@/data/mockData"
import { MockXRayFile, MockPatient, MockTreatment } from "@/data/mockData"

interface XrayFile extends MockXRayFile {
  patients?: {
    first_name: string
    last_name: string
  }
  treatment_records?: {
    id: string
  }
}

export default function XraysPage() {
  const [xrayFiles, setXrayFiles] = useState<XrayFile[]>([])
  const [filteredXrays, setFilteredXrays] = useState<XrayFile[]>([])
  const [patients, setPatients] = useState<MockPatient[]>([])
  const [treatments, setTreatments] = useState<MockTreatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPatient, setFilterPatient] = useState("")
  const [filterType, setFilterType] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedXray, setSelectedXray] = useState<XrayFile | null>(null)

  useEffect(() => {
    fetchXrayFiles()
    fetchPatients()
  }, [])

  useEffect(() => {
    let filtered = xrayFiles.filter((xray) => {
      const fullName = `${xray.patients?.first_name || ""} ${xray.patients?.last_name || ""}`.toLowerCase()
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        xray.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    if (filterPatient) {
      filtered = filtered.filter((xray) => xray.patient_id === filterPatient)
    }

    if (filterType) {
      filtered = filtered.filter((xray) => xray.file_type === filterType)
    }

    setFilteredXrays(filtered)
  }, [searchTerm, filterPatient, filterType, xrayFiles])

  const fetchXrayFiles = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Enrich xray files with patient data
      const enrichedXrays = mockXRayFiles.map(xray => {
        const patient = mockPatients.find(p => p.id === xray.patient_id)
        const treatment = mockTreatments.find(t => t.id === xray.treatment_id)
        return {
          ...xray,
          patients: patient ? { first_name: patient.first_name, last_name: patient.last_name } : undefined,
          treatment_records: treatment ? { id: treatment.id } : undefined
        }
      })
      
      setXrayFiles(enrichedXrays)
    } catch (error) {
      console.error("Error fetching x-ray files:", error)
      toast.error("Failed to load x-ray files")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setPatients(mockPatients)
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  const fetchTreatments = async (patientId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter treatments for this patient
      const patientTreatments = mockTreatments.filter(t => t.patient_id === patientId)
      setTreatments(patientTreatments)
    } catch (error) {
      console.error("Error fetching treatments:", error)
    }
  }

  const handleUpload = () => {
    setSelectedXray(null)
    setIsModalOpen(true)
  }

  const handleView = (xray: XrayFile) => {
    setSelectedXray(xray)
    setIsModalOpen(true)
  }

  const handleDownload = (fileUrl: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'xray-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDelete = async (xrayId: string) => {
    if (!confirm("Are you sure you want to delete this x-ray file?")) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setXrayFiles(xrayFiles.filter((x) => x.id !== xrayId))
      toast.success("X-ray file deleted successfully")
    } catch (error) {
      console.error("Error deleting x-ray file:", error)
      toast.error("Failed to delete x-ray file")
    }
  }

  const handleSaveXray = () => {
    setIsModalOpen(false)
    setSelectedXray(null)
    fetchXrayFiles()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">X-Ray Management</h1>
          <p className="text-secondary/60 mt-2">Upload, view, and manage patient x-ray files</p>
        </div>
        <Button onClick={handleUpload} className="bg-primary hover:bg-primary-dark gap-2">
          <Upload size={18} />
          Upload X-Ray
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Search size={20} className="text-secondary/40 mt-3" />
              <Input
                placeholder="Search by patient name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <div>
              <Select value={filterPatient} onValueChange={setFilterPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Patients</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="scan">Scan</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="before_after">Before/After</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setFilterPatient("")
                  setFilterType("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* X-Ray Files Table */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>X-Ray Files</CardTitle>
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
                    <TableHead>File</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredXrays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-secondary/60">
                        <FileImage size={48} className="mx-auto text-secondary/20 mb-4" />
                        No x-ray files found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredXrays.map((xray) => (
                      <TableRow key={xray.id} className="border-primary/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                              <FileImage size={20} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{xray.description || "Untitled"}</p>
                              <p className="text-sm text-secondary/60">
                                {xray.treatment_records ? "Linked to treatment" : "No treatment"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {xray.patients?.first_name} {xray.patients?.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge className="capitalize">
                            {xray.file_type || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {xray.file_size ? formatFileSize(xray.file_size) : "Unknown"}
                        </TableCell>
                        <TableCell>
                          {new Date(xray.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(xray)}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="View"
                            >
                              <Eye size={16} className="text-primary" />
                            </button>
                            <button
                              onClick={() => handleDownload(xray.file_url)}
                              className="p-2 hover:bg-primary/10 rounded transition"
                              title="Download"
                            >
                              <Download size={16} className="text-primary" />
                            </button>
                            <button
                              onClick={() => handleDelete(xray.id)}
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

      {isModalOpen && (
        <XrayModal
          xray={selectedXray}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedXray(null)
          }}
          onSave={handleSaveXray}
          patients={patients}
          treatments={treatments}
          fetchTreatments={fetchTreatments}
        />
      )}
    </div>
  )
}