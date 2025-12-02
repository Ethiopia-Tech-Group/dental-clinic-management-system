"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { mockDoctors } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditDoctorPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranch } = useBranch();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    license_number: "",
    specialties: [] as string[],
    qualifications: "",
    experience_years: "",
    is_active: true,
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load doctor data when component mounts
  useEffect(() => {
    if (id) {
      const doctor = mockDoctors.find(d => d.id === id);
      if (doctor) {
        setFormData({
          first_name: doctor.first_name || "",
          last_name: doctor.last_name || "",
          license_number: doctor.license_number || "",
          specialties: doctor.specialties || [],
          qualifications: doctor.qualifications || "",
          experience_years: doctor.experience_years?.toString() || "",
          is_active: doctor.is_active || true,
        });
      } else {
        toast.error("Doctor not found");
        router.push("/dashboard/doctors");
      }
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    
    if (!formData.license_number.trim()) {
      toast.error("License number is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Update doctor in mock data
      const doctorIndex = mockDoctors.findIndex(d => d.id === id);
      if (doctorIndex !== -1) {
        mockDoctors[doctorIndex] = {
          ...mockDoctors[doctorIndex],
          first_name: formData.first_name,
          last_name: formData.last_name,
          license_number: formData.license_number,
          specialties: formData.specialties,
          qualifications: formData.qualifications,
          experience_years: parseInt(formData.experience_years) || 0,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        };
      }
      
      toast.success("Doctor updated successfully");
      router.push("/dashboard/doctors");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Edit Doctor</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add a specialty"
                disabled={isLoading}
              />
              <Button type="button" onClick={addSpecialty} disabled={isLoading || !newSpecialty.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specialties.map((specialty) => (
                <div key={specialty} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 text-blue-800 hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years of Experience</Label>
            <Input
              id="experienceYears"
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}