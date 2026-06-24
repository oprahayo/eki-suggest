"use client"

import { motion } from "framer-motion"

import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface WizardStepItem {
  id: string
  label: string
  shortLabel: string
}

interface WizardStepperProps {
  steps: WizardStepItem[]
  currentStep: number
  onSelectStep?: (index: number) => void
}

export function WizardStepper({
  steps,
  currentStep,
  onSelectStep,
}: WizardStepperProps) {
  const progressValue = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className="glass-panel rounded-[1.95rem] px-4 py-4 shadow-[0_28px_72px_-44px_rgba(8,28,20,0.34)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
            Filing wizard
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            Step {currentStep + 1} of {steps.length}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Designed to keep a citizen filing within two minutes.
          </p>
        </div>
        <div className="rounded-full bg-primary/8 px-3 py-1.5 text-[0.72rem] font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          Autosaving
        </div>
      </div>

      <div className="mt-4">
        <Progress value={progressValue}>
          <ProgressLabel>Completion progress</ProgressLabel>
          <ProgressValue>
            {(formattedValue) => formattedValue ?? `${progressValue}%`}
          </ProgressValue>
        </Progress>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep?.(index)}
              disabled={!onSelectStep}
              className={cn(
                "interactive-press relative flex min-w-fit items-center gap-3 rounded-[1.45rem] border px-3.5 py-2.5 text-left",
                isActive
                  ? "border-primary/18 bg-primary/10 text-primary"
                  : isCompleted
                    ? "tone-brand"
                    : "border-white/60 bg-white/74 text-muted-foreground"
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="wizard-active-step"
                  className="absolute inset-0 rounded-[1.45rem] bg-primary/8"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/[0.06] text-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="relative z-10">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-70">
                  {step.shortLabel}
                </span>
                <span className="block text-sm font-semibold">{step.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
