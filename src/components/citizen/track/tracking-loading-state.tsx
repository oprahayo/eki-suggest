import { Skeleton } from "@/components/ui/skeleton"

export function TrackingLoadingState() {
  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-[2rem] p-5 shadow-float sm:p-6">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-4 h-10 w-3/4 rounded-2xl" />
        <Skeleton className="mt-4 h-4 w-full rounded-full" />
        <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-22 rounded-[1.4rem]" />
          <Skeleton className="h-22 rounded-[1.4rem]" />
          <Skeleton className="h-22 rounded-[1.4rem]" />
          <Skeleton className="h-22 rounded-[1.4rem]" />
        </div>
      </section>

      <section className="surface-panel rounded-[2rem] p-5 shadow-float sm:p-6">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="mt-4 h-4 w-4/5 rounded-full" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="mt-1 size-8 rounded-full" />
              <Skeleton className="h-24 flex-1 rounded-[1.4rem]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
