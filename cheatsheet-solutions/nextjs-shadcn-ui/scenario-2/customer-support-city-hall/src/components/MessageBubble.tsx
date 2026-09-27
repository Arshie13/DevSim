import { formatTimestamp } from "@/lib/dateUtils"

export interface BubbleMessage {
  id?: string
  role: "customer" | "agent" | "system" | string
  content: string
  timestamp?: Date | string
}

interface MessageBubbleProps {
  message: BubbleMessage
  /** Who is looking at the chat — decides which side is "mine". */
  viewer: "customer" | "agent"
}

/**
 * One chat message, aligned relative to the viewer.
 *
 * A message reads as "mine" (right-aligned) when its role matches the viewer;
 * system notices are centred. Timestamps are rendered through
 * `formatTimestamp`, which copes with both Date objects and the ISO strings
 * that come back after localStorage hydration.
 */
export function MessageBubble({ message, viewer }: MessageBubbleProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg bg-muted px-3 py-1.5 text-center text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  const isOwn = message.role === viewer
  const timestamp = formatTimestamp(message.timestamp as Date | string)

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground"
            : message.role === "agent"
            ? "bg-green-100 text-green-900"
            : "bg-muted text-foreground"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        {timestamp ? (
          <p
            className={`mt-1 text-xs ${
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {timestamp}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default MessageBubble
