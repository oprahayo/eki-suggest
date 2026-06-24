"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, LogIn } from "lucide-react"

import type { AdminRoleId, AdminSession } from "@/components/admin/admin-utils"
import { adminRoles, createDisplayName } from "@/components/admin/admin-utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { offices } from "@/lib/routing"
import { cn } from "@/lib/utils"

interface AdminLoginScreenProps {
  onLogin: (session: AdminSession) => void
}

export function AdminLoginScreen({ onLogin }: AdminLoginScreenProps) {
  const [role, setRole] = useState<AdminRoleId>("moderator")
  const [email, setEmail] = useState("moderator@ekisignal.demo")
  const [password, setPassword] = useState("ekisignal-demo")
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "")

  const canSubmit = Boolean(email.trim() && password.trim() && (role !== "government_handler" || officeId))
  const selectedRole = useMemo(
    () => adminRoles.find((entry) => entry.id === role) ?? adminRoles[1],
    [role]
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,173,69,0.12),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(15,92,67,0.1),transparent_28%),linear-gradient(180deg,#f7f8f2,#eef4ef)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full border-white/72 bg-white/82"
            )}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to map
          </Link>
          <div className="rounded-full bg-primary/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary">
            EkiSignal Internal
          </div>
        </div>

        <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-[0_30px_90px_-54px_rgba(8,28,20,0.34)] sm:px-6">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
              Admin sign in
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Open dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use your approved role and sign in details.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole((value as AdminRoleId) ?? "moderator")}>
                <SelectTrigger id="admin-role" className="w-full">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {adminRoles.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-sm leading-6 text-muted-foreground">{selectedRole.helper}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="name@ekisignal.demo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter password"
              />
            </div>

            {role === "government_handler" ? (
              <div className="space-y-2">
                <Label htmlFor="admin-office">Assigned office</Label>
                <Select value={officeId} onValueChange={(value) => setOfficeId(value ?? "")}>
                  <SelectTrigger id="admin-office" className="w-full">
                    <SelectValue placeholder="Choose office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {offices.map((office) => (
                        <SelectItem key={office.id} value={office.id}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              onLogin({
                email,
                role,
                name: createDisplayName(email),
                officeId: role === "government_handler" ? officeId : undefined,
              })
            }
            disabled={!canSubmit}
            className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full rounded-[1.25rem]")}
          >
            <LogIn data-icon="inline-start" />
            Enter dashboard
          </button>
        </section>
      </div>
    </div>
  )
}
