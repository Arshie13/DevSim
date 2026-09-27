# Riverside University — Student Portal

A student portal for Riverside University, built with Next.js (App Router),
shadcn/ui and Tailwind CSS. Students view their grades, class schedule,
tuition fees and academic standing, and can keep personal study notes.

## Features

- **Dashboard** — GPA, units, classes and pending fees at a glance
- **Grades** — per-semester and cumulative GPA, with live search and semester
  filter chips
- **Class schedule** — weekly timetable with room and professor details
- **Tuition fees** — payment tallies and human-readable due dates
  ("Due in 5 days" / "Overdue by 2 days")
- **Academic standing** — degree progress and GPA status
- **Study notes** — per-course notes persisted in the browser
- **Accessible grade badges** — each grade tier maps to a high-contrast palette

## Tech Stack

- Next.js 16 (App Router)
- shadcn/ui + Tailwind CSS
- TypeScript
- Vitest + React Testing Library

## Demo Credentials

| Field | Value |
| --- | --- |
| Student ID | `12-346-78` |
| Password | `sample` |

The student ID must match the format `XX-XXX-XX`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000 and log in with the demo credentials.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Student login |
| `/dashboard` | Academic overview |
| `/dashboard/grades` | Grades and GPA breakdown |
| `/dashboard/schedule` | Weekly class schedule |
| `/dashboard/fees` | Tuition fees and due dates |
| `/dashboard/standing` | Academic standing and degree progress |
| `/dashboard/notes` | Personal study notes |

## Project Structure

- `src/app` — routes, including the `/dashboard` layout with the sidebar
- `src/components` — `StatCard` and the shadcn/ui primitives
- `src/lib` — `mockData` (`computeCumulativeGPA`) and `dateUtils`
- `src/hooks` — `useLocalStorage`, shared by the sidebar, notes and login form

## Testing

```bash
pnpm test              # every task
pnpm test:task:l2:t1   # a single task
```
