import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/StatCard"
import {
  currentStudent,
  grades,
  currentStanding,
  schedule,
  tuitionFees,
  computeCumulativeGPA,
} from "@/lib/mockData"
import { BookOpen, Calendar, DollarSign, Award, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const recentGrades = grades.slice(0, 3)
  const pendingFees = tuitionFees.filter(f => f.status === "pending")
  const totalPaid = tuitionFees
    .filter(f => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0)
  const totalPending = tuitionFees
    .filter(f => f.status === "pending")
    .reduce((sum, f) => sum + f.amount, 0)

  // Single source of truth — the same helper every other page uses.
  const cumulativeGPA = computeCumulativeGPA(grades)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentStudent.name.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          {currentStudent.program} • {currentStudent.yearLevel}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current GPA"
          value={cumulativeGPA.toFixed(2)}
          subtitle={currentStanding.academicYear}
          icon={TrendingUp}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Total Units"
          value={currentStanding.totalUnits}
          subtitle={currentStanding.semester}
          icon={BookOpen}
          valueClassName="text-blue-600"
        />
        <StatCard
          title="Classes Today"
          value={schedule.length}
          subtitle="This week"
          icon={Calendar}
          valueClassName="text-purple-600"
        />
        <StatCard
          title="Pending Fees"
          value={`₱${totalPending.toLocaleString()}`}
          subtitle={`${pendingFees.length} pending`}
          icon={DollarSign}
          valueClassName="text-orange-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>Your latest grade submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{grade.courseName}</p>
                    <p className="text-sm text-gray-500">{grade.courseCode}</p>
                  </div>
                  <Badge
                    className={
                      grade.grade.startsWith("A")
                        ? "bg-green-100 text-green-800 text-sm"
                        : grade.grade.startsWith("B")
                        ? "bg-blue-100 text-blue-800 text-sm"
                        : "bg-red-100 text-red-800 text-sm"
                    }
                  >
                    {grade.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tuition Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tuition Summary
            </CardTitle>
            <CardDescription>Current semester fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                <div>
                  <p className="font-medium text-green-900">Paid</p>
                  <p className="text-sm text-green-700">
                    {tuitionFees.filter(f => f.status === "paid").length} transactions
                  </p>
                </div>
                <p className="text-lg font-bold text-green-700">
                  ₱{totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50">
                <div>
                  <p className="font-medium text-orange-900">Pending</p>
                  <p className="text-sm text-orange-700">{pendingFees.length} pending</p>
                </div>
                <p className="text-lg font-bold text-orange-700">
                  ₱{totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Class Schedule
            </CardTitle>
            <CardDescription>Your classes for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900">{item.courseName}</p>
                  <p className="text-sm text-gray-500">
                    {item.time} • {item.room}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Academic Standing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Academic Standing
            </CardTitle>
            <CardDescription>Current academic status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Status</span>
                <Badge variant="success" className="capitalize">
                  {currentStanding.academicStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">GPA</span>
                <span className="font-medium">{cumulativeGPA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Earned Credits</span>
                <span className="font-medium">
                  {currentStanding.earnedCredits}/{currentStanding.totalCredits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Units</span>
                <span className="font-medium">{currentStanding.totalUnits}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
