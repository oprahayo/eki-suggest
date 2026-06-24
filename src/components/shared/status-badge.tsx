import { Badge } from "@/components/ui/badge"
import type { ReportSeverity, ReportStatus } from "@/lib/types"

export function StatusBadge({ status }: { status: ReportStatus }) {
  if (status === "Rejected") {
    return <Badge variant="destructive">{status}</Badge>
  }

  if (status === "Assigned" || status === "In Progress" || status === "Resolved") {
    return (
      <Badge className="tone-brand hover:bg-primary/10">
        {status}
      </Badge>
    )
  }

  if (status === "Under Review") {
    return (
      <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">
        {status}
      </Badge>
    )
  }

  if (status === "Closed") {
    return <Badge className="tone-neutral hover:bg-[rgba(16,36,26,0.05)]">{status}</Badge>
  }

  return <Badge variant="secondary">{status}</Badge>
}

export function SeverityBadge({ severity }: { severity: ReportSeverity }) {
  if (severity === "critical") {
    return <Badge variant="destructive">Critical</Badge>
  }

  if (severity === "urgent") {
    return (
      <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">
        Urgent
      </Badge>
    )
  }

  return <Badge variant="outline">Routine</Badge>
}
