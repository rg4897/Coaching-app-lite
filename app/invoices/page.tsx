"use client";

import { useState, useEffect, useMemo } from "react";
import { useLiveData } from "@/hooks/use-live-data";
import { storage } from "@/lib/storage";
import { formatCurrency } from "@/utils/currency";
import { calculateOutstanding } from "@/utils/calculations";
import {
  generateInvoiceHTML,
  generatePDF,
  downloadHTML,
} from "@/utils/pdf-generator";
import {
  generateInvoiceNumber,
  assignInvoiceNumbersToExistingStudents,
} from "@/utils/invoice-number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectWithLabel from "@/components/ui/select-with-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Search,
  Filter,
  Printer,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InvoicesPage() {
  const { students, payments, settings, refreshData } = useLiveData();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [hasAutoAssigned, setHasAutoAssigned] = useState(false);
  const [pageSize, setPageSize] = useState<number>(50);
  const [page, setPage] = useState<number>(1);
  // Auto-assign invoice numbers when component loads
  useEffect(() => {
    if (!hasAutoAssigned && students.length > 0) {
      const studentsWithoutInvoiceNumbers = students.filter(
        (student) => !student.invoiceNumber
      );
      if (studentsWithoutInvoiceNumbers.length > 0) {
        assignInvoiceNumbersToExistingStudents();
        refreshData();
      }
      setHasAutoAssigned(true);
    }
  }, [students, hasAutoAssigned, refreshData]);

  // Get unique grades
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort();
  const outstandingById = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of students) {
      map.set(s.id, calculateOutstanding(s, payments));
    }
    return map;
  }, [students, payments]);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;

    const outstanding = calculateOutstanding(student, payments);
    let matchesBalance = true;
    if (balanceFilter === "outstanding") {
      matchesBalance = outstanding > 0;
    } else if (balanceFilter === "paid") {
      matchesBalance = outstanding === 0;
    }

    return (
      matchesSearch &&
      matchesGrade &&
      matchesBalance &&
      student.status === "active"
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const generateNewInvoiceNumber = (): string => {
    const currentSettings = storage.getSettings();
    const nextSeq = currentSettings.invoiceSeq || 1;
    storage.setSettings({ ...currentSettings, invoiceSeq: nextSeq + 1 });
    refreshData();
    return `INV-${new Date().getFullYear()}-${nextSeq
      .toString()
      .padStart(4, "0")}`;
  };

  const handleGenerateInvoice = async (
    student: any,
    format: "pdf" | "html" = "pdf"
  ) => {
    setIsGenerating(true);
    try {
      // Use stored invoice number or generate a new one if not exists
      const invoiceNumber = student.invoiceNumber || generateNewInvoiceNumber();

      const invoiceData = {
        student,
        payments,
        settings: settings!,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date().toISOString(),
      };

      const htmlContent = generateInvoiceHTML(invoiceData);
      const filename = `invoice-${student.studentId}-${invoiceData.invoiceNumber}`;

      if (format === "pdf") {
        await generatePDF(htmlContent, `${filename}.pdf`);
      } else {
        downloadHTML(htmlContent, `${filename}.html`);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Error generating invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async (format: "pdf" | "html" = "pdf") => {
    if (selectedStudents.length === 0) return;

    setIsGenerating(true);
    try {
      const studentsToProcess = students.filter((s) =>
        selectedStudents.includes(s.id)
      );

      for (const student of studentsToProcess) {
        // Use stored invoice number or generate a new one if not exists
        const invoiceNumber =
          student.invoiceNumber || generateNewInvoiceNumber();

        const invoiceData = {
          student,
          payments,
          settings: settings!,
          invoiceNumber: invoiceNumber,
          invoiceDate: new Date().toISOString(),
        };

        const htmlContent = generateInvoiceHTML(invoiceData);
        const filename = `invoice-${student.studentId}-${invoiceData.invoiceNumber}`;

        if (format === "pdf") {
          await generatePDF(htmlContent, `${filename}.pdf`);
          // Add delay between generations to prevent browser issues
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          downloadHTML(htmlContent, `${filename}.html`);
        }
      }

      setSelectedStudents([]);
      setShowBulkDialog(false);
    } catch (error) {
      console.error("Error generating bulk invoices:", error);
      alert(
        "Error generating invoices. Some invoices may not have been created."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and manage student invoices
          </p>
        </div>
        <div className="flex gap-2">
          {selectedStudents.length > 0 && (
            <Button onClick={() => setShowBulkDialog(true)}>
              <Users className="mr-2 h-4 w-4" />
              Bulk Generate ({selectedStudents.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Outstanding
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredStudents.filter(
                  (s) => calculateOutstanding(s, payments) > 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Need invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Invoice #
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              INV-{new Date().getFullYear()}-
              {(settings?.invoiceSeq || 1).toString().padStart(4, "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-assigned on page load
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {(() => {
              const gradeData = [
                { value: "all", label: "All Grades" },
                ...grades.map((g) => ({ value: g, label: g })),
              ];
              return (
                <SelectWithLabel
                  data={gradeData}
                  selected={gradeFilter}
                  onChange={setGradeFilter}
                  placeholder="Grade"
                />
              );
            })()}
            {(() => {
              const balanceData = [
                { value: "all", label: "All Students" },
                { value: "outstanding", label: "With Outstanding" },
                { value: "paid", label: "Fully Paid" },
              ];
              return (
                <SelectWithLabel
                  data={balanceData}
                  selected={balanceFilter}
                  onChange={setBalanceFilter}
                  placeholder="Balance"
                />
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Students ({filteredStudents.length})
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedStudents.length === filteredStudents.length &&
                  filteredStudents.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm">Select All</Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Total Fees</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedStudents.map((student) => {
                      const totalFees = student.assignedFees.reduce(
                        (sum, fee) => sum + fee.amount,
                        0
                      );
                      const studentPayments = payments.filter(
                        (p) => p.studentId === student.id
                      );
                      const totalPaid = studentPayments.reduce(
                        (sum, payment) => sum + payment.amount,
                        0
                      );
                      const outstanding = outstandingById.get(student.id) ?? 0;

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() =>
                                handleStudentToggle(student.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.studentId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {student.invoiceNumber || "Assigning..."}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(totalFees, settings?.currency)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(totalPaid, settings?.currency)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                outstanding > 0
                                  ? "text-destructive font-medium"
                                  : "text-green-600"
                              }
                            >
                              {formatCurrency(outstanding, settings?.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleGenerateInvoice(student, "pdf")
                                }
                                disabled={isGenerating}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleGenerateInvoice(student, "html")
                                }
                                disabled={isGenerating}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => setPageSize(Number(val))}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                    <SelectItem value="100">100 / page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm px-2">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Generation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Invoice Generation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Generate invoices for {selectedStudents.length} selected students?
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleBulkGenerate("html")}
                disabled={isGenerating}
              >
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
              <Button
                onClick={() => handleBulkGenerate("pdf")}
                disabled={isGenerating}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
