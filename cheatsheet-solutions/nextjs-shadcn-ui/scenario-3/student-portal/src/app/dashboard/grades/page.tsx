"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { computeCumulativeGPA, grades, type Grade } from "@/lib/mockData"
import { BookOpen, Award, TrendingUp, Search } from "lucide-react"

/**
 * High-contrast, accessible class pair per grade tier. Replaces the generic
 * shadcn Badge variants, which rendered the same palette for every grade.
 */
function getGradeClass(grade: string): string {
  if (grade.startsWith("A")) return "bg-green-100 text-green-800"
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

const SEMESTER_FILTERS = ["all", "1st Semester", "2nd Semester"]

const GRADE_POINTS: Record<string, number> = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
}

function calculateGPA(gradeList: Grade[]): string {
  let totalPoints = 0
  let totalUnits = 0

  gradeList.forEach((g) => {
    totalPoints += (GRADE_POINTS[g.grade] ?? 0) * g.units
    totalUnits += g.units
  })

  return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00"
}

export default function GradesPage() {
  const [query, setQuery] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")

  const currentSemGrades = grades.filter(
    (g) => g.semester === "1st Semester" && g.academicYear === "2025-2026"
  )
  const previousSemGrades = grades.filter(
    (g) => g.semester === "2nd Semester" && g.academicYear === "2024-2025"
  )

  // Text search and semester chips filter independently but combine.
  const filteredGrades = useMemo(() => {
    const term = query.trim().toLowerCase()

    return grades
      .filter(
        (g) =>
          !term ||
          g.courseCode.toLowerCase().includes(term) ||
          g.courseName.toLowerCase().includes(term)
      )
      .filter((g) => semesterFilter === "all" || g.semester === semesterFilter)
  }, [query, semesterFilter])

  const filteredCurrentSemGrades = filteredGrades.filter(
    (g) => g.semester === "1st Semester" && g.academicYear === "2025-2026"
  )

  const cumulativeGPA = computeCumulativeGPA(grades).toFixed(2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <p className="text-gray-600">View your academic grades and performance</p>
      </div>

      {/* GPA Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {calculateGPA(currentSemGrades)}
            </div>
            <p className="text-xs text-muted-foreground">1st Sem 2025-2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previous GPA</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calculateGPA(previousSemGrades)}</div>
            <p className="text-xs text-muted-foreground">2nd Sem 2024-2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{cumulativeGPA}</div>
            <p className="text-xs text-muted-foreground">All semesters</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + semester chips */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search grades..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SEMESTER_FILTERS.map((semester) => {
              const isActive = semesterFilter === semester
              return (
                <button
                  key={semester}
                  type="button"
                  onClick={() => setSemesterFilter(semester)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {semester === "all" ? "All" : semester}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Grades</CardTitle>
          <CardDescription>Detailed breakdown of your grades by semester</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Semester</TabsTrigger>
              <TabsTrigger value="all">All Semesters</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Semester</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrentSemGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCurrentSemGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.courseCode}</TableCell>
                        <TableCell>{grade.courseName}</TableCell>
                        <TableCell>{grade.units}</TableCell>
                        <TableCell>
                          <Badge className={getGradeClass(grade.grade)}>{grade.grade}</Badge>
                        </TableCell>
                        <TableCell>{grade.semester}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Academic Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.courseCode}</TableCell>
                        <TableCell>{grade.courseName}</TableCell>
                        <TableCell>{grade.units}</TableCell>
                        <TableCell>
                          <Badge className={getGradeClass(grade.grade)}>{grade.grade}</Badge>
                        </TableCell>
                        <TableCell>{grade.semester}</TableCell>
                        <TableCell>{grade.academicYear}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
