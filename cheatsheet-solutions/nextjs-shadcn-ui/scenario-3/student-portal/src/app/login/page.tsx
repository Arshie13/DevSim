"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

const STUDENT_ID_PATTERN = /^\d{2}-\d{3}-\d{2}$/
const MIN_PASSWORD_LENGTH = 6

const DEMO_STUDENT_ID = "12-346-78"
const DEMO_PASSWORD = "sample"

export default function LoginPage() {
  const router = useRouter()
  const [lastStudentId, setLastStudentId] = useLocalStorage("lastStudentId", "")
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [serverError, setServerError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Pre-fill the ID the student last logged in with.
  useEffect(() => {
    if (lastStudentId) {
      setStudentId((current) => current || lastStudentId)
    }
  }, [lastStudentId])

  const isStudentIdValid = STUDENT_ID_PATTERN.test(studentId)
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH
  const isFormValid = isStudentIdValid && isPasswordValid

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!isFormValid) return

    if (studentId !== DEMO_STUDENT_ID || password !== DEMO_PASSWORD) {
      setServerError("Invalid student ID or password")
      return
    }

    setLastStudentId(studentId)
    setIsLoading(true)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-3 bg-blue-600 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-gray-600">Log in to access your academic information</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} noValidate>
            <CardContent className="space-y-4">
              {serverError && (
                <p className="text-sm font-medium text-red-600 text-center">{serverError}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  aria-invalid={studentId.length > 0 && !isStudentIdValid}
                />
                {studentId.length > 0 && !isStudentIdValid && (
                  <p className="text-sm text-red-600">Student ID must be in format XX-XXX-XX</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={password.length > 0 && !isPasswordValid}
                />
                {password.length > 0 && !isPasswordValid && (
                  <p className="text-sm text-red-600">
                    Password must be at least {MIN_PASSWORD_LENGTH} characters
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={!isFormValid || isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
              <p className="text-xs text-gray-500">
                Demo credentials: {DEMO_STUDENT_ID} / {DEMO_PASSWORD}
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
