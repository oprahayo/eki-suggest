import { CitizenLayout } from "@/components/citizen/citizen-layout"

export default function CitizenGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CitizenLayout>{children}</CitizenLayout>
}
