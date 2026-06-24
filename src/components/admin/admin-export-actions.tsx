import { Download, FileSpreadsheet } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminExportActionsProps {
  count: number
  disabled?: boolean
  onExportCsv: () => void
  onExportExcelReady: () => void
}

export function AdminExportActions({
  count,
  disabled = false,
  onExportCsv,
  onExportExcelReady,
}: AdminExportActionsProps) {
  return (
    <Card className="rounded-[1.7rem] border-white/60 bg-white/84 shadow-[0_24px_70px_-48px_rgba(9,31,22,0.28)]">
      <CardHeader>
        <CardTitle>Exports</CardTitle>
        <CardDescription>
          Download the current filtered working set in compact CSV or spreadsheet-ready format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.4rem] bg-primary/[0.05] px-4 py-4">
          <p className="text-sm font-semibold text-foreground">{count} rows ready</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Exports reflect the exact filters applied to the table and queue view.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={disabled}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "justify-start rounded-[1.2rem]")}
          >
            <Download data-icon="inline-start" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onExportExcelReady}
            disabled={disabled}
            className={cn(buttonVariants({ size: "lg" }), "justify-start rounded-[1.2rem]")}
          >
            <FileSpreadsheet data-icon="inline-start" />
            Excel-ready export
          </button>
        </div>

        {disabled ? (
          <p className="text-xs leading-5 text-muted-foreground">
            This role can review the dashboard, but export actions are reserved for higher-permission roles.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
