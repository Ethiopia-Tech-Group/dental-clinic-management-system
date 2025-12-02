"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mockTreatments, mockPatients, mockDoctors } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddTreatmentPage() {
  const router = useRouter();
  const { currentBranch } = useBranch();
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    treatment_date: new Date().toISOString().split('T')[0],
    notes: "",
    status: "pending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }
    
    if (!formData.doctor_id) {
      toast.error("Please select a doctor");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Create new treatment object
      const newTreatment = {
        id: `treatment-${Date.now()}`,
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        branch_id: currentBranch?.id || "",
        status: formData.status,
        treatment_date: new Date(formData.treatment_date).toISOString(),
        notes: formData.notes,
        total_cost: 0, // Would be calculated based on services
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock data (in a real app, this would be saved to the database)
      mockTreatments.push(newTreatment as any);
      
      toast.success("Treatment created successfully");
      router.push("/dashboard/treatments");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patients and doctors by current branch
  const branchPatients = mockPatients.filter(p => p.branch_id === currentBranch?.id);
  const branchDoctors = mockDoctors.filter(d => d.branch_id === currentBranch?.id);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Add New Treatment</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {branchPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor *</Label>
            <Select
              value={formData.doctor_id}
              onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {branchDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentDate">Treatment Date</Label>
            <Input
              id="treatmentDate"
              type="date"
              value={formData.treatment_date}
              onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              rows={4}
              placeholder="Enter treatment notes..."
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Treatment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}