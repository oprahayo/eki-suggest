import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminChartDatum {
  label: string
  value: number
  helper?: string
}

interface AdminChartCardProps {
  title: string
  description: string
  data: AdminChartDatum[]
  valueSuffix?: string
}

export function AdminChartCard({
  title,
  description,
  data,
  valueSuffix = "",
}: AdminChartCardProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <Card className="rounded-[1.75rem] border-white/60 bg-white/84 shadow-[0_24px_70px_-48px_rgba(9,31,22,0.2)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length > 0 ? (
          data.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                  {item.helper ? (
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {item.value}
                  {valueSuffix}
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-foreground/[0.06] shadow-[inset_0_1px_2px_rgba(8,28,20,0.08)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(17,93,69,0.96),rgba(220,180,63,0.92))] shadow-[0_10px_22px_-16px_rgba(17,93,69,0.72)]"
                  style={{ width: `${Math.max(12, (item.value / maxValue) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.4rem] bg-foreground/[0.04] px-4 py-4 text-sm leading-6 text-muted-foreground">
            No data available for this slice yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
