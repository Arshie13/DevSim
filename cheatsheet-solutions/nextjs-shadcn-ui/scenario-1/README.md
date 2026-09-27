# BookWise Library — Library Management System

A library management system for librarians, built with Next.js (App Router),
Shadcn UI and Tailwind CSS.

## Features

- **Book catalogue** — every book with title, author, ISBN and status
- **Status badges** — colour-coded per status (available, borrowed, overdue)
- **Search** — filter the catalogue by book title or author
- **Borrowing** — borrow an available book with a confirmation step
- **Returns desk** — process returns with a confirmation step
- **Overdue report** — overdue books with borrower contact details and days overdue
- **Librarian auth** — login and registration, persisted in localStorage

## Tech Stack

- Next.js 16 (App Router)
- Shadcn UI + Tailwind CSS
- TypeScript
- Vitest + React Testing Library

## Getting Started

```bash
pnpm install
pnpm dev
```

Demo credentials: `admin` / `admin123`

## Project Structure

- `src/app` — routes (dashboard, returns, overdue, login, signup)
- `src/components` — `BookRow` and the Shadcn UI primitives
- `src/hooks` — `useLocalStorage` persistence helper
- `src/lib` — mock data, date utilities and shared helpers
