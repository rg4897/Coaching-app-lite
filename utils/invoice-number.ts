import { storage } from "@/lib/storage"

export function generateInvoiceNumber(): string {
  const currentSettings = storage.getSettings()
  const nextSeq = currentSettings.invoiceSeq || 1
  storage.setSettings({ ...currentSettings, invoiceSeq: nextSeq + 1 })
  return `INV-${new Date().getFullYear()}-${nextSeq.toString().padStart(4, "0")}`
}

export function assignInvoiceNumbersToExistingStudents(): void {
  const students = storage.getStudents()
  let hasChanges = false
  
  students.forEach((student) => {
    if (!student.invoiceNumber) {
      student.invoiceNumber = generateInvoiceNumber()
      hasChanges = true
    }
  })
  
  if (hasChanges) {
    storage.setStudents(students)
  }
}
