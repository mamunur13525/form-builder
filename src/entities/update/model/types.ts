/**
 * Updates / changelog domain types.
 *
 * These match the DTOs returned by the backend updates module
 * (`/api/v1/updates/*`). The rich-text `content` blocks are stored verbatim and
 * rendered by the Updates pages; admin writes send the same block shape back.
 */

import type { Author } from "@/entities/feedback/model/types"

/** Inline run inside an update paragraph — supports bold, links and code chips. */
export interface TextRun {
    text: string
    bold?: boolean
    link?: string
    code?: boolean
}

export type UpdateBlock =
    | { type: "paragraph"; runs: TextRun[] }
    | { type: "readmore"; url: string; label: string }

/** Illustration key resolved to an inline SVG cover. */
export type UpdateCoverKey = "mcp" | "sheets" | "integrations"

export interface UpdateEntry {
    id: string
    slug: string
    title: string
    /** ISO date string. */
    date: string
    tags: string[]
    cover?: UpdateCoverKey
    excerpt: string
    author?: Author
    content: UpdateBlock[]
}

/** Product-activity heat data for the Updates sidebar (last 12 weeks). */
export interface ProductActivity {
    weeks: number[]
    completed: number
}

/** Body accepted by POST /updates (admin only). */
export interface CreateUpdateRequest {
    title: string
    date?: string
    tags?: string[]
    cover?: UpdateCoverKey
    excerpt?: string
    content: UpdateBlock[]
}

/** Body accepted by PATCH /updates/:id (admin only). `cover: null` clears it. */
export interface UpdateUpdateRequest {
    title?: string
    date?: string
    tags?: string[]
    cover?: UpdateCoverKey | null
    excerpt?: string
    content?: UpdateBlock[]
}
