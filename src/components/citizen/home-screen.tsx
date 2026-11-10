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
    <section className="relative min-h-[100dvh] bg-[#f5f7f3] px-3 pt-[calc(6.5rem+env(safe-area-inset-top))] pb-[calc(12.5rem+env(safe-area-inset-bottom))] text-foreground sm:px-5">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-4 flex items-center gap-3 border-b border-[#dce6dc] pb-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#176748] text-xl font-semibold text-white" aria-hidden="true">E</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight">EkiSignal</h1>
            <p className="mt-1 text-xs text-muted-foreground">Ekiti community help · Text chat</p>
          </div>
          {lines.length > 0 ? (
            <button
              type="button"
              onClick={() => setLines([])}
              className="min-h-11 rounded-xl px-3 text-xs font-semibold text-primary"
            >
              Clear
            </button>
          ) : null}
          <Link href="/reports" className="inline-flex min-h-11 items-center rounded-xl px-2 text-xs font-semibold text-primary">
            Map <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Link>
        </header>

        <div role="log" aria-label="EkiSignal text conversation" aria-live="polite" className="flex flex-col items-start gap-3">
          <div className="max-w-[90%] rounded-[1.1rem] rounded-bl-[0.35rem] border border-[#e0e9de] bg-white px-4 py-3 text-sm leading-6 shadow-sm">
            <span className="mb-1 block text-xs font-semibold text-[#176748]">EkiSignal</span>
            <p>Hi! What would you like to do in Ekiti today?</p>
            <p className="mt-2 text-xs text-muted-foreground">
              I can guide you to a report, public map, tracking, or community notices. This is an independent civic project, not an emergency dispatch service.
            </p>
          </div>

          {lines.length === 0 ? (
            <div className="flex max-w-full flex-wrap gap-2" aria-label="Start a conversation">
              <Link href="/report/new" className="inline-flex min-h-11 items-center rounded-full border border-[#b2d0bf] bg-white px-4 py-2 text-sm font-medium text-[#175c41]">
                Report an issue
              </Link>
              <Link href="/track" className="inline-flex min-h-11 items-center rounded-full border border-[#b2d0bf] bg-white px-4 py-2 text-sm font-medium text-[#175c41]">
                Track a number
              </Link>
              <Link href="/alerts" className="inline-flex min-h-11 items-center rounded-full border border-[#b2d0bf] bg-white px-4 py-2 text-sm font-medium text-[#175c41]">
                Community notices
              </Link>
            </div>
          ) : null}

          {lines.map((line) => (
            <div
              key={line.id}
              className={
                line.sender === "resident"
                  ? "self-end max-w-[88%] rounded-[1.1rem] rounded-br-[0.35rem] bg-[#d8eee0] px-4 py-3 text-sm leading-6 text-[#143b29] shadow-sm wrap-break-word"
                  : "max-w-[90%] rounded-[1.1rem] rounded-bl-[0.35rem] border border-[#e0e9de] bg-white px-4 py-3 text-sm leading-6 shadow-sm wrap-break-word"
              }
            >
              {line.sender === "ekisignal" ? (
                <span className="mb-1 block text-xs font-semibold text-[#176748]">EkiSignal</span>
              ) : null}
              <p className="whitespace-pre-wrap">{line.text}</p>
              {line.href && line.linkLabel ? (
                <Link href={line.href} className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#aac9b6] bg-[#f5faf6] px-3 py-2 text-sm font-semibold text-[#176748]">
                  {line.linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ))}
          <div ref={bottom} />
        </div>
      </div>

      <form
        className="fixed inset-x-0 z-[90] mx-auto w-full max-w-[43rem] border-t border-[#dde6dc] bg-[#f5f7f3] px-3 py-3 sm:px-5"
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
            className="h-12 min-w-0 flex-1 rounded-full border border-[#cbd9cf] bg-white px-4 text-base outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#176748]"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#176748] text-white disabled:opacity-40"
          >
            <Send className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 px-2 text-[11px] text-muted-foreground">
          Text-only navigation · Messages are not submitted as reports
        </p>
      </form>
    </section>
  )
}
