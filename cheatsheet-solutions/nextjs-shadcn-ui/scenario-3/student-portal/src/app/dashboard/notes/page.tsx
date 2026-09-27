"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StickyNote } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Note {
  id: string
  courseCode: string
  content: string
  createdAt: string
}

/**
 * Per-course study notes, persisted client-side under the `studentNotes` key.
 */
export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("studentNotes", [])
  const [courseCode, setCourseCode] = useState("")
  const [content, setContent] = useState("")

  const handleAddNote = () => {
    if (!content.trim()) return

    setNotes([
      ...notes,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        courseCode: courseCode.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      },
    ])

    setCourseCode("")
    setContent("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
        <p className="text-gray-600">Keep personal notes for each of your courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a Note</CardTitle>
          <CardDescription>Notes are stored in your browser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course</Label>
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS 301"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to remember?"
            />
          </div>
          <Button onClick={handleAddNote} disabled={!content.trim()}>
            Add Note
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Notes</CardTitle>
          <CardDescription>{notes.length} saved</CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{note.courseCode}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{note.content}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
