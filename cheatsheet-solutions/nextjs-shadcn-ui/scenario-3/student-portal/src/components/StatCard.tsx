import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: React.ReactNode
  subtitle?: string
  icon?: LucideIcon
  /** Optional Tailwind classes applied to the value, e.g. `text-green-600`. */
  valueClassName?: string
}

/**
 * The single stat-card used across the dashboard, fees, schedule and standing
 * pages, replacing four copies of the same Card markup.
 */
export function StatCard({ title, value, subtitle, icon: Icon, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName ?? ""}`}>{value}</div>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardContent>
    </Card>
  )
}

export default StatCard
