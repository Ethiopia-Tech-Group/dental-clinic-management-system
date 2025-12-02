"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileImage, X } from "lucide-react"

interface XrayFile {
  id: string
  patient_id: string
  file_type: string
  file_url: string
  file_size: number
  description: string
  treatment_id: string
}

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Treatment {
  id: string
  treatment_date: string
}

interface XrayModalProps {
  xray: XrayFile | null
  onClose: () => void
  onSave: () => void
  patients: Patient[]
  treatments: Treatment[]
  fetchTreatments: (patientId: string) => void
  xrayRequest?: any // Optional X-ray request data
}

export default function XrayModal({ xray, onClose, onSave, patients, treatments, fetchTreatments, xrayRequest }: XrayModalProps) {
  const [formData, setFormData] = useState({
    patient_id: "",
    file_type: "xray",
    description: "",
    treatment_id: "",
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (xray) {
      setFormData({
        patient_id: xray.patient_id || "",
        file_type: xray.file_type || "xray",
        description: xray.description || "",
        treatment_id: xray.treatment_id || "",
      })
      setPreviewUrl(xray.file_url || null)
    } else if (xrayRequest) {
      // Pre-fill form with X-ray request data
      setFormData({
        patient_id: xrayRequest.patient_id || "",
        file_type: "xray",
        description: `X-ray for treatment ${xrayRequest.treatment_id?.substring(0, 8) || ''}`,
        treatment_id: xrayRequest.treatment_id || "",
      })
    }
  }, [xray, xrayRequest])

  useEffect(() => {
    if (formData.patient_id && !xray) {
      fetchTreatments(formData.patient_id)
    }
  }, [formData.patient_id, fetchTreatments, xray])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.match("image.*")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB")
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (xray?.file_url) {
      setPreviewUrl(xray.file_url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!xray && !file) {
      toast.error("Please select a file to upload")
      return
    }
    
    setIsLoading(true)
    setError(null)
    setUploading(true)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would save to the database
      // For now, we'll just show a success message
      toast.success(xray ? "X-ray file updated successfully" : "X-ray file uploaded successfully")
      onSave()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
      setUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{xray ? "View X-Ray File" : "Upload X-Ray File"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              disabled={isLoading || !!xray}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">File Type *</Label>
            <Select
              value={formData.file_type}
              onValueChange={(value) => setFormData({ ...formData, file_type: value })}
              disabled={isLoading || !!xray}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xray">X-Ray</SelectItem>
                <SelectItem value="scan">Scan</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="before_after">Before/After</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.patient_id && (
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment (Optional)</Label>
              <Select
                value={formData.treatment_id}
                onValueChange={(value) => setFormData({ ...formData, treatment_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No treatment</SelectItem>
                  {treatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {new Date(treatment.treatment_date).toLocaleDateString()} - Treatment
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="Add a description for this file..."
            />
          </div>

          {!xray && (
            <div className="space-y-2">
              <Label>File Upload *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileImage size={48} className="text-gray-400" />
                    <p className="text-gray-500">Drag and drop your file here, or click to browse</p>
                    <p className="text-sm text-gray-400">Supports images up to 10MB</p>
                  </div>
                )}
                
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || isLoading}
                  className="hidden"
                  id="file-upload"
                />
                <Label 
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition mt-4"
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </Label>
              </div>
            </div>
          )}

          {xray && previewUrl && (
            <div className="space-y-2">
              <Label>File Preview</Label>
              <div className="border rounded-lg p-4">
                <img 
                  src={previewUrl} 
                  alt="X-ray preview" 
                  className="max-h-96 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || uploading}>
              Cancel
            </Button>
            {!xray && (
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark" 
                disabled={isLoading || uploading || !formData.patient_id || (!file && !xray)}
              >
                {uploading ? "Uploading..." : "Upload X-Ray"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}