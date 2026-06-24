"use client"

import { startTransition } from "react"
import { Filter, Search, X } from "lucide-react"

import type { AdminFilterState } from "@/components/admin/admin-utils"
import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface AdminFilterBarProps {
  filters: AdminFilterState
  options: {
    lgas: string[]
    wards: string[]
    offices: { id: string; name: string }[]
  }
  resultCount: number
  onChange: <K extends keyof AdminFilterState>(key: K, value: AdminFilterState[K]) => void
  onReset: () => void
  officeLocked?: boolean
}

export function AdminFilterBar({
  filters,
  options,
  resultCount,
  onChange,
  onReset,
  officeLocked = false,
}: AdminFilterBarProps) {
  const officeOptions = officeLocked
    ? options.offices
        .filter((item) => item.id === filters.office)
        .map((item) => ({ label: item.name, value: item.id }))
    : [
        { label: "All offices", value: "all" },
        ...options.offices.map((item) => ({ label: item.name, value: item.id })),
      ]

  return (
    <section className="surface-panel rounded-[1.7rem] p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
            Queue filters
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search by ticket number, phone, issue title, description, or note keyword.
          </p>
        </div>
        <div className="section-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-primary">
          <Filter className="size-3.5" />
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <InputGroup className="bg-white/84">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={filters.search}
            onChange={(event) =>
              startTransition(() => {
                onChange("search", event.target.value)
              })
            }
            placeholder="Search ticket, phone, title, category, note, or keyword"
          />
        </InputGroup>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Status"
            value={filters.status}
            placeholder="All statuses"
            options={[
              { label: "All statuses", value: "all" },
              { label: "Received", value: "Received" },
              { label: "Under Review", value: "Under Review" },
              { label: "Assigned", value: "Assigned" },
              { label: "In Progress", value: "In Progress" },
              { label: "Resolved", value: "Resolved" },
              { label: "Closed", value: "Closed" },
              { label: "Rejected", value: "Rejected" },
            ]}
            onValueChange={(value) => onChange("status", value)}
          />
          <FilterSelect
            label="Category"
            value={filters.category}
            placeholder="All categories"
            options={[
              { label: "All categories", value: "all" },
              { label: "Road", value: "Road" },
              { label: "Drainage", value: "Drainage" },
              { label: "Water", value: "Water" },
              { label: "Electricity", value: "Electricity" },
              { label: "Sanitation", value: "Sanitation" },
              { label: "Health", value: "Health" },
              { label: "Security", value: "Security" },
              { label: "Education", value: "Education" },
              { label: "Environment", value: "Environment" },
              { label: "Public Facility", value: "Public Facility" },
              { label: "Corruption / Service Delay", value: "Corruption / Service Delay" },
              { label: "Other", value: "Other" },
            ]}
            onValueChange={(value) => onChange("category", value)}
          />
          <FilterSelect
            label="LGA"
            value={filters.lga}
            placeholder="All LGAs"
            options={[{ label: "All LGAs", value: "all" }, ...options.lgas.map((item) => ({ label: item, value: item }))]}
            onValueChange={(value) => onChange("lga", value)}
          />
          <FilterSelect
            label="Ward"
            value={filters.ward}
            placeholder="All wards"
            options={[{ label: "All wards", value: "all" }, ...options.wards.map((item) => ({ label: item, value: item }))]}
            onValueChange={(value) => onChange("ward", value)}
          />
          <FilterSelect
            label="Office"
            value={filters.office}
            placeholder="All offices"
            options={officeOptions}
            onValueChange={(value) => onChange("office", value)}
            disabled={officeLocked}
          />
          <FilterSelect
            label="Severity"
            value={filters.severity}
            placeholder="All severity"
            options={[
              { label: "All severity", value: "all" },
              { label: "Routine", value: "routine" },
              { label: "Urgent", value: "urgent" },
              { label: "Critical", value: "critical" },
            ]}
            onValueChange={(value) => onChange("severity", value)}
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              From date
            </p>
            <InputGroup>
              <InputGroupInput
                type="date"
                value={filters.fromDate}
                onChange={(event) => onChange("fromDate", event.target.value)}
              />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              To date
            </p>
            <InputGroup>
              <InputGroupInput
                type="date"
                value={filters.toDate}
                onChange={(event) => onChange("toDate", event.target.value)}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t soft-divider pt-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Narrow the working set by ownership, area, severity, and time window.
        </p>
        <button
          type="button"
          onClick={onReset}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
        >
          <X data-icon="inline-start" />
          Clear filters
        </button>
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onValueChange,
  disabled = false,
}: {
  label: string
  value: string
  placeholder: string
  options: { label: string; value: string }[]
  onValueChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue ?? "")} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((item) => (
              <SelectItem key={`${label}-${item.value}`} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
