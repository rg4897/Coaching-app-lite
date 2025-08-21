"use client"

import { useState } from "react"
import Link from "next/link"
import { useLiveData } from "@/hooks/use-live-data"
import { storage } from "@/lib/storage"
import { formatDate } from "@/utils/date"
import { calculateOutstanding } from "@/utils/calculations"
import { formatCurrency } from "@/utils/currency"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, Edit, Trash2, UserPlus, Users } from "lucide-react"
import type { Student } from "@/types"
import { StudentForm } from "@/components/forms/student-form"

export default function StudentsPage() {
  const { students, payments, settings, refreshData } = useLiveData()
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("list")

  // Get unique grades for filter
  const grades = Array.from(new Set(students.map((s) => s.grade))).sort()

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter

    return matchesSearch && matchesGrade && matchesStatus
  })

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      storage.deleteStudent(studentId)
      refreshData()
    }
  }

  const getPaymentStatus = (student: Student) => {
    const outstanding = calculateOutstanding(student, payments)
    if (outstanding === 0) return "paid"
    if (outstanding > 0 && payments.some((p) => p.studentId === student.id)) return "partial"
    return "unpaid"
  }

  const handleStudentCreated = () => {
    setActiveTab("list")
    refreshData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and enrollment</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab("form")} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Tabs for list and form views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students List
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Student
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</div>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{grades.length}</div>
                <p className="text-sm text-muted-foreground">Grade Levels</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {students.filter((s) => getPaymentStatus(s) === "unpaid").length}
                </div>
                <p className="text-sm text-muted-foreground">Unpaid Students</p>
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
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students found</p>
                  {students.length === 0 && (
                    <Button onClick={() => setActiveTab("form")} className="mt-4">
                      Add your first student
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const outstanding = calculateOutstanding(student, payments)
                      const paymentStatus = getPaymentStatus(student)

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              {student.contactEmail && (
                                <div className="text-sm text-muted-foreground">{student.contactEmail}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "active" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                paymentStatus === "paid"
                                  ? "default"
                                  : paymentStatus === "partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(outstanding, settings?.currency)}</TableCell>
                          <TableCell>{formatDate(student.enrollmentDate, settings?.dateFormat)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/students/${student.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
              <p className="text-muted-foreground">
                Create a new student record and assign multiple fees from templates
              </p>
            </CardHeader>
            <CardContent>
              <StudentForm onSuccess={handleStudentCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
