"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { formatTimestamp } from "@/lib/dateUtils"
import { History } from "lucide-react"

interface Complaint {
  id: string
  fullName: string
  address: string
  city: string
  zipCode: string
  complaint: string
  submittedAt: string
}

/**
 * Every complaint the citizen has submitted through the support form.
 * Stored client-side under the `customerComplaints` key.
 */
export default function ComplaintHistoryPage() {
  const [complaints] = useLocalStorage<Complaint[]>("customerComplaints", [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaint History</h1>
          <p className="text-muted-foreground">Requests you have submitted to City Hall</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Requests</CardTitle>
          <CardDescription>{complaints.length} on record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Submitted
                  </th>
                  <th scope="col" className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th scope="col" className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    City
                  </th>
                  <th scope="col" className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    ZIP
                  </th>
                  <th scope="col" className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Complaint
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No complaints submitted yet
                    </td>
                  </tr>
                ) : (
                  complaints.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="p-2 align-middle">{formatTimestamp(entry.submittedAt)}</td>
                      <td className="p-2 align-middle font-medium">{entry.fullName}</td>
                      <td className="p-2 align-middle">{entry.city}</td>
                      <td className="p-2 align-middle">{entry.zipCode}</td>
                      <td className="p-2 align-middle">{entry.complaint}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
