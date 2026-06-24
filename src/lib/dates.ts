const lagosFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export function formatLagosTimestamp(value: string) {
  const parts = lagosFormatter.formatToParts(new Date(value))
  const day = parts.find((part) => part.type === "day")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const hour = parts.find((part) => part.type === "hour")?.value ?? ""
  const minute = parts.find((part) => part.type === "minute")?.value ?? ""

  return `${day} ${month}, ${hour}:${minute}`
}
