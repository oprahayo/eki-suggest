"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Send } from "lucide-react"

type ChatReply = {
  text: string
  href?: string
  linkLabel?: string
}

type ChatLine = {
  id: number
  sender: "resident" | "ekisignal"
  text: string
  href?: string
  linkLabel?: string
}

/**
 * A text-only navigation conversation, not a generative AI endpoint or a
 * public reporting API. Nothing typed here is uploaded, stored in the URL,
 * or attached to a case. The private report form handles actual drafts.
 */
function replyFor(value: string): ChatReply {
  const text = value.toLocaleLowerCase("en-NG")
  if (/\b(report|complain|complaint|issue|broken|road|pothole|water|drain|flood|electric|waste|damage|suggest)\b/.test(text)) {
    return {
      text: "I can help you prepare a report. Start a private draft to add the location and details. A draft does not mean an office has received it.",
      href: "/report/new",
      linkLabel: "Start a report",
    }
  }
  if (/\b(track|ticket|reference|status|follow.?up|case number)\b/.test(text)) {
    return {
      text: "You can check a report reference or view a tracking example. A reference from this device alone is not proof of government receipt.",
      href: "/track",
      linkLabel: "Track a report",
    }
  }
  if (/\b(alert|notice|announcement|community|news)\b/.test(text)) {
    return {
      text: "Community notices are available in Alerts. Check the source and date of each notice.",
      href: "/alerts",
      linkLabel: "Read notices",
    }
  }
  if (/\b(map|nearby|location|public reports|reports|signals)\b/.test(text)) {
    return {
      text: "The Reports tab opens the Ekiti map. Current markers are fictional examples, not a live government feed.",
      href: "/reports",
      linkLabel: "Open public map",
    }
  }
  return {
    text: "I can help you report a problem, track a reference, find a report on the Ekiti map, or read community notices. Choose a shortcut below.",
  }
}

export function HomeScreen() {
  const [draft, setDraft] = useState("")
  const [lines, setLines] = useState<ChatLine[]>([])
  const nextId = useRef(1)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lines.length > 0) bottom.current?.scrollIntoView({ block: "nearest" })
  }, [lines.length])

  function sendMessage() {
    const text = draft.trim().slice(0, 600)
    if (!text) return
    const reply = replyFor(text)
    setLines((current) => [
      ...current.slice(-18),
      { id: nextId.current++, sender: "resident", text },
      { id: nextId.current++, sender: "ekisignal", ...reply },
    ])
    setDraft("")
  }

  return (
    <section className="relative min-h-[100dvh] bg-[#fafbfa] px-2 pt-[calc(6.25rem+env(safe-area-inset-top))] pb-[calc(9rem+env(safe-area-inset-bottom))] text-foreground sm:px-5">
      <div className="mx-auto min-h-[calc(100dvh-14rem)] w-full max-w-[46rem] rounded-[1.8rem] border border-[#d5d9dc] bg-[#eceef0] px-3 py-4 shadow-[0_1px_4px_rgba(15,23,42,0.025)] sm:min-h-[calc(100dvh-15rem)] sm:rounded-[2rem] sm:px-6 sm:py-6">
        <header className="mb-5 flex items-center gap-3 border-b border-[#d8dce0] pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#215b47] text-lg font-semibold text-white" aria-hidden="true">E</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-semibold leading-tight tracking-[-0.02em]">EkiSignal</h1>
            <p className="mt-1 text-xs text-[#626b70]">Ekiti community chat</p>
          </div>
          {lines.length > 0 ? (
            <button
              type="button"
              onClick={() => setLines([])}
              className="min-h-11 rounded-xl px-3 text-xs font-medium text-[#475569] hover:bg-[#dde0e3]"
            >
              Clear
            </button>
          ) : null}
          <Link href="/reports" className="inline-flex min-h-11 items-center rounded-xl px-2 text-xs font-semibold text-[#215b47] hover:underline">
            Map <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Link>
        </header>

        <div role="log" aria-label="EkiSignal text conversation" aria-live="polite" className="flex flex-col items-start gap-3 pb-4">
          <div className="max-w-[90%] rounded-[1.25rem] rounded-bl-[0.4rem] border border-[#e3e5e7] bg-white px-4 py-3 text-sm leading-6 shadow-[0_1px_2px_rgba(0,0,0,0.035)]">
            <span className="mb-1 block text-xs font-semibold text-[#215b47]">EkiSignal</span>
            <p>Hi! What would you like to do in Ekiti today?</p>
            <p className="mt-2 text-xs text-muted-foreground">
              I can guide you to a report, public map, tracking, or community notices. This is an independent civic project, not an emergency dispatch service.
            </p>
          </div>

          {lines.length === 0 ? (
            <div className="flex max-w-full flex-wrap gap-2" aria-label="Start a conversation">
              <Link href="/report/new" className="inline-flex min-h-11 items-center rounded-full border border-[#cbd3d0] bg-white px-4 py-2 text-[13px] font-medium text-[#245641] transition-colors hover:border-[#7ea791] hover:bg-[#f6faf7]">
                Report an issue
              </Link>
              <Link href="/track" className="inline-flex min-h-11 items-center rounded-full border border-[#cbd3d0] bg-white px-4 py-2 text-[13px] font-medium text-[#245641] transition-colors hover:border-[#7ea791] hover:bg-[#f6faf7]">
                Track a number
              </Link>
              <Link href="/alerts" className="inline-flex min-h-11 items-center rounded-full border border-[#cbd3d0] bg-white px-4 py-2 text-[13px] font-medium text-[#245641] transition-colors hover:border-[#7ea791] hover:bg-[#f6faf7]">
                Community notices
              </Link>
            </div>
          ) : null}

          {lines.map((line) => (
            <div
              key={line.id}
              className={
                line.sender === "resident"
                  ? "self-end max-w-[88%] rounded-[1.25rem] rounded-br-[0.4rem] bg-[#d9eee2] px-4 py-3 text-sm leading-6 text-[#173c2b] shadow-sm wrap-break-word"
                  : "max-w-[90%] rounded-[1.25rem] rounded-bl-[0.4rem] border border-[#e3e5e7] bg-white px-4 py-3 text-sm leading-6 shadow-sm wrap-break-word"
              }
            >
              {line.sender === "ekisignal" ? (
                <span className="mb-1 block text-xs font-semibold text-[#215b47]">EkiSignal</span>
              ) : null}
              <p className="whitespace-pre-wrap">{line.text}</p>
              {line.href && line.linkLabel ? (
                <Link href={line.href} className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#bcd3c6] bg-[#f6faf7] px-3 py-2 text-sm font-semibold text-[#215b47]">
                  {line.linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ))}
          <div ref={bottom} />
        </div>
      </div>

      <form
        className="fixed inset-x-0 z-[90] mx-auto w-full max-w-[43rem] rounded-t-[1.4rem] border border-b-0 border-[#d5d9dc] bg-[#eceef0] px-3 pb-3 pt-3 shadow-[0_-4px_20px_rgba(15,23,42,0.035)] sm:px-5"
        style={{ bottom: "calc(6.8rem + env(safe-area-inset-bottom))" }}
        onSubmit={(event) => { event.preventDefault(); sendMessage() }}
      >
        <label htmlFor="ekisignal-chat-message" className="sr-only">Type your message</label>
        <div className="flex items-center gap-2">
          <input
            id="ekisignal-chat-message"
            type="text"
            inputMode="text"
            enterKeyHint="send"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={600}
            placeholder="Type a message…"
            className="h-14 min-w-0 flex-1 rounded-[1.25rem] border border-[#c9cdd1] bg-[#f9fafb] px-4 text-base outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#215b47]"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-[#215b47] text-white disabled:opacity-40"
          >
            <Send className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 px-2 text-[10px] text-[#6b7280]">Chat suggestions stay on this device · No report is submitted here</p>
      </form>
    </section>
  )
}
