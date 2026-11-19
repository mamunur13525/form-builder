import type { MeetingProvider, MeetingSettings } from "../types/common"

export interface MeetingProviderMeta {
    value: MeetingProvider
    label: string
    /** Label for the link input in the editor. */
    linkLabel: string
    placeholder: string
    /** Short hint shown behind "What's this?". */
    helpText: string
}

export const MEETING_PROVIDERS: MeetingProviderMeta[] = [
    {
        value: "calendly",
        label: "Calendly",
        linkLabel: "Calendly link",
        placeholder: "https://calendly.com/your-link",
        helpText:
            "Open your Calendly event page and copy the full link from the address bar.",
    },
    {
        value: "calcom",
        label: "Cal.com",
        linkLabel: "Cal.com link",
        placeholder: "https://cal.com/your-link",
        helpText:
            "Open your Cal.com event page and copy the full link from the address bar.",
    },
    {
        value: "calid",
        label: "Cal.id",
        linkLabel: "Cal.id link",
        placeholder: "https://cal.id/your-link",
        helpText:
            "Open your Cal.id booking page and copy the full link from the address bar.",
    },
    {
        value: "savvycal",
        label: "SavvyCal",
        linkLabel: "SavvyCal link",
        placeholder: "https://savvycal.com/your-link",
        helpText:
            "Open your SavvyCal link and copy the full URL from the address bar.",
    },
    {
        value: "tidycal",
        label: "TidyCal",
        linkLabel: "TidyCal link",
        placeholder: "https://tidycal.com/your-link",
        helpText:
            "Open your TidyCal booking page and copy the full link from the address bar.",
    },
]

export const DEFAULT_MEETING_PROVIDER: MeetingProvider = "calcom"
export const DEFAULT_MEETING_OPENER_TEXT = "Select the slot."

export function meetingProviderMeta(
    provider: MeetingProvider | undefined,
): MeetingProviderMeta {
    return (
        MEETING_PROVIDERS.find((item) => item.value === provider) ??
        MEETING_PROVIDERS[1]
    )
}

export function defaultMeetingSettings(): MeetingSettings {
    return {
        provider: DEFAULT_MEETING_PROVIDER,
        link: "",
        openerText: DEFAULT_MEETING_OPENER_TEXT,
        prefillMappings: [],
    }
}

/** Turn an address/matrix-style object answer into a single prefill value. */
function answerToString(value: unknown): string | null {
    if (value === null || value === undefined) return null
    if (Array.isArray(value)) {
        const joined = value
            .map((entry) => answerToString(entry))
            .filter((entry): entry is string => Boolean(entry))
            .join(", ")
        return joined || null
    }
    if (typeof value === "string") return value.trim() || null
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value)
    }
    return null
}

/**
 * Booking URL with the configured prefill mappings appended as query params.
 * Invalid/unparseable links are returned untouched so the button still works.
 */
export function buildMeetingBookingUrl(
    settings: MeetingSettings,
    answers?: Record<string, unknown>,
): string {
    const link = settings.link.trim()
    if (!link) return ""

    // Reject non-web schemes outright (e.g. javascript:, data:).
    if (/^[a-z][a-z\d+.-]*:/i.test(link) && !/^https?:\/\//i.test(link)) {
        return ""
    }

    // Accept links without a protocol too, and normalise before handing them
    // to window.open so the path is always absolute.
    let url: URL
    try {
        const candidate = /^https?:\/\//i.test(link)
            ? link
            : `https://${link}`
        url = new URL(candidate)
    } catch {
        return ""
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return ""

    const mappings = settings.prefillMappings ?? []
    if (!answers || mappings.length === 0) return url.toString()

    for (const mapping of mappings) {
        if (!mapping.sourceKey || !mapping.targetKey) continue
        const value = answerToString(answers[mapping.sourceKey])
        if (!value) continue
        url.searchParams.set(mapping.targetKey, value)
    }

    return url.toString()
}
