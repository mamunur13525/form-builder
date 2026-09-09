import { useState } from "react"
import type { ReactNode } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Crown,
    FilePlus2,
    FileText,
    LogOut,
    MailX,
    Pencil,
    RefreshCw,
    Send,
    Settings2,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserMinus,
    UserPlus,
    XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    WORKSPACE_ROLE_LABELS,
    type WorkspaceActivity,
    type WorkspaceActivityType,
} from "@/entities/workspace/model/types"
import { useWorkspaceActivity } from "@/features/workspaces/hooks/useWorkspaces"

interface ActivityFeedProps {
    workspaceId: string
}

const ACTIVITY_ICONS: Record<WorkspaceActivityType, LucideIcon> = {
    "workspace.created": Sparkles,
    "workspace.updated": Pencil,
    "workspace.settings_updated": Settings2,
    "member.invited": UserPlus,
    "member.joined": UserPlus,
    "member.removed": UserMinus,
    "member.left": LogOut,
    "member.role_changed": ShieldCheck,
    "invitation.cancelled": MailX,
    "invitation.resent": RefreshCw,
    "invitation.rejected": XCircle,
    "workspace.ownership_transferred": Crown,
    "form.created": FilePlus2,
    "form.published": Send,
    "form.deleted": Trash2,
}

/** Relative time for recent entries, absolute once it stops being useful. */
function formatWhen(value: string): string {
    const then = new Date(value)
    const diffMinutes = Math.round((Date.now() - then.getTime()) / 60000)

    if (diffMinutes < 1) return "just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 60 * 24) return `${Math.round(diffMinutes / 60)}h ago`
    if (diffMinutes < 60 * 24 * 7) return `${Math.round(diffMinutes / (60 * 24))}d ago`

    return then.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

const strong = (value: string): ReactNode => (
    <span className="text-[var(--foreground)]">{value}</span>
)

/**
 * Turns one activity row into a sentence.
 *
 * Kept as a single function rather than per-type components because every line
 * is one sentence — the only variation is which names and `meta` fields get
 * pulled in.
 */
function describe(entry: WorkspaceActivity): ReactNode {
    const actor = entry.actor?.name ?? "Someone"
    const target =
        entry.targetUser?.name ?? entry.targetEmail ?? entry.meta.newOwnerName ?? "a member"
    // Deleted forms keep their title in `meta`, which is the whole reason it is
    // stored there rather than resolved from the form id at read time.
    const formName = entry.meta.formTitle ?? "a form"

    switch (entry.type) {
        case "workspace.created":
            return <>{strong(actor)} created this workspace</>

        case "workspace.updated": {
            const renamed = entry.meta.newName && entry.meta.newName !== entry.meta.previousName
            const reslugged = entry.meta.newSlug && entry.meta.newSlug !== entry.meta.previousSlug

            if (renamed && reslugged) {
                return (
                    <>
                        {strong(actor)} renamed the workspace to{" "}
                        {strong(entry.meta.newName!)} and moved it to{" "}
                        {strong(`/${entry.meta.newSlug!}`)}
                    </>
                )
            }
            if (renamed) {
                return (
                    <>
                        {strong(actor)} renamed the workspace from{" "}
                        {entry.meta.previousName} to {strong(entry.meta.newName!)}
                    </>
                )
            }
            if (reslugged) {
                return (
                    <>
                        {strong(actor)} changed the workspace URL to{" "}
                        {strong(`/${entry.meta.newSlug!}`)}
                    </>
                )
            }
            return <>{strong(actor)} updated the workspace details</>
        }

        case "workspace.settings_updated":
            return (
                <>
                    {strong(actor)} updated workspace settings
                    {entry.meta.changedFields?.length
                        ? ` — ${entry.meta.changedFields.join(", ")}`
                        : ""}
                </>
            )

        case "member.invited":
            return (
                <>
                    {strong(actor)} invited {strong(target)}
                    {entry.meta.role
                        ? ` as ${WORKSPACE_ROLE_LABELS[entry.meta.role].toLowerCase()}`
                        : ""}
                </>
            )

        case "member.joined":
            return <>{strong(target)} joined the workspace</>

        case "member.removed":
            return (
                <>
                    {strong(actor)} removed {strong(target)}
                </>
            )

        case "member.left":
            return <>{strong(actor)} left the workspace</>

        case "member.role_changed":
            return (
                <>
                    {strong(actor)} changed {strong(target)} from{" "}
                    {entry.meta.fromRole
                        ? WORKSPACE_ROLE_LABELS[entry.meta.fromRole].toLowerCase()
                        : "their role"}{" "}
                    to{" "}
                    {strong(
                        entry.meta.toRole
                            ? WORKSPACE_ROLE_LABELS[entry.meta.toRole].toLowerCase()
                            : "a new role",
                    )}
                </>
            )

        case "invitation.cancelled":
            return (
                <>
                    {strong(actor)} cancelled the invitation to {strong(target)}
                </>
            )

        case "invitation.resent":
            return (
                <>
                    {strong(actor)} resent the invitation to {strong(target)}
                </>
            )

        case "invitation.rejected":
            return <>{strong(target)} declined the invitation</>

        case "workspace.ownership_transferred":
            return (
                <>
                    {strong(entry.meta.previousOwnerName ?? actor)} transferred ownership
                    to {strong(entry.meta.newOwnerName ?? target)}
                </>
            )

        case "form.created":
            return entry.meta.duplicatedFrom ? (
                <>
                    {strong(actor)} duplicated a form as {strong(formName)}
                </>
            ) : (
                <>
                    {strong(actor)} created {strong(formName)}
                </>
            )

        case "form.published":
            return (
                <>
                    {strong(actor)} published {strong(formName)}
                </>
            )

        case "form.deleted":
            return (
                <>
                    {strong(actor)} deleted {strong(formName)}
                </>
            )

        default:
            return <>{strong(actor)} made a change</>
    }
}

/**
 * Append-only audit trail for the workspace: joins, removals, role changes,
 * settings edits, ownership transfers.
 *
 * Paginated rather than infinite-scrolled — an audit log is something people
 * scan for a specific event, and page numbers make it easy to say where you saw
 * something.
 */
export function ActivityFeed({ workspaceId }: ActivityFeedProps) {
    const [page, setPage] = useState(1)
    const { data, isLoading, isFetching } = useWorkspaceActivity(workspaceId, page)

    const items = data?.items ?? []
    const totalPages = data?.meta.totalPages ?? 1

    return (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8">
            <h2 className="font-display text-2xl text-[var(--foreground)]">Activity</h2>
            <p className="mt-1 text-sm text-[var(--editorial-body)]">
                Everything that has happened in this workspace, newest first.
            </p>

            {isLoading && (
                <div className="mt-8 space-y-3">
                    {[0, 1, 2, 3].map((row) => (
                        <div
                            key={row}
                            className="h-14 animate-pulse rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)]"
                        />
                    ))}
                </div>
            )}

            {!isLoading && items.length === 0 && (
                <div className="mt-8 rounded-[18px] border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] p-10 text-center">
                    <p className="text-sm text-[var(--editorial-body)]">
                        Nothing has happened here yet.
                    </p>
                </div>
            )}

            {!isLoading && items.length > 0 && (
                <ol className="mt-8 space-y-1">
                    {items.map((entry) => {
                        const Icon = ACTIVITY_ICONS[entry.type] ?? Sparkles

                        return (
                            <li
                                key={entry.id}
                                className="flex items-start gap-4 rounded-[18px] px-3 py-3 transition-colors hover:bg-[var(--secondary)]"
                            >
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-body)]">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-6 text-[var(--editorial-body)]">
                                        {describe(entry)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[var(--editorial-subtle)]">
                                        {formatWhen(entry.createdAt)}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            )}

            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-[var(--editorial-border-light)] pt-6">
                    <p className="text-xs text-[var(--editorial-subtle)]">
                        Page {data?.meta.page ?? page} of {totalPages}
                        {data?.meta.total ? ` · ${data.meta.total} events` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page <= 1 || isFetching}
                            className="h-11 rounded-[16px] border-[var(--border)] px-4"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Newer
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setPage((current) => Math.min(totalPages, current + 1))
                            }
                            disabled={page >= totalPages || isFetching}
                            className="h-11 rounded-[16px] border-[var(--border)] px-4"
                        >
                            Older
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </section>
    )
}
