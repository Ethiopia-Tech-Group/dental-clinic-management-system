"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"

interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialties: string[]
  qualifications: string
  experience_years: number
  is_active: boolean
  profile_picture_url?: string
}

interface DoctorModalProps {
  doctor: Doctor | null
  onClose: () => void
  onSave: () => void
}

const availableSpecialties = [
  "General Dentistry",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Oral Surgery",
  "Cosmetic Dentistry",
]

export default function DoctorModal({ doctor, onClose, onSave }: DoctorModalProps) {
  const [formData, setFormData] = useState({
    license_number: "",
    specialties: [] as string[],
    qualifications: "",
    experience_years: 0,
    is_active: true,
    profile_picture_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (doctor) {
      setFormData({
        license_number: doctor.license_number || "",
        specialties: doctor.specialties || [],
        qualifications: doctor.qualifications || "",
        experience_years: doctor.experience_years || 0,
        is_active: doctor.is_active || true,
        profile_picture_url: doctor.profile_picture_url || "",
      })
      setPreviewUrl(doctor.profile_picture_url || null)
    }
  }, [doctor])

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, profile_picture_url: localUrl }))
      setPreviewUrl(localUrl)
      toast.success("Profile picture uploaded successfully")
    } catch (err) {
      console.error("Upload error:", err)
      const message = err instanceof Error ? err.message : "Failed to upload image"
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
      // Reset file input
      if (e.target) e.target.value = ""
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profile_picture_url: "" }))
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real app, this would save to the database
      // For now, we'll just show a success message
      toast.success("Doctor profile updated successfully")
      onSave()
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
          <DialogTitle>{doctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera className="text-gray-400" size={24} />
                  </div>
                )}
              </div>
              
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || isLoading}
                  className="hidden"
                  id="profile-picture"
                />
                <Label 
                  htmlFor="profile-picture"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                >
                  {uploading ? "Uploading..." : "Choose Image"}
                </Label>
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license">License Number *</Label>
            <Input
              id="license"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (Years)</Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience_years}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experience_years: Number.parseInt(e.target.value) || 0,
                })
              }
              disabled={isLoading}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {availableSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.specialties.includes(specialty)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-secondary hover:bg-gray-200"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="List degrees, certificates, etc."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isLoading}
              className="rounded border-primary"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}