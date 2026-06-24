import { Skeleton } from "@/components/ui/skeleton"

export default function CitizenLoading() {
  return (
    <div className="px-4 pt-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <Skeleton className="h-20 rounded-[2rem]" />
        <Skeleton className="h-[28rem] rounded-[2rem]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-[2rem]" />
          <Skeleton className="h-52 rounded-[2rem]" />
        </div>
      </div>
    </div>
  )
}
