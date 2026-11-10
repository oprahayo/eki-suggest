"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import type { ComponentType } from "react"
import {
  startTransition,
  useEffect,
  useReducer,
  useState,
  useTransition,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowRight,
  BadgeAlert,
  Building2,
  CheckCheck,
  ChevronLeft,
  CircleAlert,
  Construction,
  Droplets,
  GraduationCap,
  HeartPulse,
  Leaf,
  LocateFixed,
  MapPin,
  MessageSquareWarning,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Waves,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import {
  MediaUploadField,
} from "@/components/citizen/report-flow/media-upload-field"
import {
  ReviewSectionCard,
} from "@/components/citizen/report-flow/review-section-card"
import {
  WizardStepper,
  type WizardStepItem,
} from "@/components/citizen/report-flow/wizard-stepper"
import { Alert } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { prepareMediaFiles } from "@/lib/media"
import { getEstimatedResponse, resolveRoutingDecision } from "@/lib/routing"
import { cn } from "@/lib/utils"
import {
  ekitiState,
  ekitiLgaNames,
  getCommunityOptions,
  getWardOptions,
} from "@/lib/ekiti"
import type { ReportMedia } from "@/lib/types"
import { reportCategories, reportKinds, reportSeverities } from "@/lib/types"
import { usePwa } from "@/hooks/use-pwa"
import { useReportCenter } from "@/hooks/use-report-center"

const DynamicEkitiMap = dynamic(
  () => import("@/components/maps/ekiti-map").then((module) => module.EkitiMap),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-[1.7rem] border border-white/60 bg-white/80 p-3">
        <Skeleton className="h-[22rem] w-full rounded-[1.25rem]" />
      </div>
    ),
  }
)

const reportSchema = z.object({
  kind: z.enum(reportKinds),
  category: z.enum(reportCategories),
  severity: z.enum(reportSeverities),
  isAnonymous: z.boolean(),
  title: z
    .string()
    .min(8, "Give the issue a clear title so handlers can recognize it quickly.")
    .max(90, "Keep the title under 90 characters."),
  description: z
    .string()
    .min(30, "Add more detail so the issue can be screened and routed properly.")
    .max(1200, "Keep the description within 1200 characters."),
  lga: z.string().min(1, "Select the local government area."),
  community: z.string(),
  ward: z.string().min(1, "Select the ward."),
  area: z.string().min(3, "Add the street, corridor, or landmark area."),
  landmark: z.string().max(140, "Keep the landmark note under 140 characters."),
  name: z.string().min(2, "Add a contact name."),
  phone: z.string().min(7, "Add a reachable phone number."),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  consent: z.boolean().refine((value) => value, {
    message: "Please confirm the privacy and moderation notice before submitting.",
  }),
})

type ReportFormValues = z.infer<typeof reportSchema>
type Coordinates = { lat: number; lng: number } | null
type LocationAssistMode = "gps" | "pin" | "manual"
type LocationAccessState = "idle" | "requesting" | "granted" | "denied"

type WizardStep = WizardStepItem & {
  description: string
  fields: readonly (keyof ReportFormValues)[]
}

const wizardSteps: WizardStep[] = [
  {
    id: "type",
    shortLabel: "Type",
    label: "Choose type",
    description: "Choose the type of private draft. Government delivery is not yet connected.",
    fields: ["kind"],
  },
  {
    id: "category",
    shortLabel: "Category",
    label: "Choose category",
    description: "This helps the routing rules send the issue to the right queue first.",
    fields: ["category"],
  },
  {
    id: "location",
    shortLabel: "Location",
    label: "Capture location",
    description: "Use GPS, place a pin, or type the location manually if permissions fail.",
    fields: ["lga", "ward", "area"],
  },
  {
    id: "details",
    shortLabel: "Details",
    label: "Issue details",
    description: "Add a clear title, full description, severity, and any privacy preference.",
    fields: ["title", "description", "severity"],
  },
  {
    id: "proof",
    shortLabel: "Proof",
    label: "Upload proof",
    description: "Attach photos or video if you have them. Text-only reports still work.",
    fields: [],
  },
  {
    id: "contact",
    shortLabel: "Contact",
    label: "Contact details",
    description: "Private contact details help the moderation team follow up if clarification is needed.",
    fields: ["name", "phone", "email"],
  },
  {
    id: "review",
    shortLabel: "Review",
    label: "Review and submit",
    description: "Check the summary, confirm the notice, and create the tracking ticket.",
    fields: ["consent"],
  },
] as const

const kindOptions = [
  {
    value: "report",
    label: "Report",
    helper: "Use this for incidents, faults, or visible service issues.",
    icon: MessageSquareWarning,
  },
  {
    value: "complaint",
    label: "Complaint",
    helper: "Use this when expected government service has failed or been ignored.",
    icon: CircleAlert,
  },
  {
    value: "suggestion",
    label: "Suggestion",
    helper: "Use this for constructive ideas and improvement requests.",
    icon: Sparkles,
  },
] as const

const categoryOptions = [
  {
    value: "Road",
    helper: "Damage, potholes, blockages",
    icon: Construction,
    className: "tone-brand-strong",
  },
  {
    value: "Drainage",
    helper: "Flooding and blocked drains",
    icon: Waves,
    className: "tone-brand",
  },
  {
    value: "Water",
    helper: "Leaks and supply failures",
    icon: Droplets,
    className: "tone-brand",
  },
  {
    value: "Electricity",
    helper: "Outages and transformer faults",
    icon: Zap,
    className: "tone-accent",
  },
  {
    value: "Sanitation",
    helper: "Waste, refuse, dirty corridors",
    icon: Trash2,
    className: "tone-accent",
  },
  {
    value: "Health",
    helper: "Clinics, response access, urgent care issues",
    icon: HeartPulse,
    className: "tone-accent",
  },
  {
    value: "Security",
    helper: "Threats, risk alerts, unsafe situations",
    icon: ShieldAlert,
    className: "tone-danger",
  },
  {
    value: "Education",
    helper: "Schools, classrooms, teaching conditions",
    icon: GraduationCap,
    className: "tone-neutral",
  },
  {
    value: "Environment",
    helper: "Pollution and environmental hazards",
    icon: Leaf,
    className: "tone-brand",
  },
  {
    value: "Public Facility",
    helper: "Markets, parks, public assets",
    icon: Building2,
    className: "tone-neutral",
  },
  {
    value: "Corruption / Service Delay",
    helper: "Extortion, ignored service requests, delayed response",
    icon: BadgeAlert,
    className: "tone-accent",
  },
  {
    value: "Other",
    helper: "Anything that does not fit the main list",
    icon: MoreHorizontal,
    className: "tone-neutral",
  },
] as const

function StepChoiceCard({
  icon: Icon,
  title,
  helper,
  selected,
  onClick,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  helper: string
  selected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.987, y: 1 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "interactive-press relative flex w-full items-start gap-3 rounded-[1.65rem] border px-4 py-4 text-left shadow-[0_18px_42px_-30px_rgba(9,31,22,0.28)]",
        selected
          ? "border-primary/18 bg-primary/[0.08]"
          : "border-white/60 bg-white/80 hover:bg-white/94",
        className
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
          selected ? "bg-primary text-primary-foreground" : "bg-foreground/[0.05] text-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{helper}</span>
      </span>
      {selected ? (
        <span className="absolute top-4 right-4 rounded-full bg-primary/12 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
          Selected
        </span>
      ) : null}
    </motion.button>
  )
}

function toCommunityLabel(value: string) {
  return value || "Not added"
}

export function ReportComposer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isOnline } = usePwa()
  const {
    reports,
    saveDraft,
    savedDraft,
    clearDraft,
    submitReport,
    requestDeviceLocation,
    selectedCoordinates: savedCenterCoordinates,
    locationPreference,
  } = useReportCenter()
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedCoordinates, setSelectedCoordinates] = useReducer(
    (_: Coordinates, next: Coordinates) => next,
    savedDraft?.location.coordinates ?? null
  )
  const [locationAssistMode, setLocationAssistMode] = useState<LocationAssistMode>(
    savedDraft?.location.coordinates
      ? "pin"
      : locationPreference.permission === "granted"
        ? "gps"
        : "manual"
  )
  const [locationAccessState, setLocationAccessState] = useState<LocationAccessState>(
    locationPreference.permission === "granted"
      ? "granted"
      : locationPreference.permission === "denied"
        ? "denied"
        : "idle"
  )
  const [mediaItems, setMediaItems] = useState<ReportMedia[]>([])
  const [isPreparingMedia, setIsPreparingMedia] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadCompletedCount, setUploadCompletedCount] = useState(0)
  const [uploadTotalCount, setUploadTotalCount] = useState(0)
  const [isPending, startPageTransition] = useTransition()

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      kind: "report",
      category: "Road",
      severity: "routine",
      isAnonymous: false,
      title: "",
      description: "",
      lga: "",
      community: "",
      ward: "",
      area: "",
      landmark: "",
      name: "",
      phone: "",
      email: "",
      consent: false,
    },
  })

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    control,
  } = form

  useEffect(() => {
    const category = searchParams.get("category")
    const severity = searchParams.get("severity")

    if (category && reportCategories.includes(category as (typeof reportCategories)[number])) {
      setValue("category", category as (typeof reportCategories)[number], {
        shouldValidate: true,
      })
    }

    if (severity && reportSeverities.includes(severity as (typeof reportSeverities)[number])) {
      setValue("severity", severity as (typeof reportSeverities)[number], {
        shouldValidate: true,
      })
    }
  }, [searchParams, setValue])

  useEffect(() => {
    if (!savedDraft) {
      return
    }

    reset({
      kind: savedDraft.kind,
      category: savedDraft.category,
      severity: savedDraft.severity,
      isAnonymous: savedDraft.isAnonymous ?? false,
      title: savedDraft.title,
      description: savedDraft.description,
      lga: savedDraft.location.lga,
      community: savedDraft.location.community,
      ward: savedDraft.location.ward,
      area: savedDraft.location.area,
      landmark: savedDraft.location.landmark,
      name: savedDraft.contact.name,
      phone: savedDraft.contact.phone,
      email: savedDraft.contact.email ?? "",
      consent: false,
    })
    setSelectedCoordinates(savedDraft.location.coordinates ?? null)
    setLocationAssistMode(savedDraft.location.coordinates ? "pin" : "manual")
  }, [reset, savedDraft])

  useEffect(() => {
    if (savedDraft) {
      return
    }

    setLocationAccessState(
      locationPreference.permission === "granted"
        ? "granted"
        : locationPreference.permission === "denied"
          ? "denied"
          : "idle"
    )
  }, [locationPreference.permission, savedDraft])

  const values = useWatch({ control }) as ReportFormValues
  const currentStep = wizardSteps[stepIndex]
  const communityOptions = getCommunityOptions(values.lga)
  const wardOptions = getWardOptions(values.lga, values.community)
  const routingPreview =
    values.category && values.lga
      ? resolveRoutingDecision({
          category: values.category,
          location: {
            lga: values.lga,
            ward: values.ward,
          },
        }).office.name
      : "Citizen Relations Default Queue"
  const estimatedResponse = getEstimatedResponse(values.severity)
  const submitButtonLabel = !isOnline
    ? mediaItems.length > 0
      ? "Save draft for later"
      : "Save and queue report"
    : isPending
      ? "Submitting..."
      : "Submit and create ticket"

  useEffect(() => {
    const hasContent =
      selectedCoordinates !== null ||
      Object.values(values).some((value) => {
        if (typeof value === "boolean") {
          return value
        }

        return Boolean(value)
      })

    if (!hasContent) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      saveDraft({
        kind: values.kind,
        category: values.category,
        severity: values.severity,
        isAnonymous: values.isAnonymous,
        title: values.title,
        description: values.description,
        location: {
          state: ekitiState,
          lga: values.lga,
          community: values.community,
          ward: values.ward,
          area: values.area,
          landmark: values.landmark,
          coordinates: selectedCoordinates ?? undefined,
        },
        contact: {
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
        },
      })
    }, 320)

    return () => window.clearTimeout(timeoutId)
  }, [saveDraft, selectedCoordinates, values])

  useEffect(() => {
    if (values.community && !communityOptions.includes(values.community)) {
      setValue("community", "", { shouldValidate: true })
    }
  }, [communityOptions, setValue, values.community])

  useEffect(() => {
    if (values.ward && !wardOptions.includes(values.ward)) {
      setValue("ward", "", { shouldValidate: true })
    }
  }, [setValue, values.ward, wardOptions])

  async function goToNextStep() {
    if (currentStep.fields.length === 0) {
      setStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1))
      return
    }

    const valid = await trigger(currentStep.fields)

    if (!valid) {
      toast.error("Please fix the required fields before moving on.")
      return
    }

    setStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1))
  }

  function goToPreviousStep() {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  async function requestLiveLocation() {
    setLocationAccessState("requesting")
    const result = await requestDeviceLocation({
      fallbackLabel:
        values.area ||
        values.community ||
        values.lga ||
        locationPreference.label ||
        "Current location, Ekiti State",
    })

    if (result.status === "granted" && result.preference.coordinates) {
      setSelectedCoordinates(result.preference.coordinates)
      setLocationAssistMode("gps")
      setLocationAccessState("granted")
      toast.success("Saved device location attached to this report.")
      return
    }

    setLocationAccessState("denied")
    setLocationAssistMode("manual")
    toast.message(
      "Device location is unavailable, so EkiSignal will keep using your saved manual area until you change it."
    )
  }

  async function handleMediaSelection(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    try {
      setIsPreparingMedia(true)
      setUploadProgress(0)
      setUploadCompletedCount(0)
      setUploadTotalCount(files.length)

      const prepared = await prepareMediaFiles(files, ({ completed, progress, total }) => {
        setUploadCompletedCount(completed)
        setUploadProgress(progress)
        setUploadTotalCount(total)
      })

      setMediaItems((current) => [...current, ...prepared])
      toast.success("Evidence added and previewed.")
    } catch {
      toast.error("Something went wrong while preparing the media files.")
    } finally {
      setIsPreparingMedia(false)
    }
  }

  function clearDraftState() {
    clearDraft()
    reset({
      kind: "report",
      category: "Road",
      severity: "routine",
      isAnonymous: false,
      title: "",
      description: "",
      lga: "",
      community: "",
      ward: "",
      area: "",
      landmark: "",
      name: "",
      phone: "",
      email: "",
      consent: false,
    })
    setSelectedCoordinates(null)
    setLocationAssistMode("manual")
    setLocationAccessState(
      locationPreference.permission === "granted"
        ? "granted"
        : locationPreference.permission === "denied"
          ? "denied"
          : "idle"
    )
    setMediaItems([])
    setUploadProgress(0)
    setUploadCompletedCount(0)
    setUploadTotalCount(0)
  }

  async function onSubmit(currentValues: ReportFormValues) {
    const result = await submitReport({
      kind: currentValues.kind,
      category: currentValues.category,
      severity: currentValues.severity,
      isAnonymous: currentValues.isAnonymous,
      title: currentValues.title,
      description: currentValues.description,
      location: {
        state: ekitiState,
        lga: currentValues.lga,
        community: currentValues.community,
        ward: currentValues.ward,
        area: currentValues.area,
        landmark: currentValues.landmark,
        coordinates: selectedCoordinates ?? undefined,
      },
      contact: {
        name: currentValues.name,
        phone: currentValues.phone,
        email: currentValues.email || undefined,
      },
      media: mediaItems,
    })

    if (result.outcome === "saved_draft") {
      toast.message(
        "You are offline, so the report draft was saved locally. Reconnect and re-add media before submitting."
      )
      startPageTransition(() => {
        startTransition(() => {
          router.push("/report/success?draft=1")
        })
      })
      return
    }

    if (result.outcome === "queued" && result.pendingSubmission) {
      const pendingSubmission = result.pendingSubmission
      toast.message("Text saved in this device's outbox. It will not be sent to a government office automatically.")
      startPageTransition(() => {
        startTransition(() => {
          router.push(`/report/success?queued=${encodeURIComponent(pendingSubmission.id)}`)
        })
      })
      return
    }

    if (!result.report) {
      toast.error("We could not prepare the submission. Please try again.")
      return
    }

    const submittedReport = result.report

    clearDraft()
    toast.message(`Local reference ${submittedReport.trackingNumber} created on this device. Not submitted to government.`)
    startPageTransition(() => {
      startTransition(() => {
        router.push(
          `/report/success?tracking=${encodeURIComponent(submittedReport.trackingNumber)}`
        )
      })
    })
  }

  const summaryLocation = [
    values.area,
    toCommunityLabel(values.community),
    values.ward,
    values.lga,
  ]
    .filter((value) => value && value !== "Not added")
    .join(" • ")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pt-3 pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="surface-panel flex items-start justify-between gap-4 rounded-[2rem] px-5 py-5">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
            Citizen reporting flow
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            File a report in under two minutes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Pick the type, capture the Ekiti location, attach proof if available, and get a tracking number immediately.
          </p>
        </div>

        {savedDraft ? (
          <button
            type="button"
            onClick={() => {
              clearDraftState()
              toast.success("Saved draft cleared.")
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "hidden rounded-[1.2rem] sm:inline-flex"
            )}
          >
            Clear draft
          </button>
        ) : null}
      </div>

      {savedDraft ? (
        <Alert className="rounded-[1.65rem] border-primary/18 bg-primary/[0.06] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
          Your draft was restored locally. For privacy, attached media is not stored between sessions, so re-add photos or video if needed.
        </Alert>
      ) : null}

      {!isOnline ? (
      <Alert className="surface-accent rounded-[1.65rem] text-accent-foreground">
          {mediaItems.length > 0
            ? "You are offline. If you continue now, the draft will stay saved on this device and you will be prompted to re-add media after reconnecting."
            : "You are offline. If you continue now, EkiSignal will queue the report locally and create the tracking number once your connection returns."}
        </Alert>
      ) : null}

      <div className="sticky top-[calc(0.75rem+env(safe-area-inset-top))] z-20">
        <WizardStepper
          steps={wizardSteps}
          currentStep={stepIndex}
          onSelectStep={(index) => setStepIndex(index)}
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/90 shadow-[0_32px_90px_-52px_rgba(8,28,20,0.28)] backdrop-blur-xl">
          <CardHeader className="border-b border-white/55 bg-[linear-gradient(180deg,rgba(15,92,67,0.04),rgba(255,255,255,0))]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="font-heading text-[1.6rem] tracking-tight">
                  {currentStep.label}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
                  {currentStep.description}
                </CardDescription>
              </div>
              <div className="rounded-full bg-foreground/[0.04] px-3 py-1.5 text-[0.72rem] font-semibold text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                {stepIndex < wizardSteps.length - 1 ? "Draft saves automatically" : "Ready to create ticket"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {currentStep.id === "type" ? (
                  <div className="grid gap-3">
                    {kindOptions.map((option) => (
                      <StepChoiceCard
                        key={option.value}
                        icon={option.icon}
                        title={option.label}
                        helper={option.helper}
                        selected={values.kind === option.value}
                        onClick={() =>
                          setValue("kind", option.value, { shouldValidate: true })
                        }
                      />
                    ))}
                  </div>
                ) : null}

                {currentStep.id === "category" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {categoryOptions.map((option) => (
                      <StepChoiceCard
                        key={option.value}
                        icon={option.icon}
                        title={option.value}
                        helper={option.helper}
                        selected={values.category === option.value}
                        onClick={() =>
                          setValue("category", option.value, { shouldValidate: true })
                        }
                        className={option.className}
                      />
                    ))}
                    <Field data-invalid={Boolean(errors.category)} className="sr-only">
                      <FieldError>{errors.category?.message}</FieldError>
                    </Field>
                  </div>
                ) : null}

                {currentStep.id === "location" ? (
                  <FieldGroup>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StepChoiceCard
                        icon={LocateFixed}
                        title="Use current GPS"
                        helper={
                          locationAccessState === "granted"
                            ? "Live coordinates attached successfully."
                            : "Fastest option when location permissions are allowed."
                        }
                        selected={locationAssistMode === "gps"}
                        onClick={() => void requestLiveLocation()}
                      />
                      <StepChoiceCard
                        icon={MapPin}
                        title="Drop a pin"
                        helper="Tap anywhere on the map if GPS is weak or you want precision."
                        selected={locationAssistMode === "pin"}
                        onClick={() => setLocationAssistMode("pin")}
                      />
                      <StepChoiceCard
                        icon={ShieldCheck}
                        title="Manual entry"
                        helper="Fallback if permissions are denied or you prefer typing."
                        selected={locationAssistMode === "manual"}
                        onClick={() => setLocationAssistMode("manual")}
                      />
                    </div>

                    {locationAccessState === "denied" ? (
                      <Alert className="rounded-[1.5rem] border-red-200 bg-red-50 text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
                        Device location is currently turned off for EkiSignal, so the wizard will keep using manual location until you choose to try again.
                      </Alert>
                    ) : null}

                    {locationAccessState === "requesting" ? (
                      <Alert className="rounded-[1.5rem] border-primary/18 bg-primary/[0.06] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
                        Checking live GPS location. If it fails, you can still place a pin or type the location manually.
                      </Alert>
                    ) : null}

                    <div className="overflow-hidden rounded-[1.9rem] border border-white/60 bg-white/80 shadow-[0_18px_42px_-30px_rgba(9,31,22,0.18)]">
                      <DynamicEkitiMap
                        reports={reports.slice(0, 8)}
                        selectedCoordinates={selectedCoordinates ?? undefined}
                        centerCoordinates={selectedCoordinates ?? savedCenterCoordinates ?? undefined}
                        userCoordinates={
                          locationPreference.permission === "granted"
                            ? locationPreference.coordinates ??
                              locationPreference.lastKnownCoordinates ??
                              undefined
                            : undefined
                        }
                        onSelectCoordinates={(coordinates) => {
                          setSelectedCoordinates(coordinates)
                          setLocationAssistMode("pin")
                        }}
                        className="min-h-[22rem]"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>State</FieldLabel>
                        <InputGroup>
                          <InputGroupInput value={ekitiState} disabled />
                        </InputGroup>
                      </Field>

                      <Field data-invalid={Boolean(errors.lga)}>
                        <FieldLabel>Local government</FieldLabel>
                        <Select
                          value={values.lga}
                          onValueChange={(nextValue) =>
                            setValue("lga", nextValue ?? "", { shouldValidate: true })
                          }
                        >
                          <SelectTrigger className="w-full" aria-invalid={Boolean(errors.lga)}>
                            <SelectValue placeholder="Select an Ekiti LGA" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ekitiLgaNames.map((lga) => (
                                <SelectItem key={lga} value={lga}>
                                  {lga}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError>{errors.lga?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel>Town / community</FieldLabel>
                        <Select
                          value={values.community}
                          onValueChange={(nextValue) =>
                            setValue("community", nextValue ?? "", { shouldValidate: true })
                          }
                          disabled={!values.lga}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Optional but helpful" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {communityOptions.map((community) => (
                                <SelectItem key={community} value={community}>
                                  {community}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Optional. If skipped, ward options still load from the LGA.
                        </FieldDescription>
                      </Field>

                      <Field data-invalid={Boolean(errors.ward)}>
                        <FieldLabel>Ward</FieldLabel>
                        <Select
                          value={values.ward}
                          onValueChange={(nextValue) =>
                            setValue("ward", nextValue ?? "", { shouldValidate: true })
                          }
                          disabled={!values.lga}
                        >
                          <SelectTrigger className="w-full" aria-invalid={Boolean(errors.ward)}>
                            <SelectValue placeholder="Select a ward" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {wardOptions.map((ward) => (
                                <SelectItem key={ward} value={ward}>
                                  {ward}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError>{errors.ward?.message}</FieldError>
                      </Field>
                    </div>

                    <Field data-invalid={Boolean(errors.area)}>
                      <FieldLabel htmlFor="report-area">Street / corridor / landmark area</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="report-area"
                          placeholder="Street, junction, estate, corridor, or market axis"
                          aria-invalid={Boolean(errors.area)}
                          {...register("area")}
                        />
                      </InputGroup>
                      <FieldDescription>
                        This is the key manual fallback when GPS is unavailable.
                      </FieldDescription>
                      <FieldError>{errors.area?.message}</FieldError>
                    </Field>
                  </FieldGroup>
                ) : null}

                {currentStep.id === "details" ? (
                  <FieldGroup>
                    <Field data-invalid={Boolean(errors.title)}>
                      <FieldLabel htmlFor="report-title">Title</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="report-title"
                          placeholder="Give the issue a short, clear title"
                          aria-invalid={Boolean(errors.title)}
                          {...register("title")}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>{values.title.length}/90</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError>{errors.title?.message}</FieldError>
                    </Field>

                    <Field data-invalid={Boolean(errors.description)}>
                      <FieldLabel htmlFor="description">Detailed description</FieldLabel>
                      <InputGroup className="h-auto">
                        <InputGroupTextarea
                          id="description"
                          placeholder="Explain what happened, how long it has lasted, and what response should happen next."
                          className="min-h-[12rem]"
                          aria-invalid={Boolean(errors.description)}
                          {...register("description")}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText>
                            {values.description.length}/1200 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        Clear descriptions increase trust and improve routing quality.
                      </FieldDescription>
                      <FieldError>{errors.description?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Severity</FieldLabel>
                      <ToggleGroup
                        value={[values.severity]}
                        onValueChange={(nextValue) => {
                          if (nextValue[0]) {
                            setValue(
                              "severity",
                              nextValue[0] as ReportFormValues["severity"],
                              { shouldValidate: true }
                            )
                          }
                        }}
                        variant="outline"
                        spacing={2}
                        className="w-full flex-wrap"
                      >
                        {reportSeverities.map((severity) => (
                          <ToggleGroupItem
                            key={severity}
                            value={severity}
                            className="min-h-11 rounded-full px-4 capitalize"
                          >
                            {severity}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </Field>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.985 }}
                      onClick={() =>
                        setValue("isAnonymous", !values.isAnonymous, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "interactive-press flex w-full items-start gap-3 rounded-[1.65rem] border px-4 py-4 text-left shadow-[0_18px_42px_-30px_rgba(9,31,22,0.24)] transition-colors",
                        values.isAnonymous
                          ? "border-primary/20 bg-primary/[0.08]"
                          : "border-white/60 bg-white/78"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
                          values.isAnonymous
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/[0.05] text-foreground"
                        )}
                      >
                        <ShieldCheck className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          Submit this report as anonymous in public views
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Your contact details stay private to moderation staff, but the public timeline will not display your identity.
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                          values.isAnonymous
                            ? "bg-primary/12 text-primary"
                            : "bg-foreground/[0.05] text-muted-foreground"
                        )}
                      >
                        {values.isAnonymous ? "On" : "Off"}
                      </span>
                    </motion.button>

                    <Field>
                      <FieldLabel htmlFor="report-landmark">
                        Landmark note <span className="text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="report-landmark"
                          placeholder="Nearby school, junction, market gate, or bus stop"
                          {...register("landmark")}
                        />
                      </InputGroup>
                      <FieldDescription>
                        Helpful when GPS is weak and the street description needs one more anchor.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                ) : null}

                {currentStep.id === "proof" ? (
                  <FieldGroup>
                    <MediaUploadField
                      mediaItems={mediaItems}
                      isPreparing={isPreparingMedia}
                      progress={uploadProgress}
                      completedCount={uploadCompletedCount}
                      totalCount={uploadTotalCount}
                      onFilesSelected={handleMediaSelection}
                      onRemove={(id) =>
                        setMediaItems((current) => current.filter((entry) => entry.id !== id))
                      }
                    />
                    <Alert className="rounded-[1.5rem] border-primary/18 bg-primary/[0.06] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
                      Uploads are prepared locally before submission. In the real Supabase phase, this step will stream to storage and show network progress too.
                    </Alert>
                  </FieldGroup>
                ) : null}

                {currentStep.id === "contact" ? (
                  <FieldGroup>
                    {values.isAnonymous ? (
                      <Alert className="rounded-[1.5rem] border-primary/18 bg-primary/[0.06] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
                        Anonymous mode is on. These contact details remain private and are not shown on the public tracking timeline.
                      </Alert>
                    ) : null}

                    <Field data-invalid={Boolean(errors.name)}>
                      <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="contact-name"
                          placeholder="Full name"
                          aria-invalid={Boolean(errors.name)}
                          {...register("name")}
                        />
                      </InputGroup>
                      <FieldError>{errors.name?.message}</FieldError>
                    </Field>

                    <Field data-invalid={Boolean(errors.phone)}>
                      <FieldLabel htmlFor="contact-phone">Phone</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>+234</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="contact-phone"
                          placeholder="Reachable phone number"
                          aria-invalid={Boolean(errors.phone)}
                          {...register("phone")}
                        />
                      </InputGroup>
                      <FieldError>{errors.phone?.message}</FieldError>
                    </Field>

                    <Field data-invalid={Boolean(errors.email)}>
                      <FieldLabel htmlFor="contact-email">
                        Email <span className="text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="contact-email"
                          placeholder="name@example.com"
                          aria-invalid={Boolean(errors.email)}
                          {...register("email")}
                        />
                      </InputGroup>
                      <FieldDescription>
                        Email makes later status updates easier once notifications are fully wired.
                      </FieldDescription>
                      <FieldError>{errors.email?.message}</FieldError>
                    </Field>
                  </FieldGroup>
                ) : null}

                {currentStep.id === "review" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <ReviewSectionCard
                        title="Type and category"
                        helper="This decides the first screening context."
                        onEdit={() => setStepIndex(0)}
                        value={
                          <div className="space-y-1">
                            <p className="font-semibold capitalize">
                              {values.kind} • {values.category}
                            </p>
                            <p className="text-muted-foreground">
                              Severity: <span className="font-medium capitalize text-foreground">{values.severity}</span>
                            </p>
                          </div>
                        }
                      />

                      <ReviewSectionCard
                        title="Location"
                        helper="GPS is optional as long as the manual details are clear."
                        onEdit={() => setStepIndex(2)}
                        value={
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">
                              {summaryLocation || "Location details still incomplete"}
                            </p>
                            <p className="text-muted-foreground">
                              Coordinates:{" "}
                              <span className="font-medium text-foreground">
                                {selectedCoordinates
                                  ? `${selectedCoordinates.lat.toFixed(5)}, ${selectedCoordinates.lng.toFixed(5)}`
                                  : "No map point attached"}
                              </span>
                            </p>
                          </div>
                        }
                      />

                      <ReviewSectionCard
                        title="Issue details"
                        helper="This is the public-facing substance of the report."
                        onEdit={() => setStepIndex(3)}
                        value={
                          <div className="space-y-2">
                            <p className="font-semibold text-foreground">{values.title}</p>
                            <p className="text-muted-foreground">{values.description}</p>
                            <p className="text-muted-foreground">
                              Public identity:{" "}
                              <span className="font-medium text-foreground">
                                {values.isAnonymous ? "Anonymous mode on" : "Named submission"}
                              </span>
                            </p>
                          </div>
                        }
                      />

                      <ReviewSectionCard
                        title="Proof"
                        helper="Photos and video improve trust but are not mandatory."
                        onEdit={() => setStepIndex(4)}
                        value={
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">
                              {mediaItems.length > 0
                                ? `${mediaItems.length} item${mediaItems.length > 1 ? "s" : ""} attached`
                                : "No media attached"}
                            </p>
                            <p className="text-muted-foreground">
                              {mediaItems.length > 0
                                ? mediaItems.map((item) => item.name).join(", ")
                                : "Text-only submissions are still accepted."}
                            </p>
                          </div>
                        }
                      />

                      <ReviewSectionCard
                        title="Contact details"
                        helper="Private to moderation and authorized handlers."
                        onEdit={() => setStepIndex(5)}
                        value={
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{values.name}</p>
                            <p className="text-muted-foreground">{values.phone}</p>
                            <p className="text-muted-foreground">{values.email || "No email added"}</p>
                          </div>
                        }
                      />
                    </div>

                    <div className="rounded-[1.65rem] border border-primary/18 bg-primary/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{routingPreview}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Estimated first review: {estimatedResponse}. Routing can still escalate upward if the first queue is not correct.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Field data-invalid={Boolean(errors.consent)}>
                      <FieldLabel htmlFor="consent">
                        Privacy and moderation notice
                      </FieldLabel>
                      <label className="surface-muted flex items-start gap-3 rounded-[1.45rem] border border-white/60 p-4">
                        <input
                          id="consent"
                          type="checkbox"
                          className="mt-1 size-4 rounded border-border accent-[var(--primary)]"
                          {...register("consent")}
                        />
                        <span className="text-sm leading-6 text-muted-foreground">
                          I understand that false or abusive submissions may be moderated, while valid reports should remain traceable through the citizen-facing timeline.
                        </span>
                      </label>
                      <FieldError>{errors.consent?.message}</FieldError>
                    </Field>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {currentStep.id !== "review" && values.category && values.lga ? (
              <div className="rounded-[1.6rem] border border-primary/16 bg-primary/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CheckCheck className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Current routing preview</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {routingPreview} with an estimated first review of {estimatedResponse}.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="glass-panel rounded-[1.85rem] px-4 py-4 shadow-[0_22px_62px_-42px_rgba(8,28,20,0.26)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-[1.2rem]"
              )}
              disabled={stepIndex === 0}
            >
              <ChevronLeft data-icon="inline-start" />
              Back
            </button>

            {stepIndex < wizardSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => void goToNextStep()}
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                Continue
                <ArrowRight data-icon="inline-end" />
              </button>
            ) : (
              <button
                type="submit"
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                disabled={isPending}
              >
                <CheckCheck data-icon="inline-start" />
                {submitButtonLabel}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
