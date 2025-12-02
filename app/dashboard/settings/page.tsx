"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"

interface Organization {
  id: string
  name: string
  logo_url: string
  brand_color: string
  tax_percentage: number
  discount_percentage: number
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    brand_color: "#D4AF37",
    tax_percentage: 0,
    discount_percentage: 0,
    logo_url: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock organization data
      const mockOrg = {
        id: "org-1",
        name: "Dental Clinic Management System",
        logo_url: localStorage.getItem("systemLogo") || "",
        brand_color: "#D4AF37",
        tax_percentage: 10,
        discount_percentage: 5,
      }
      
      setOrg(mockOrg)
      setFormData({
        name: mockOrg.name || "",
        brand_color: mockOrg.brand_color || "#D4AF37",
        tax_percentage: mockOrg.tax_percentage || 0,
        discount_percentage: mockOrg.discount_percentage || 0,
        logo_url: mockOrg.logo_url || "",
      })
      setPreviewUrl(mockOrg.logo_url || null)
    } catch (error) {
      console.error("Error fetching organization:", error)
    } finally {
      setIsLoading(false)
    }
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
      setFormData(prev => ({ ...prev, logo_url: localUrl }))
      setPreviewUrl(localUrl)
      
      // Store in localStorage
      localStorage.setItem("systemLogo", localUrl)
      
      toast.success("Logo uploaded successfully")
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
    setFormData(prev => ({ ...prev, logo_url: "" }))
    setPreviewUrl(null)
    localStorage.removeItem("systemLogo")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!org) throw new Error("Organization not found")

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Save to localStorage
      localStorage.setItem("organizationSettings", JSON.stringify(formData))
      
      setSuccess(true)
      toast.success("Settings saved successfully!")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">System Settings</h1>
        <p className="text-secondary/60 mt-2">Manage clinic configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Organization Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {previewUrl ? (
                        <div className="relative">
                          <img 
                            src={previewUrl} 
                            alt="Logo preview" 
                            className="w-24 h-24 object-contain rounded-lg border"
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
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Camera size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary-dark transition"
                      >
                        {uploading ? "Uploading..." : "Upload Logo"}
                      </label>
                      <p className="text-sm text-secondary/60 mt-2">
                        Recommended size: 200x200px. Max file size: 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter organization name"
                  />
                </div>

                {/* Brand Color */}
                <div className="space-y-2">
                  <Label htmlFor="brand-color">Brand Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="brand-color"
                      type="color"
                      value={formData.brand_color}
                      onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.brand_color}
                      onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Tax Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="tax-percentage">Tax Percentage (%)</Label>
                  <Input
                    id="tax-percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                {/* Discount Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="discount-percentage">Default Discount (%)</Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-secondary/80">
                  In a real application, this section would allow you to configure automated backups and export data.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" disabled className="cursor-not-allowed">
                    Export Data
                  </Button>
                  <Button variant="outline" disabled className="cursor-not-allowed">
                    Restore from Backup
                  </Button>
                </div>
                <div className="text-sm text-secondary/60">
                  <p>Note: This is a demo application. All data is stored locally in your browser.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}