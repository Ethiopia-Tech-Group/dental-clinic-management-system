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
import { mockPatients, mockDoctors, mockBranches, mockServices } from "@/data/mockData"

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
}

interface Payment {
  id: string
  amount: number
  payment_method: string
  payment_date: string
  notes: string
}

interface InvoiceModalProps {
  invoice: Invoice | null
  onClose: () => void
  onSave: () => void
}

export default function InvoiceModal({ invoice, onClose, onSave }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoice_number: "",
    patient_id: "",
    doctor_id: "",
    branch_id: "",
    subtotal: 0,
    tax: 0,
    discount: 0,
    total_amount: 0,
    amount_paid: 0,
    balance_remaining: 0,
    status: "unpaid",
    invoice_date: "",
    due_date: "",
  })
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    payment_method: "",
    notes: "",
  })
  
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingPayment, setIsSavingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number || "",
        patient_id: invoice.patient_id || "",
        doctor_id: invoice.doctor_id || "",
        branch_id: invoice.branch_id || "",
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        total_amount: invoice.total_amount || 0,
        amount_paid: invoice.amount_paid || 0,
        balance_remaining: invoice.balance_remaining || 0,
        status: invoice.status || "unpaid",
        invoice_date: invoice.invoice_date || "",
        due_date: invoice.due_date || "",
      })
      fetchPayments(invoice.id)
    }
  }, [invoice])

  const fetchData = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Use mock data
      setPatients(mockPatients)
      setDoctors(mockDoctors)
      setBranches(mockBranches)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    }
  }

  const fetchPayments = async (invoiceId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For mock data, we don't have payments stored, so we'll just set an empty array
      setPayments([])
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments")
    }
  }

  // Auto-calculate totals when subtotal, tax, or discount changes
  useEffect(() => {
    const total = formData.subtotal + formData.tax - formData.discount
    const balance = total - formData.amount_paid
    
    // Update status based on balance
    let newStatus = "unpaid"
    if (formData.amount_paid >= total) {
      newStatus = "paid"
    } else if (formData.amount_paid > 0) {
      newStatus = "partial"
    }
    
    setFormData(prev => ({
      ...prev,
      total_amount: parseFloat(total.toFixed(2)),
      balance_remaining: parseFloat(balance.toFixed(2)),
      status: newStatus
    }))
  }, [formData.subtotal, formData.tax, formData.discount, formData.amount_paid])

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return
    
    setIsSavingPayment(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Add payment to local state
      const newPaymentData: Payment = {
        id: `payment-${Date.now()}`,
        amount: newPayment.amount,
        payment_method: newPayment.payment_method,
        payment_date: new Date().toISOString(),
        notes: newPayment.notes,
      }
      
      setPayments(prev => [newPaymentData, ...prev])
      
      // Update invoice with new payment amount
      const newAmountPaid = formData.amount_paid + newPayment.amount
      const newBalance = formData.total_amount - newAmountPaid
      
      // Update status based on new balance
      let newStatus = "unpaid"
      if (newAmountPaid >= formData.total_amount) {
        newStatus = "paid"
      } else if (newAmountPaid > 0) {
        newStatus = "partial"
      }

      setFormData(prev => ({
        ...prev,
        amount_paid: parseFloat(newAmountPaid.toFixed(2)),
        balance_remaining: parseFloat(newBalance.toFixed(2)),
        status: newStatus
      }))
      
      setNewPayment({
        amount: 0,
        payment_method: "",
        notes: "",
      })
      
      toast.success("Payment recorded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record payment"
      setError(message)
      toast.error(message)
    } finally {
      setIsSavingPayment(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(invoice ? "Invoice updated successfully" : "Invoice created successfully")
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                disabled={isLoading || !!invoice}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoice_date ? formData.invoice_date.split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                disabled={isLoading}
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date ? formData.due_date.split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal ($)</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax">Tax ($)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">Discount ($)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total">Total ($)</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={formData.total_amount}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paid">Amount Paid ($)</Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance_remaining}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {invoice && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Record Payment</h3>
              <form onSubmit={handleAddPayment} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Amount ($)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                      disabled={isSavingPayment}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={newPayment.payment_method}
                      onValueChange={(value) => setNewPayment({ ...newPayment, payment_method: value })}
                      disabled={isSavingPayment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentNotes">Notes</Label>
                  <Textarea
                    id="paymentNotes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    disabled={isSavingPayment}
                    rows={2}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark" 
                  disabled={isSavingPayment || !newPayment.amount || !newPayment.payment_method}
                >
                  {isSavingPayment ? "Recording..." : "Record Payment"}
                </Button>
              </form>
              
              {payments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Payment History</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{payment.payment_method}</p>
                          {payment.notes && <p className="text-xs text-gray-500">{payment.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isSavingPayment}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark" 
              disabled={isLoading || isSavingPayment}
            >
              {isLoading ? "Saving..." : "Save Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}