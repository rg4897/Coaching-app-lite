"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { generateUUID } from "@/utils/uuid"
import { generateInvoiceNumber } from "@/utils/invoice-number"
import { useLiveData } from "@/hooks/use-live-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Student, FeeTemplate, StudentFeeLine } from "@/types"

interface StudentFormProps {
  student?: Student
  onSuccess?: () => void
  onCancel?: () => void
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const router = useRouter()
  const { feeTemplates, settings, refreshData } = useLiveData()

  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    studentId: student?.studentId || "",
    grade: student?.grade || "",
    contactPhone: student?.contactPhone || "",
    contactEmail: student?.contactEmail || "",
    guardianName: student?.guardianName || "",
    enrollmentDate: student?.enrollmentDate
      ? student.enrollmentDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: student?.status || ("active" as const),
    notes: student?.notes || "",
  })

  const [selectedFeeTemplates, setSelectedFeeTemplates] = useState<any>(
    student?.assignedFees.map((fee) => fee.templateId).filter(Boolean) || [],
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFeeTemplateToggle = (templateId: string) => {
    setSelectedFeeTemplates((prev:any) =>
      prev.includes(templateId) ? prev.filter((id:any) => id !== templateId) : [...prev, templateId],
    )
  }

  const createFeeLines = (templates: FeeTemplate[]): StudentFeeLine[] => {
    return templates.map((template) => ({
      id: generateUUID(),
      templateId: template.id,
      title: template.title,
      amount: template.amount,
      dueDate: template.dueDay ? calculateDueDate(template) : undefined,
      createdAt: new Date().toISOString(),
      status: "open" as const,
      paymentsApplied: [],
    }))
  }

  const calculateDueDate = (template: FeeTemplate): string => {
    const now = new Date()
    let dueDate = new Date(now.getFullYear(), now.getMonth(), template.dueDay || 1)

    // If the due date has passed this month, set it for next month
    if (dueDate < now) {
      dueDate = new Date(now.getFullYear(), now.getMonth() + 1, template.dueDay || 1)
    }

    return dueDate.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const selectedTemplates = feeTemplates.filter((template) => selectedFeeTemplates.includes(template.id))

      // Generate invoice number for new students or if student doesn't have one
      const invoiceNumber = student?.invoiceNumber || generateInvoiceNumber()

      const studentData: Student = {
        id: student?.id || generateUUID(),
        ...formData,
        enrollmentDate: new Date(formData.enrollmentDate).toISOString(),
        invoiceNumber: invoiceNumber,
        assignedFees: student
          ? [
              // Keep existing fees that aren't from templates being removed
              ...student.assignedFees.filter((fee) => !fee.templateId || selectedFeeTemplates.includes(fee.templateId)),
              // Add new fees from newly selected templates
              ...createFeeLines(
                selectedTemplates.filter(
                  (template) => !student.assignedFees.some((fee) => fee.templateId === template.id),
                ),
              ),
            ]
          : createFeeLines(selectedTemplates),
      }

      if (student) {
        storage.updateStudent(student.id, studentData)
      } else {
        storage.addStudent(studentData)
      }

      refreshData()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/students")
      }
    } catch (error) {
      console.error("Error saving student:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {settings?.gradeOptions?.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  )) || [
                    <SelectItem key="k-1" value="K-1">K-1</SelectItem>,
                    <SelectItem key="k-2" value="K-2">K-2</SelectItem>,
                    <SelectItem key="1st" value="1st">1st</SelectItem>,
                    <SelectItem key="2nd" value="2nd">2nd</SelectItem>,
                    <SelectItem key="3rd" value="3rd">3rd</SelectItem>,
                    <SelectItem key="4th" value="4th">4th</SelectItem>,
                    <SelectItem key="5th" value="5th">5th</SelectItem>,
                    <SelectItem key="6th" value="6th">6th</SelectItem>,
                    <SelectItem key="7th" value="7th">7th</SelectItem>,
                    <SelectItem key="8th" value="8th">8th</SelectItem>,
                    <SelectItem key="9th" value="9th">9th</SelectItem>,
                    <SelectItem key="10th" value="10th">10th</SelectItem>,
                    <SelectItem key="11th" value="11th">11th</SelectItem>,
                    <SelectItem key="12th" value="12th">12th</SelectItem>
                  ]}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => handleInputChange("guardianName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => handleInputChange("enrollmentDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {feeTemplates.length === 0 ? (
            <p className="text-muted-foreground">
              No fee templates available. Create fee templates first to assign them to students.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {feeTemplates.map((template) => (
                  <div key={template.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={template.id}
                      checked={selectedFeeTemplates.includes(template.id)}
                      onCheckedChange={() => handleFeeTemplateToggle(template.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={template.id} className="font-medium cursor-pointer">
                        {template.title}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="outline">{template.frequency}</Badge>
                        <span className="text-sm text-muted-foreground">${template.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedFeeTemplates.length > 0 && (
                <div className="mt-4">
                  <Label>Selected Fees:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFeeTemplates.map((templateId:any) => {
                      const template = feeTemplates.find((t) => t.id === templateId)
                      return template ? (
                        <Badge key={templateId} variant="default" className="flex items-center gap-1">
                          {template.title} (${template.amount})
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleFeeTemplateToggle(templateId)} />
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : student ? "Update Student" : "Create Student"}
        </Button>
      </div>
    </form>
  )
}
