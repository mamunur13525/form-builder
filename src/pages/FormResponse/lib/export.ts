import type { FormResponse } from "@/shared/types/common"
import type { SubmissionColumn } from "./columns"

/** Render an answer value as display text (used by both the table and the exports). */
export function formatAnswerValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return ""
    if (Array.isArray(value)) return value.map((item) => formatAnswerValue(item)).join(", ")
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
}

/** Short human-readable submission timestamp, e.g. `Mar 4, 2026, 09:12`. */
export function formatSubmittedAt(value: string): string {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/** Trailing part of an ObjectId, used as a short display id (`#a1b2c3`). */
export function formatShortId(id: string | undefined): string {
    if (!id) return "—"
    return `#${id.slice(-6)}`
}

/** Quote a CSV cell, escaping embedded quotes. */
function escapeCsvCell(value: string): string {
    return `"${value.replace(/"/g, '""')}"`
}

/**
 * Turn responses into a CSV document (one row per response), using the same
 * columns — and the same order — as the table the user is looking at.
 */
export function buildResponsesCsv(
    columns: SubmissionColumn[],
    responses: FormResponse[],
): string {
    const header = ["Response ID", ...columns.map((column) => column.label), "Submitted At"]

    const rows = responses.map((response) => [
        response._id ?? "",
        ...columns.map((column) => column.getValue(response)),
        formatSubmittedAt(response.submittedAt),
    ])

    return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")
}

/** Same data as the CSV export, as a JSON array of label-keyed objects. */
export function buildResponsesJson(
    columns: SubmissionColumn[],
    responses: FormResponse[],
): string {
    const rows = responses.map((response) => {
        const row: Record<string, string> = { "Response ID": response._id ?? "" }
        for (const column of columns) {
            row[column.label] = column.getValue(response)
        }
        // Raw ISO timestamp here — JSON consumers want the machine-readable value.
        row["Submitted At"] = response.submittedAt ?? ""
        return row
    })

    return JSON.stringify(rows, null, 2)
}

/** Trigger a browser download for the given text content. */
export function downloadTextFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/** Build a filesystem-safe file name from a form title. */
export function toSafeFileName(title: string, fallback: string): string {
    const safe = title.trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase()
    return safe || fallback
}
