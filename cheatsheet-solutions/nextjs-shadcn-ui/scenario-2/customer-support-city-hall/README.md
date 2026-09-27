# City Hall Support — Citizen & Agent Portal

A customer support portal for a fictional City Hall, built with Next.js (App
Router), shadcn/ui and Tailwind CSS.

## Features

- **Citizen chat** — an AI assistant answers questions about city services,
  permits, taxes, utilities, trash collection, parking and opening hours
- **Agent hand-off** — citizens submit a request and see their queue position
- **Complaint history** — every submitted request is listed at `/support/history`
- **Agent dashboard** — conversation list with status badges, unread counts and
  a first-response view
- **Shared chat bubble** — one `MessageBubble` component aligns messages
  relative to whoever is viewing them
- **Reload-safe state** — conversations, agent status and chat history persist
  through a reusable `useLocalStorage` hook

## Tech Stack

- Next.js 16 (App Router)
- shadcn/ui + Tailwind CSS
- TypeScript
- Vitest + React Testing Library

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Portal landing page |
| `/support` | Citizen chat with the AI assistant |
| `/support/history` | Complaint history |
| `/agent` | Agent dashboard and conversation list |
| `/agent/login` | Agent sign-in |

## Demo Credentials

Agent dashboard: **admin** / **admin123**

## Getting Started

```bash
pnpm install
pnpm dev
```

## Project Structure

- `src/app` — routes (`/support`, `/support/history`, `/agent`, `/agent/login`)
- `src/components` — `MessageBubble` and the shadcn/ui primitives
- `src/hooks` — `useLocalStorage`
- `src/lib` — `dateUtils` (`formatRelativeTime`, `isStale`, `formatTimestamp`)

## Testing

```bash
pnpm test              # every task
pnpm test:task:l2:t1   # a single task
```
