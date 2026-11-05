import { useState } from "react"
import {
    Clock,
    Crown,
    MailX,
    MoreHorizontal,
    RefreshCw,
    Send,
    ShieldCheck,
    UserMinus,
    UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
    ASSIGNABLE_WORKSPACE_ROLES,
    WORKSPACE_ROLE_LABELS,
    hasWorkspacePermission,
    type AssignableWorkspaceRole,
    type Workspace,
    type WorkspaceMember,
    type WorkspaceRole,
} from "@/entities/workspace/model/types"
import {
    useCancelInvitation,
    useRemoveMember,
    useResendInvitation,
    useUpdateMemberRole,
    useWorkspaceMembers,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ConfirmDialog } from "./ConfirmDialog"
import { InviteMemberDialog } from "./InviteMemberDialog"
import { TransferOwnershipDialog } from "./TransferOwnershipDialog"

interface MembersPanelProps {
    workspace: Workspace
    /** The signed-in user's id, used to mark their own row and hide self-actions. */
    currentUserId: string | undefined
}

/** Rank used to decide whether the current user may act on a row. */
const ROLE_RANK: Record<WorkspaceRole, number> = {
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4,
}

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
            {WORKSPACE_ROLE_LABELS[role]}
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

/**
 * The workspace member list: active members and pending invitations in one
 * table, with the actions each row supports.
 *
 * Which controls appear is driven entirely by the server-sent `permissions`
 * array plus a rank comparison — the same two rules the API enforces — so the
 * UI never offers an action that would come back a 403.
 */
export function MembersPanel({ workspace, currentUserId }: MembersPanelProps) {
    const { data: members = [], isLoading } = useWorkspaceMembers(workspace.id)

    const updateRole = useUpdateMemberRole(workspace.id)
    const removeMember = useRemoveMember(workspace.id)
    const resendInvitation = useResendInvitation(workspace.id)
    const cancelInvitation = useCancelInvitation(workspace.id)

    const [inviteOpen, setInviteOpen] = useState(false)
    const [transferOpen, setTransferOpen] = useState(false)
    const [pendingRemoval, setPendingRemoval] = useState<WorkspaceMember | null>(null)
    const [pendingCancel, setPendingCancel] = useState<WorkspaceMember | null>(null)

    const canInvite = hasWorkspacePermission(workspace, "member:invite")
    const canRemove = hasWorkspacePermission(workspace, "member:remove")
    const canChangeRole = hasWorkspacePermission(workspace, "member:role-change")
    const canManageInvitations = hasWorkspacePermission(workspace, "invitation:manage")
    const canTransfer = hasWorkspacePermission(workspace, "ownership:transfer")

    const myRole = workspace.currentUserRole
    const myRank = myRole ? ROLE_RANK[myRole] : 0

    /** Mirrors the server's `assertCanActOnMember`: never self, never the owner, must outrank. */
    const canActOn = (member: WorkspaceMember): boolean => {
        if (member.status !== "active") return false
        if (member.isOwner) return false
        if (member.user?.id === currentUserId) return false
        return myRank > ROLE_RANK[member.role]
    }

    /** Mirrors `assertCanAssignRole`: only the owner may grant a peer-level role. */
    const assignableRoles: AssignableWorkspaceRole[] =
        myRole === "owner"
            ? ASSIGNABLE_WORKSPACE_ROLES
            : ASSIGNABLE_WORKSPACE_ROLES.filter((role) => ROLE_RANK[role] < myRank)

    const activeCount = members.filter((member) => member.status === "active").length
    const invitedCount = members.length - activeCount

    return (
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-2xl text-[var(--foreground)]">
                        Members
                    </h2>
                    <p className="mt-1 text-sm text-[var(--editorial-body)]">
                        {activeCount} {activeCount === 1 ? "member" : "members"}
                        {invitedCount > 0 && ` · ${invitedCount} pending`}
                    </p>
                </div>

                {canInvite && (
                    <Button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                    >
                        <UserPlus className="h-4 w-4" />
                        Invite member
                    </Button>
                )}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-6 space-y-3">
                    {[0, 1, 2].map((row) => (
                        <div
                            key={row}
                            className="h-[72px] animate-pulse rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)]"
                        />
                    ))}
                </div>
            )}

            {/* Empty — only reachable for a workspace whose owner has left, but handled. */}
            {!isLoading && members.length === 0 && (
                <div className="mt-6 rounded-[18px] border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] p-10 text-center">
                    <p className="text-sm text-[var(--editorial-body)]">
                        No members yet. Invite someone to get started.
                    </p>
                </div>
            )}

            {/* Rows */}
            {!isLoading && members.length > 0 && (
                <ul className="mt-6 divide-y divide-[var(--editorial-border-light)]">
                    {members.map((member) => {
                        const displayName =
                            member.user?.name || member.email || "Unknown member"
                        const isMe = member.user?.id === currentUserId
                        const actionable = canActOn(member)
                        const showMenu =
                            member.status === "invited"
                                ? canManageInvitations
                                : actionable && (canRemove || canChangeRole)

                        return (
                            <li
                                key={member.id}
                                className="flex flex-wrap items-center gap-4 py-4"
                            >
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
                                                className="editorial-transition flex h-11 w-11 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)]"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={8}
                                                className="editorial w-[15rem] rounded-[18px] border border-[var(--border)] bg-[var(--popover)] p-2"
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
                                                                                className="rounded-[12px] px-3 py-2.5"
                                                                                disabled={
                                                                                    role ===
                                                                                    member.role
                                                                                }
                                                                                onClick={() =>
                                                                                    updateRole.mutate(
                                                                                        {
                                                                                            memberId:
                                                                                                member.id,
                                                                                            role,
                                                                                        },
                                                                                    )
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
                                                                    className="rounded-[12px] px-3 py-2.5"
                                                                    onClick={() =>
                                                                        setPendingRemoval(
                                                                            member,
                                                                        )
                                                                    }
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
                                                            className="rounded-[12px] px-3 py-2.5"
                                                            onClick={() =>
                                                                resendInvitation.mutate(
                                                                    member.id,
                                                                )
                                                            }
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                            Resend invitation
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            className="rounded-[12px] px-3 py-2.5"
                                                            onClick={() =>
                                                                setPendingCancel(member)
                                                            }
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
                    })}
                </ul>
            )}

            {/* Ownership — owner only, and only when there is somebody to hand it to. */}
            {canTransfer && activeCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-6">
                    <div>
                        <p className="text-sm text-[var(--foreground)]">
                            Transfer ownership
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            Hand this workspace to another member. You will stay on as an
                            admin.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTransferOpen(true)}
                        className="h-11 shrink-0 rounded-[16px] border-[var(--border)] px-5"
                    >
                        <Send className="h-4 w-4" />
                        Transfer
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <InviteMemberDialog
                workspaceId={workspace.id}
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                defaultRole={
                    workspace.settings.defaultMemberRole === "owner"
                        ? "member"
                        : (workspace.settings.defaultMemberRole as AssignableWorkspaceRole)
                }
                assignableRoles={assignableRoles}
            />

            <TransferOwnershipDialog
                workspace={workspace}
                members={members}
                currentUserId={currentUserId}
                open={transferOpen}
                onOpenChange={setTransferOpen}
            />

            <ConfirmDialog
                open={Boolean(pendingRemoval)}
                onOpenChange={(open) => !open && setPendingRemoval(null)}
                title="Remove this member?"
                description={
                    <>
                        <strong className="text-[var(--foreground)]">
                            {pendingRemoval?.user?.name || pendingRemoval?.email}
                        </strong>{" "}
                        will lose access to this workspace immediately. You can invite
                        them again later.
                    </>
                }
                confirmLabel="Remove member"
                destructive
                isPending={removeMember.isPending}
                onConfirm={() => {
                    if (!pendingRemoval) return
                    removeMember.mutate(pendingRemoval.id, {
                        onSuccess: () => setPendingRemoval(null),
                    })
                }}
            />

            <ConfirmDialog
                open={Boolean(pendingCancel)}
                onOpenChange={(open) => !open && setPendingCancel(null)}
                title="Cancel this invitation?"
                description={
                    <>
                        The link sent to{" "}
                        <strong className="text-[var(--foreground)]">
                            {pendingCancel?.email}
                        </strong>{" "}
                        will stop working. You can send a new invitation any time.
                    </>
                }
                confirmLabel="Cancel invitation"
                cancelLabel="Keep it"
                destructive
                isPending={cancelInvitation.isPending}
                onConfirm={() => {
                    if (!pendingCancel) return
                    cancelInvitation.mutate(pendingCancel.id, {
                        onSuccess: () => setPendingCancel(null),
                    })
                }}
            />
        </div>
    )
}
