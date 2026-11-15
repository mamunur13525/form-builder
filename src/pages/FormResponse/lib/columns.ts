import type { Form, FormResponse } from "@/shared/types/common"
import { formatAnswerValue } from "./export"

/**
 * The submissions table has two layers:
 *  - `visible` — just the form's own questions (what a respondent actually saw).
 *  - `all`     — the questions plus the technical metadata captured on submit.
 */
export type SubmissionLayer = "visible" | "all"

export interface SubmissionLayerMeta {
    value: SubmissionLayer
    label: string
    /** One-line explanation shown on hover. */
    hint: string
}

export const SUBMISSION_LAYERS: SubmissionLayerMeta[] = [
    {
        value: "visible",
        label: "Visible data",
        hint: "Only the questions your respondents actually saw and answered.",
    },
    {
        value: "all",
        label: "All data",
        hint: "Every question plus the metadata captured on submit (session, location, device).",
    },
]

export interface SubmissionColumn {
    /** Unique column id — a `pageKey` for answers, a metadata path otherwise. */
    id: string
    label: string
    /** Metadata columns are only present in the "all" layer. */
    group: "answer" | "metadata"
    /** Reads the display value for one response. */
    getValue: (response: FormResponse) => string
}

/** Metadata columns appended after the answers in the "all" layer. */
const METADATA_COLUMNS: SubmissionColumn[] = [
    {
        id: "meta.status",
        label: "Status",
        group: "metadata",
        getValue: (response) =>
            response.status
                ? response.status.charAt(0).toUpperCase() + response.status.slice(1)
                : "Completed",
    },
    {
        id: "meta.country",
        label: "Country",
        group: "metadata",
        getValue: (response) => response.metadata?.country ?? "",
    },
    {
        id: "meta.city",
        label: "City",
        group: "metadata",
        getValue: (response) => response.metadata?.city ?? "",
    },
    {
        id: "meta.ipAddress",
        label: "IP Address",
        group: "metadata",
        getValue: (response) => response.metadata?.ipAddress ?? "",
    },
    {
        id: "meta.referrer",
        label: "Referrer",
        group: "metadata",
        getValue: (response) => response.metadata?.referrer ?? "",
    },
    {
        id: "meta.userAgent",
        label: "User Agent",
        group: "metadata",
        getValue: (response) => response.metadata?.userAgent ?? "",
    },
    {
        id: "meta.sessionId",
        label: "Session ID",
        group: "metadata",
        getValue: (response) => response.sessionId ?? "",
    },
    {
        id: "meta.respondentId",
        label: "Respondent ID",
        group: "metadata",
        getValue: (response) => response.respondentId ?? "",
    },
]

/** Build the answer columns for a form, ordered the same way as the form itself. */
function buildAnswerColumns(form: Form): SubmissionColumn[] {
    const columns: SubmissionColumn[] = []
    const sortedPages = [...form.pages].sort((a, b) => a.order - b.order)

    for (const page of sortedPages) {
        const questions = (page.questions && page.questions.length > 0)
            ? [...page.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : (page.blocks && page.blocks.length > 0)
                ? [...page.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                : []

        if (questions.length > 0) {
            questions.forEach((q, idx) => {
                const questionKey =
                    q.questionKey ||
                    q.blockKey ||
                    (questions.length === 1 ? page.pageKey : `${page.pageKey}_q${idx + 1}`)
                const label =
                    q.title ||
                    q.label ||
                    (questions.length === 1 ? (page.title || page.label) : `Question ${idx + 1}`)

                columns.push({
                    id: questionKey,
                    label: label || `Question ${idx + 1}`,
                    group: "answer" as const,
                    getValue: (response: FormResponse) => {
                        const answer = response.answers?.find(
                            (a) =>
                                (a.questionKey && a.questionKey === questionKey) ||
                                (a.blockKey && a.blockKey === questionKey) ||
                                (a.pageKey && a.pageKey === questionKey) ||
                                (questions.length === 1 &&
                                    (a.pageKey === page.pageKey || a.blockKey === page.pageKey)),
                        )
                        return formatAnswerValue(answer?.value)
                    },
                })
            })
        } else {
            columns.push({
                id: page.pageKey,
                label: page.title || page.label || page.pageKey,
                group: "answer" as const,
                getValue: (response: FormResponse) => {
                    const answer = response.answers?.find(
                        (a) =>
                            a.pageKey === page.pageKey ||
                            a.blockKey === page.pageKey ||
                            a.questionKey === page.pageKey,
                    )
                    return formatAnswerValue(answer?.value)
                },
            })
        }
    }

    return columns
}

/**
 * Columns for the given layer. Every column is rendered at once — the table
 * scrolls horizontally rather than collapsing the overflow into a "+N more" cell.
 */
export function buildSubmissionColumns(
    form: Form | null,
    layer: SubmissionLayer,
): SubmissionColumn[] {
    if (!form) return []
    const answers = buildAnswerColumns(form)
    return layer === "all" ? [...answers, ...METADATA_COLUMNS] : answers
}

/** Column count per layer, used for the counts shown on the layer tabs. */
export function countSubmissionColumns(form: Form | null, layer: SubmissionLayer): number {
    return buildSubmissionColumns(form, layer).length
}
