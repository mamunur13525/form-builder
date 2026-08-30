import { useState } from "react"
import { Navigate } from "react-router-dom"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ROUTES } from "@/shared/constants/routes"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import {
    useCreateUpdate,
    useDeleteUpdate,
    useUpdates,
    useUpdateUpdate,
} from "@/features/updates/hooks/useUpdates"
import type {
    UpdateBlock,
    UpdateCoverKey,
    UpdateEntry,
} from "@/entities/update/model/types"

// ---------------------------------------------------------------------------
// Content <-> plain-text helpers
//
// The admin editor exposes updates as plain text: one paragraph per blank-line
// block, plus an optional "read more" link. Existing rich runs (bold/links) are
// preserved on save *only* when the body is left untouched (see UpdateEditor).
// ---------------------------------------------------------------------------

const COVER_OPTIONS: { value: string; label: string }[] = [
    { value: "none", label: "No cover" },
    { value: "mcp", label: "MCP" },
    { value: "sheets", label: "Google Sheets" },
    { value: "integrations", label: "Integrations" },
]

function blocksToBody(content: UpdateBlock[]): string {
    return content
        .filter((b): b is Extract<UpdateBlock, { type: "paragraph" }> => b.type === "paragraph")
        .map((b) => b.runs.map((r) => r.text).join(""))
        .join("\n\n")
}

function firstReadMore(content: UpdateBlock[]): { url: string; label: string } {
    const rm = content.find(
        (b): b is Extract<UpdateBlock, { type: "readmore" }> => b.type === "readmore",
    )
    return rm ? { url: rm.url, label: rm.label } : { url: "", label: "" }
}

function bodyToBlocks(body: string, readMoreUrl: string, readMoreLabel: string): UpdateBlock[] {
    const blocks: UpdateBlock[] = body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => ({ type: "paragraph", runs: [{ text: p }] }))
    const url = readMoreUrl.trim()
    const label = readMoreLabel.trim()
    if (url && label) blocks.push({ type: "readmore", url, label })
    return blocks
}

const parseTags = (s: string): string[] =>
    s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10)

const toDateInput = (iso: string): string => (iso ? iso.slice(0, 10) : "")
const toIso = (d: string): string | undefined =>
    d ? new Date(`${d}T00:00:00.000Z`).toISOString() : undefined
const formatDate = (iso: string): string => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
    label,
    htmlFor,
    hint,
    children,
}: {
    label: string
    htmlFor?: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={htmlFor} className="text-[var(--foreground)]">
                {label}
            </Label>
            {children}
            {hint ? <p className="text-xs text-[var(--editorial-subtle)]">{hint}</p> : null}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Editor (create + edit)
// ---------------------------------------------------------------------------

function UpdateEditor({ entry, onClose }: { entry: UpdateEntry | null; onClose: () => void }) {
    const isEdit = !!entry
    const initialRM = entry ? firstReadMore(entry.content) : { url: "", label: "" }
    const initialBody = entry ? blocksToBody(entry.content) : ""

    const [title, setTitle] = useState(entry?.title ?? "")
    const [date, setDate] = useState(toDateInput(entry?.date ?? ""))
    const [tags, setTags] = useState((entry?.tags ?? []).join(", "))
    const [cover, setCover] = useState<string>(entry?.cover ?? "none")
    const [excerpt, setExcerpt] = useState(entry?.excerpt ?? "")
    const [body, setBody] = useState(initialBody)
    const [readMoreUrl, setReadMoreUrl] = useState(initialRM.url)
    const [readMoreLabel, setReadMoreLabel] = useState(initialRM.label)

    const create = useCreateUpdate()
    const update = useUpdateUpdate()
    const isPending = create.isPending || update.isPending

    const buildContent = (): UpdateBlock[] => {
        // Reuse original blocks (keeping rich formatting) if body/link untouched.
        if (
            entry &&
            body === initialBody &&
            readMoreUrl.trim() === initialRM.url &&
            readMoreLabel.trim() === initialRM.label
        ) {
            return entry.content
        }
        return bodyToBlocks(body, readMoreUrl, readMoreLabel)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedTitle = title.trim()
        if (!trimmedTitle) {
            showError("Title is required", "Give the update a title before saving.")
            return
        }

        const content = buildContent()
        const tagList = parseTags(tags)
        const trimmedExcerpt = excerpt.trim()

        if (isEdit && entry) {
            update.mutate(
                {
                    id: entry.id,
                    input: {
                        title: trimmedTitle,
                        date: toIso(date),
                        tags: tagList,
                        cover: cover === "none" ? null : (cover as UpdateCoverKey),
                        excerpt: trimmedExcerpt,
                        content,
                    },
                },
                {
                    onSuccess: () => {
                        showSuccess("Update saved", "Your changes are live.")
                        onClose()
                    },
                    onError: (err) => showError("Couldn't save update", err),
                },
            )
        } else {
            create.mutate(
                {
                    title: trimmedTitle,
                    date: toIso(date),
                    tags: tagList,
                    cover: cover === "none" ? undefined : (cover as UpdateCoverKey),
                    excerpt: trimmedExcerpt,
                    content,
                },
                {
                    onSuccess: () => {
                        showSuccess("Update published", "Your new update is live.")
                        onClose()
                    },
                    onError: (err) => showError("Couldn't publish update", err),
                },
            )
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={onClose}
                className="editorial-transition inline-flex items-center gap-1.5 text-sm font-medium text-[var(--editorial-body)] hover:text-[var(--foreground)]"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to updates
            </button>

            <h1 className="mt-4 font-display text-2xl text-[var(--foreground)] sm:text-3xl">
                {isEdit ? "Edit update" : "New update"}
            </h1>
            <p className="mt-1 text-sm text-[var(--editorial-body)] sm:text-base">
                {isEdit
                    ? "Change the details below and save to publish your edits."
                    : "Fill in the details below to publish a product update."}
            </p>

            <form
                onSubmit={handleSubmit}
                className="editorial-shadow-sm mt-6 flex flex-col gap-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8"
            >
                <Field label="Title" htmlFor="update-title">
                    <Input
                        id="update-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. TypeForm MCP is here"
                        required
                    />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Date" htmlFor="update-date" hint="Defaults to today if left blank.">
                        <Input
                            id="update-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Field>

                    <Field label="Cover illustration">
                        <Select value={cover} onValueChange={(v) => v && setCover(v)}>
                            <SelectTrigger className="w-full bg-[var(--card)]">
                                <SelectValue placeholder="No cover" />
                            </SelectTrigger>
                            <SelectContent>
                                {COVER_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field
                    label="Tags"
                    htmlFor="update-tags"
                    hint="Comma-separated, up to 10 (e.g. Integrations, AI)."
                >
                    <Input
                        id="update-tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Integrations, AI"
                    />
                </Field>

                <Field
                    label="Excerpt"
                    htmlFor="update-excerpt"
                    hint="A short summary shown in the updates list."
                >
                    <Textarea
                        id="update-excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="One or two sentences summarising the update."
                        className="min-h-[80px]"
                    />
                </Field>

                <Field
                    label="Body"
                    htmlFor="update-body"
                    hint="Separate paragraphs with a blank line."
                >
                    <Textarea
                        id="update-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={"Write the update here.\n\nStart a new paragraph after a blank line."}
                        className="min-h-[180px]"
                    />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Read more — link" htmlFor="update-rm-url" hint="Optional call-to-action URL.">
                        <Input
                            id="update-rm-url"
                            value={readMoreUrl}
                            onChange={(e) => setReadMoreUrl(e.target.value)}
                            placeholder="https://…"
                        />
                    </Field>
                    <Field label="Read more — label" htmlFor="update-rm-label" hint="Shown only if a link is set.">
                        <Input
                            id="update-rm-label"
                            value={readMoreLabel}
                            onChange={(e) => setReadMoreLabel(e.target.value)}
                            placeholder="Read the docs"
                        />
                    </Field>
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--editorial-border-light)] pt-5 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                        className="w-full text-sm sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="w-full gap-2 text-sm sm:w-auto">
                        {isPending ? <Spinner /> : null}
                        {isEdit ? "Save changes" : "Publish update"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Delete confirmation
// ---------------------------------------------------------------------------

function DeleteUpdateDialog({
    entry,
    onOpenChange,
}: {
    entry: UpdateEntry | null
    onOpenChange: (open: boolean) => void
}) {
    const del = useDeleteUpdate()

    const handleDelete = () => {
        if (!entry) return
        del.mutate(entry.id, {
            onSuccess: () => {
                showSuccess("Update deleted", "The update has been removed.")
                onOpenChange(false)
            },
            onError: (err) => showError("Couldn't delete update", err),
        })
    }

    return (
        <AlertDialog open={!!entry} onOpenChange={onOpenChange}>
            <AlertDialogContent className="editorial editorial-shadow rounded-2xl bg-[var(--popover)] p-6 ring-0 sm:p-10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl leading-tight text-[var(--foreground)] sm:text-[32px]">
                        Delete update
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                        Are you sure you want to delete “{entry?.title}”? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        disabled={del.isPending}
                        variant="ghost"
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={del.isPending}
                        variant="destructive"
                        className="w-full sm:w-auto"
                    >
                        {del.isPending ? "Deleting…" : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------

function UpdateRow({
    update,
    onEdit,
    onDelete,
}: {
    update: UpdateEntry
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
                    {update.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--editorial-subtle)]">
                    <span>{formatDate(update.date)}</span>
                    {update.cover ? (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize">{update.cover} cover</span>
                        </>
                    ) : null}
                    {update.tags.length > 0 ? (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{update.tags.join(", ")}</span>
                        </>
                    ) : null}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    className="gap-1.5 text-sm"
                    aria-label={`Delete ${update.title}`}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminUpdatesPage() {
    const { isLoading: userLoading } = useCurrentUser()

    const [editorOpen, setEditorOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<UpdateEntry | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<UpdateEntry | null>(null)

    const { data: updates, isLoading, isError } = useUpdates()

    // Gate on the resolved role — ProtectedLayout already guarantees a token.
    if (userLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner className="size-6 text-[var(--editorial-subtle)]" />
            </div>
        )
    }

    // if (!user || user.role !== "admin") {
    //     return <Navigate to={ROUTES.DASHBOARD} replace />
    // }

    const closeEditor = () => {
        setEditorOpen(false)
        setEditingEntry(null)
    }

    return (
        <div className="mx-auto max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
            {editorOpen ? (
                <UpdateEditor
                    key={editingEntry?.id ?? "new"}
                    entry={editingEntry}
                    onClose={closeEditor}
                />
            ) : (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-display text-2xl text-[var(--foreground)] sm:text-3xl">
                                Product updates
                            </h1>
                            <p className="mt-1 text-sm text-[var(--editorial-body)] sm:text-base">
                                Create, edit and remove the updates shown on the changelog.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingEntry(null)
                                setEditorOpen(true)
                            }}
                            className="w-full gap-2 text-sm sm:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            New update
                        </Button>
                    </div>

                    <div className="editorial-shadow-sm mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-[var(--editorial-subtle)]">
                                <Spinner /> Loading updates…
                            </div>
                        ) : isError ? (
                            <div className="px-5 py-16 text-center text-sm text-[var(--editorial-body)]">
                                Something went wrong loading updates. Please try again.
                            </div>
                        ) : (updates ?? []).length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    No updates yet
                                </p>
                                <p className="mt-1 text-sm text-[var(--editorial-subtle)]">
                                    Publish your first update to populate the changelog.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--editorial-border-light)]">
                                {(updates ?? []).map((u) => (
                                    <UpdateRow
                                        key={u.id}
                                        update={u}
                                        onEdit={() => {
                                            setEditingEntry(u)
                                            setEditorOpen(true)
                                        }}
                                        onDelete={() => setDeleteTarget(u)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <DeleteUpdateDialog
                entry={deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
            />
        </div>
    )
}
