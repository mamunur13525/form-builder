import {
    Clock,
    Crown,
    MailX,
    MoreHorizontal,
    RefreshCw,
    ShieldCheck,
    UserMinus,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
    WORKSPACE_ROLE_LABELS,
    type AssignableWorkspaceRole,
    type WorkspaceMember,
    type WorkspaceRole,
} from "@/entities/workspace/model/types"

function initialsOf(value: string): string {
    if (!value.trim()) return "?"
    return value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
}

function formatDate(value: string | null): string {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

/**
 * Whether a date has already passed. Lives at module scope rather than inline so
 * reading the clock happens outside the render body.
 */
function isPastDate(value: string | null): boolean {
    if (!value) return false
    return new Date(value).getTime() < Date.now()
}

/** Role pill. Owner gets the one accent in the row; the rest stay neutral. */
function RoleBadge({ role }: { role: WorkspaceRole }) {
    const label = WORKSPACE_ROLE_LABELS[role] ?? ((role as string) === "editor" ? "Editor" : (role || "Member"))
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                role === "owner"
                    ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] text-[var(--primary)]"
                    : "border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-body)]",
            )}
        >
            {role === "owner" && <Crown className="h-3 w-3" />}
            {label}
        </span>
    )
}

/** Status pill — the `Active / Invited` distinction from the members list. */
function StatusBadge({ member }: { member: WorkspaceMember }) {
    if (member.status === "active") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] px-3 py-1 text-xs text-[var(--editorial-body)]">
                Active
            </span>
        )
    }

    const isExpired = isPastDate(member.expiresAt)

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                isExpired
                    ? "border-[var(--destructive)]/30 bg-[var(--destructive)]/8 text-[var(--destructive)]"
                    : "border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-subtle)]",
            )}
        >
            <Clock className="h-3 w-3" />
            {isExpired ? "Expired" : "Invited"}
        </span>
    )
}

interface MemberRowProps {
    member: WorkspaceMember
    currentUserId: string | undefined
    showMenu: boolean
    canChangeRole: boolean
    canRemove: boolean
    assignableRoles: AssignableWorkspaceRole[]
    onRoleChange: (memberId: string, role: AssignableWorkspaceRole) => void
    onRemove: (member: WorkspaceMember) => void
    onResend: (memberId: string) => void
    onCancel: (member: WorkspaceMember) => void
}

/** One member row: identity, badges and the action menu. */
export function MemberRow({
    member,
    currentUserId,
    showMenu,
    canChangeRole,
    canRemove,
    assignableRoles,
    onRoleChange,
    onRemove,
    onResend,
    onCancel,
}: MemberRowProps) {
    const displayName =
        member.user?.name || member.email || "Unknown member"
    const isMe = member.user?.id === currentUserId

    return (
        <li className="flex flex-wrap items-center gap-4 py-4">
            {/* Identity */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {member.user?.avatarUrl ? (
                    <img
                        src={member.user.avatarUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full border border-[var(--editorial-border-light)] object-cover"
                    />
                ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-sm font-semibold text-[var(--editorial-body)]">
                        {initialsOf(displayName)}
                    </span>
                )}
                <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--foreground)]">
                        {displayName}
                        {isMe && (
                            <span className="ml-2 text-xs text-[var(--editorial-subtle)]">
                                You
                            </span>
                        )}
                    </p>
                    <p className="truncate text-xs text-[var(--editorial-subtle)]">
                        {member.email || "No email on file"}
                    </p>
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3">
                <StatusBadge member={member} />
                <RoleBadge role={member.role} />
                <span className="hidden text-xs text-[var(--editorial-subtle)] sm:block">
                    {member.status === "active"
                        ? `Joined ${formatDate(member.joinedAt)}`
                        : `Expires ${formatDate(member.expiresAt)}`}
                </span>

                {/* Row actions */}
                {showMenu ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label={`Actions for ${displayName}`}
                            className="editorial-transition flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)]"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="editorial w-[15rem] rounded-lg border border-[var(--border)] bg-[var(--popover)] p-2"
                        >
                            {member.status === "active" ? (
                                <>
                                    {canChangeRole &&
                                        assignableRoles.length > 0 && (
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-wide text-[var(--editorial-subtle)]">
                                                    Change role
                                                </DropdownMenuLabel>
                                                {assignableRoles.map(
                                                    (role) => (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            className="rounded-lg px-3 py-2.5"
                                                            disabled={
                                                                role ===
                                                                member.role
                                                            }
                                                            onClick={() =>
                                                                onRoleChange(member.id, role)
                                                            }
                                                        >
                                                            <ShieldCheck className="h-4 w-4" />
                                                            {
                                                                WORKSPACE_ROLE_LABELS[
                                                                    role
                                                                ]
                                                            }
                                                        </DropdownMenuItem>
                                                    ),
                                                )}
                                            </DropdownMenuGroup>
                                        )}

                                    {canRemove && (
                                        <>
                                            <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                className="rounded-lg px-3 py-2.5"
                                                onClick={() => onRemove(member)}
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                Remove from workspace
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        className="rounded-lg px-3 py-2.5"
                                        onClick={() => onResend(member.id)}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Resend invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="rounded-lg px-3 py-2.5"
                                        onClick={() => onCancel(member)}
                                    >
                                        <MailX className="h-4 w-4" />
                                        Cancel invitation
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Keeps every row the same height whether or not
                    // it has a menu.
                    <span className="h-11 w-11" aria-hidden="true" />
                )}
            </div>
        </li>
    )
}
