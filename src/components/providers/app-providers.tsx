"use client"

import { AuthProvider } from "@/components/providers/auth-provider"
import { PwaProvider } from "@/components/providers/pwa-provider"
import {
  ReportCenterProvider,
} from "@/components/providers/report-center-provider"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PwaProvider>
      <AuthProvider>
        <ReportCenterProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ReportCenterProvider>
      </AuthProvider>
    </PwaProvider>
  )
}
