"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { FileImage, X } from "lucide-react"
import { mockXRayFiles } from "@/data/mockData"

interface AttachXrayModalProps {
  patientId: string
  patientName: string
  branchId: string
  onClose: () => void
  onSave: () => void
}

export default function AttachXrayModal({ patientId, patientName, branchId, onClose, onSave }: AttachXrayModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error("Please select a file to upload")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file)
      
      // Create new X-ray file object
      const newXrayFile = {
        id: `xray-${Date.now()}`,
        patient_id: patientId,
        uploaded_by: "current-user-id", // In a real app, this would be the actual user ID
        file_type: "xray",
        file_url: localUrl,
        file_size: file.size,
        description,
        treatment_id: "",
        is_active: true,
        branch_id: branchId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to mock data (in a real app, this would be saved to the database)
      mockXRayFiles.push(newXrayFile as any)
      
      toast.success("X-ray file uploaded successfully")
      onSave()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attach X-Ray for {patientName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
                className="hidden"
                id="file-upload"
              />
              <Label 
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition mt-4"
              >
                Choose File
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="Add a description for this X-ray..."
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark" 
              disabled={isLoading || !file}
            >
              {isLoading ? "Uploading..." : "Attach X-Ray"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}