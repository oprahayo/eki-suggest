import { Badge } from "@/components/ui/badge"

import type { AdminRoleId, ModerationFlag, SlaState } from "@/components/admin/admin-utils"
import { roleLabel } from "@/components/admin/admin-utils"

export function RoleBadge({ role }: { role: AdminRoleId }) {
  if (role === "super_admin") {
    return <Badge className="tone-brand-strong hover:brightness-[1.02]">{roleLabel(role)}</Badge>
  }

  if (role === "moderator") {
    return <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">{roleLabel(role)}</Badge>
  }

  if (role === "government_handler") {
    return <Badge className="tone-brand hover:bg-primary/10">{roleLabel(role)}</Badge>
  }

  return <Badge variant="secondary">{roleLabel(role)}</Badge>
}

export function ModerationFlagBadge({ flag }: { flag: ModerationFlag }) {
  if (flag === "none") {
    return <Badge variant="outline">No flag</Badge>
  }

  if (flag === "abusive") {
    return <Badge variant="destructive">Abusive</Badge>
  }

  if (flag === "sensitive") {
    return <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">Sensitive</Badge>
  }

  if (flag === "duplicate") {
    return <Badge className="tone-neutral hover:bg-[rgba(16,36,26,0.05)]">Duplicate</Badge>
  }

  return <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">Needs review</Badge>
}

export function SlaBadge({ state }: { state: SlaState }) {
  if (state === "completed") {
    return <Badge className="tone-brand hover:bg-primary/10">Completed SLA</Badge>
  }

  if (state === "overdue") {
    return <Badge variant="destructive">Overdue</Badge>
  }

  if (state === "due-soon") {
    return <Badge className="tone-accent hover:bg-[rgba(217,173,69,0.18)]">Due soon</Badge>
  }

  return <Badge className="tone-brand hover:bg-primary/10">On track</Badge>
}
