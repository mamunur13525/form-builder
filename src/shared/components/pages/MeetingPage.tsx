import { useCallback, useEffect, useRef, useState } from "react"
import { Calendar, CheckCircle2, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import type { MeetingSettings } from "../../types/common"
import {
    buildMeetingBookingUrl,
    meetingProviderMeta,
} from "../../constants/meeting"
import { cn } from "@/lib/utils"

interface MeetingPageProps {
    settings: MeetingSettings
    /** Answers from earlier questions, used to fill the prefill mappings. */
    answers?: Record<string, unknown>
    /** The booked slot already recorded as this question's answer. */
    value?: unknown
    /** Records the booked slot as the question's answer. */
    onBooked?: (value: string) => void
    /** Builder preview: render the button but never open the dialog. */
    preview?: boolean
    color?: string
    fontSizeClass?: string
}

/** Keys booking providers use for a slot's start in their postMessage payload. */
const START_TIME_KEYS = new Set([
    "start_time",
    "startTime",
    "starts_at",
    "start_at",
])

function findStartTime(value: unknown, depth = 0): string | null {
    if (!value || typeof value !== "object" || depth > 6) return null
    for (const [key, entry] of Object.entries(value)) {
        if (
            START_TIME_KEYS.has(key) &&
            (typeof entry === "string" || typeof entry === "number")
        ) {
            const text = String(entry)
            if (!Number.isNaN(Date.parse(text))) return text
        }
    }
    for (const entry of Object.values(value)) {
        const found = findStartTime(entry, depth + 1)
        if (found) return found
    }
    return null
}

/** Provider event names that mean a booking was completed. */
function isBookingMessage(data: unknown): boolean {
    if (!data || typeof data !== "object") return false
    const record = data as Record<string, unknown>
    const name = String(record.event ?? record.type ?? record.action ?? "")
    return /event_scheduled|bookingsuccessful|bookingcomplete|booking_complete|booking_acknowledgement|appointment\.created|booking[._]created/i.test(
        name,
    )
}

function formatSlot(raw: string): string {
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return raw
    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

/**
 * "Meeting" page — opens the configured scheduling provider (Calendly,
 * Cal.com, Cal.id, SavvyCal, TidyCal) in a dialog. When the provider reports a
 * completed booking, the slot is recorded as this question's answer.
 */
export function MeetingPage({
    settings,
    answers,
    value,
    onBooked,
    preview = false,
    color,
    fontSizeClass,
}: MeetingPageProps) {
    const [open, setOpen] = useState(false)
    const [needsDate, setNeedsDate] = useState(false)
    const [manualSlot, setManualSlot] = useState("")
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const bookedRef = useRef(false)

    const provider = meetingProviderMeta(settings.provider)
    const label = settings.openerText?.trim() || "Select the slot."
    const booked = typeof value === "string" ? value : ""

    const handleBooked = useCallback(
        (raw: string | null) => {
            if (raw) {
                const slot = formatSlot(raw)
                bookedRef.current = true
                setNeedsDate(false)
                onBooked?.(slot)
                return
            }
            if (bookedRef.current) return
            bookedRef.current = true
            setNeedsDate(true)
        },
        [onBooked],
    )

    // Booking providers report completion through postMessage. SavvyCal's
    // embed uses a DOM event instead, so listen for that too.
    useEffect(() => {
        if (!open || preview) return

        const onMessage = (event: MessageEvent) => {
            const frame = iframeRef.current
            if (!frame || event.source !== frame.contentWindow) return
            if (!isBookingMessage(event.data)) return
            handleBooked(findStartTime(event.data))
        }
        const onSavvyCal = (event: Event) => {
            handleBooked(findStartTime((event as CustomEvent).detail))
        }

        window.addEventListener("message", onMessage)
        window.addEventListener("savvycal:appointment.created", onSavvyCal)
        return () => {
            window.removeEventListener("message", onMessage)
            window.removeEventListener("savvycal:appointment.created", onSavvyCal)
        }
    }, [open, preview, handleBooked])

    if (!settings.link?.trim()) return null

    const openDialog = () => {
        if (preview || !bookingUrl) return
        bookedRef.current = false
        setNeedsDate(false)
        setManualSlot("")
        setOpen(true)
    }

    const saveManualSlot = () => {
        if (!manualSlot) return
        const slot = formatSlot(manualSlot)
        setNeedsDate(false)
        onBooked?.(slot)
    }

    const buttonClass = cn(
        "inline-flex h-11 w-auto items-center justify-center gap-2.5 rounded-lg border px-5 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        fontSizeClass,
        !preview && "cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60",
        preview && "cursor-default",
        !color && "border-slate-400 text-slate-800 dark:border-zinc-600 dark:text-zinc-100",
    )

    const buttonStyle = color
        ? {
              color,
              borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
          }
        : undefined

    const bookingUrl = (() => {
        const base = buildMeetingBookingUrl(settings, answers)
        if (!base) return ""
        // Calendly only posts booking events to a parent when it knows the
        // embedding domain.
        if (settings.provider === "calendly" && typeof window !== "undefined") {
            const url = new URL(base)
            url.searchParams.set("embed_domain", window.location.hostname)
            url.searchParams.set("embed_type", "Inline")
            return url.toString()
        }
        return base
    })()

    return (
        <>
            {booked ? (
                <div className={cn(buttonClass, "pr-3")} style={buttonStyle}>
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{booked}</span>
                    {!preview && (
                        <button
                            type="button"
                            onClick={openDialog}
                            className="ml-1 shrink-0 underline underline-offset-2 hover:no-underline"
                        >
                            Change
                        </button>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={openDialog}
                    aria-haspopup="dialog"
                    className={buttonClass}
                    style={buttonStyle}
                >
                    <Calendar className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{label}</span>
                </button>
            )}

            {!preview && (
                <Dialog
                    open={open}
                    onOpenChange={setOpen}
                    className="light flex h-[min(90vh,860px)] w-[min(96vw,900px)] max-w-none flex-col overflow-hidden bg-white p-0 text-slate-900"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
                        <div className="flex items-center gap-2 font-semibold">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            Schedule with {provider.label}
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close scheduling dialog"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 bg-slate-50">
                        <iframe
                            ref={iframeRef}
                            src={bookingUrl}
                            title={`${provider.label} booking`}
                            className="h-full w-full border-0"
                            allow="camera; microphone; fullscreen"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    {needsDate ? (
                        <div className="border-t border-slate-200 px-5 py-3">
                            <p className="text-sm font-medium">
                                Meeting booked. Confirm the slot you selected:
                            </p>
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={manualSlot}
                                    onChange={(event) => setManualSlot(event.target.value)}
                                    className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={saveManualSlot}
                                    disabled={!manualSlot}
                                    className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-40"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : booked ? (
                        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Meeting scheduled for {booked}
                            </p>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
                            >
                                Done
                            </button>
                        </div>
                    ) : null}
                </Dialog>
            )}
        </>
    )
}
