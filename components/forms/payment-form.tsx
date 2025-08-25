"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLiveData } from "@/hooks/use-live-data"
import { storage } from "@/lib/storage"
import { generateUUID } from "@/utils/uuid"
import { formatCurrency } from "@/utils/currency"
import { calculateOutstanding, updateFeeLineStatus } from "@/utils/calculations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { StudentForm } from "@/components/forms/student-form"
import type { Payment } from "@/types"

interface PaymentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface FeeApplication {
  feeLineId: string
  amount: number
}

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const { students, payments, settings, refreshData } = useLiveData()
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentNotes, setPaymentNotes] = useState("")
  const [feeApplications, setFeeApplications] = useState<FeeApplication[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewStudentForm, setShowNewStudentForm] = useState(false)

  const selectedStudent = students.find((s) => s.id === selectedStudentId)
  const outstanding = selectedStudent ? calculateOutstanding(selectedStudent, payments) : 0
  const totalApplied = feeApplications.reduce((sum, app) => sum + app.amount, 0)
  const remainingAmount = Number.parseFloat(paymentAmount) - totalApplied || 0

  // Reset fee applications when student changes
  useEffect(() => {
    setFeeApplications([])
  }, [selectedStudentId])

  const handleFeeApplicationChange = (feeLineId: string, amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    setFeeApplications((prev) => {
      const existing = prev.find((app) => app.feeLineId === feeLineId)
      if (existing) {
        if (numAmount === 0) {
          return prev.filter((app) => app.feeLineId !== feeLineId)
        }
        return prev.map((app) => (app.feeLineId === feeLineId ? { ...app, amount: numAmount } : app))
      }
      if (numAmount > 0) {
        return [...prev, { feeLineId, amount: numAmount }]
      }
      return prev
    })
  }

  const autoApplyPayment = () => {
    if (!selectedStudent || !paymentAmount) return

    const amount = Number.parseFloat(paymentAmount)
    let remainingToApply = amount
    const applications: FeeApplication[] = []

    // Sort fees by due date (overdue first, then by due date)
    const sortedFees = [...selectedStudent.assignedFees].sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date()
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date()

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }

      return 0
    })

    for (const fee of sortedFees) {
      if (remainingToApply <= 0) break

      const alreadyPaid = fee.paymentsApplied.reduce((sum, p) => sum + p.amount, 0)
      const feeBalance = fee.amount - alreadyPaid

      if (feeBalance > 0) {
        const applicationAmount = Math.min(remainingToApply, feeBalance)
        applications.push({ feeLineId: fee.id, amount: applicationAmount })
        remainingToApply -= applicationAmount
      }
    }

    setFeeApplications(applications)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setIsSubmitting(true)

    try {
      const payment: Payment = {
        id: generateUUID(),
        studentId: selectedStudent.id,
        date: new Date(paymentDate).toISOString(),
        amount: Number.parseFloat(paymentAmount),
        method: paymentMethod,
        notes: paymentNotes || undefined,
        appliedTo: feeApplications,
      }

      // Add payment
      storage.addPayment(payment)

      // Update student fee lines with payment applications
      const updatedFees = selectedStudent.assignedFees.map((fee) => {
        const application = feeApplications.find((app) => app.feeLineId === fee.id)
        if (application) {
          const updatedFee = {
            ...fee,
            paymentsApplied: [...fee.paymentsApplied, { paymentId: payment.id, amount: application.amount }],
          }
          return updateFeeLineStatus(updatedFee)
        }
        return fee
      })

      storage.updateStudent(selectedStudent.id, { assignedFees: updatedFees })

      refreshData()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error recording payment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewStudentSuccess = () => {
    setShowNewStudentForm(false)
    refreshData()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Select Student
              <Button type="button" variant="default" size="sm" onClick={() => setShowNewStudentForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Student
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter((s) => s.status === "active")
                  .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                  .map((student) => {
                    const studentOutstanding = calculateOutstanding(student, payments)
                    return (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {student.firstName} {student.lastName} ({student.grade})
                          </span>
                          {studentOutstanding > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {formatCurrency(studentOutstanding, settings?.currency)}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>

            {selectedStudent && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.studentId} • {selectedStudent.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="text-lg font-bold text-destructive">
                      {formatCurrency(outstanding, settings?.currency)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Payment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional notes about this payment..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fee Application */}
        {selectedStudent && selectedStudent.assignedFees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Apply Payment to Fees
                <Button type="button" variant="outline" size="sm" onClick={autoApplyPayment}>
                  Auto Apply
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent.assignedFees.map((fee) => {
                const alreadyPaid = fee.paymentsApplied.reduce((sum, p) => sum + p.amount, 0)
                const feeBalance = fee.amount - alreadyPaid
                const currentApplication = feeApplications.find((app) => app.feeLineId === fee.id)

                return (
                  <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{fee.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Total: {formatCurrency(fee.amount, settings?.currency)} • Paid:{" "}
                        {formatCurrency(alreadyPaid, settings?.currency)} • Balance:{" "}
                        {formatCurrency(feeBalance, settings?.currency)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            fee.status === "paid"
                              ? "default"
                              : fee.status === "partial"
                                ? "secondary"
                                : fee.status === "overdue"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {fee.status}
                        </Badge>
                        {fee.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={feeBalance}
                        value={currentApplication?.amount || ""}
                        onChange={(e) => handleFeeApplicationChange(fee.id, e.target.value)}
                        placeholder="0.00"
                        disabled={feeBalance <= 0}
                      />
                    </div>
                  </div>
                )
              })}

              <Separator />

              <div className="flex justify-between items-center text-sm">
                <span>Payment Amount:</span>
                <span className="font-medium">
                  {formatCurrency(Number.parseFloat(paymentAmount) || 0, settings?.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Applied to Fees:</span>
                <span className="font-medium">{formatCurrency(totalApplied, settings?.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Remaining:</span>
                <span className={`font-medium ${remainingAmount < 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(remainingAmount, settings?.currency)}
                </span>
              </div>

              {remainingAmount < 0 && (
                <div className="text-sm text-destructive">Warning: You're applying more than the payment amount!</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !selectedStudent || !paymentAmount || remainingAmount < 0}>
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>

      {/* New Student Dialog */}
      <Dialog open={showNewStudentForm} onOpenChange={setShowNewStudentForm}>
        <div className="overflow-hidden">
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto customScrollbarWidth">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <StudentForm onSuccess={handleNewStudentSuccess} onCancel={() => setShowNewStudentForm(false)} />
          </DialogContent>
        </div>
      </Dialog>
    </>
  )
}
