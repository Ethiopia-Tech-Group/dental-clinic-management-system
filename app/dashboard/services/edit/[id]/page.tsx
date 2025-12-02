"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { mockServices } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";

export default function EditServicePage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranch } = useBranch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load service data when component mounts
  useEffect(() => {
    if (id) {
      const service = mockServices.find(s => s.id === id);
      if (service) {
        setFormData({
          name: service.name || "",
          description: service.description || "",
          price: service.price?.toString() || "",
          is_active: service.is_active || true,
        });
      } else {
        toast.error("Service not found");
        router.push("/dashboard/services");
      }
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast.error("Valid price is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Update service in mock data
      const serviceIndex = mockServices.findIndex(s => s.id === id);
      if (serviceIndex !== -1) {
        mockServices[serviceIndex] = {
          ...mockServices[serviceIndex],
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        };
      }
      
      toast.success("Service updated successfully");
      router.push("/dashboard/services");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-secondary">Edit Service</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              disabled={isLoading}
              required
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