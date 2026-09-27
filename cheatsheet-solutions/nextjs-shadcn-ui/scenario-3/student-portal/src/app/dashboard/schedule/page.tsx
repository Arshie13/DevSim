import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/StatCard"
import { schedule } from "@/lib/mockData"
import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react"

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
        <p className="text-gray-600">View your weekly class schedule</p>
      </div>

      {/* Schedule Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Subjects"
          value={schedule.length}
          subtitle="This semester"
          icon={BookOpen}
          valueClassName="text-blue-600"
        />
        <StatCard
          title="Total Hours"
          value={12}
          subtitle="Per week"
          icon={Clock}
          valueClassName="text-purple-600"
        />
        <StatCard
          title="Days per Week"
          value={4}
          subtitle="Monday - Thursday"
          icon={Calendar}
          valueClassName="text-green-600"
        />
      </div>

      {/* Schedule Cards */}
      <div className="grid gap-4">
        {schedule.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.courseName}</CardTitle>
                  <CardDescription className="text-base font-medium text-blue-600">
                    {item.courseCode}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {item.day.split(",").length > 1 ? "MWF" : "TR"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.room}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.professor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Your schedule at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Monday */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-center mb-3 pb-2 border-b">Monday</h3>
              <div className="space-y-3">
                <div className="p-2 bg-blue-50 rounded text-sm">
                  <p className="font-medium">CS 301</p>
                  <p className="text-gray-500">9:00 AM - 10:30 AM</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-sm">
                  <p className="font-medium">CS 303</p>
                  <p className="text-gray-500">2:00 PM - 3:30 PM</p>
                </div>
              </div>
            </div>

            {/* Tuesday */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-center mb-3 pb-2 border-b">Tuesday</h3>
              <div className="space-y-3">
                <div className="p-2 bg-orange-50 rounded text-sm">
                  <p className="font-medium">MATH 301</p>
                  <p className="text-gray-500">10:00 AM - 11:30 AM</p>
                </div>
                <div className="p-2 bg-green-50 rounded text-sm">
                  <p className="font-medium">CS 302</p>
                  <p className="text-gray-500">1:00 PM - 2:30 PM</p>
                </div>
              </div>
            </div>

            {/* Wednesday */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-center mb-3 pb-2 border-b">Wednesday</h3>
              <div className="space-y-3">
                <div className="p-2 bg-blue-50 rounded text-sm">
                  <p className="font-medium">CS 301</p>
                  <p className="text-gray-500">9:00 AM - 10:30 AM</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-sm">
                  <p className="font-medium">CS 303</p>
                  <p className="text-gray-500">2:00 PM - 3:30 PM</p>
                </div>
              </div>
            </div>

            {/* Thursday */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-center mb-3 pb-2 border-b">Thursday</h3>
              <div className="space-y-3">
                <div className="p-2 bg-orange-50 rounded text-sm">
                  <p className="font-medium">MATH 301</p>
                  <p className="text-gray-500">10:00 AM - 11:30 AM</p>
                </div>
                <div className="p-2 bg-green-50 rounded text-sm">
                  <p className="font-medium">CS 302</p>
                  <p className="text-gray-500">1:00 PM - 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
