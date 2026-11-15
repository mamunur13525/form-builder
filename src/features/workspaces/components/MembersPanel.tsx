import { useState } from "react"
import { Send, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ASSIGNABLE_WORKSPACE_ROLES,
    hasWorkspacePermission,
    type AssignableWorkspaceRole,
    type Workspace,
    type WorkspaceMember,
} from "@/entities/workspace/model/types"
import {
    useResendInvitation,
    useUpdateMemberRole,
    useWorkspaceMembers,
} from "@/features/workspaces/hooks/useWorkspaces"
import { MemberRow } from "./MemberRow"
import { MembersPanelDialogs } from "./MembersPanelDialogs"

interface MembersPanelProps {
    workspace: Workspace
    /** The signed-in user's id, used to mark their own row and hide self-actions. */
    currentUserId: string | undefined
}

/** Rank used to decide whether the current user may act on a row. */
const ROLE_RANK: Record<string, number> = {
    viewer: 1,
    member: 2,
    editor: 2,
    admin: 3,
    owner: 4,
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
    const resendInvitation = useResendInvitation(workspace.id)

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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
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
                        className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
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
                            className="animate-in fade-in duration-300"
                            style={{
                                animationDelay: `${row * 80}ms`,
                                animationFillMode: "backwards",
                            }}
                        >
                            <Skeleton className="h-[72px] rounded-lg border border-[var(--editorial-border-light)]" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty — only reachable for a workspace whose owner has left, but handled. */}
            {!isLoading && members.length === 0 && (
                <div className="mt-6 rounded-lg border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] p-10 text-center">
                    <p className="text-sm text-[var(--editorial-body)]">
                        No members yet. Invite someone to get started.
                    </p>
                </div>
            )}

            {/* Rows */}
            {!isLoading && members.length > 0 && (
                <ul className="mt-6 divide-y divide-[var(--editorial-border-light)]">
                    {members.map((member) => {
                        const actionable = canActOn(member)
                        const showMenu =
                            member.status === "invited"
                                ? canManageInvitations
                                : actionable && (canRemove || canChangeRole)

                        return (
                            <MemberRow
                                key={member.id}
                                member={member}
                                currentUserId={currentUserId}
                                showMenu={showMenu}
                                canChangeRole={canChangeRole}
                                canRemove={canRemove}
                                assignableRoles={assignableRoles}
                                onRoleChange={(memberId, role) =>
                                    updateRole.mutate({ memberId, role })
                                }
                                onRemove={setPendingRemoval}
                                onResend={(memberId) => resendInvitation.mutate(memberId)}
                                onCancel={setPendingCancel}
                            />
                        )
                    })}
                </ul>
            )}

            {/* Ownership — owner only, and only when there is somebody to hand it to. */}
            {canTransfer && activeCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-6">
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
                        className="h-11 shrink-0 rounded-lg border-[var(--border)] px-5"
                    >
                        <Send className="h-4 w-4" />
                        Transfer
                    </Button>
                </div>
            )}

            <MembersPanelDialogs
                workspace={workspace}
                members={members}
                currentUserId={currentUserId}
                assignableRoles={assignableRoles}
                inviteOpen={inviteOpen}
                onInviteOpenChange={setInviteOpen}
                transferOpen={transferOpen}
                onTransferOpenChange={setTransferOpen}
                pendingRemoval={pendingRemoval}
                onPendingRemovalChange={setPendingRemoval}
                pendingCancel={pendingCancel}
                onPendingCancelChange={setPendingCancel}
            />
        </div>
    )
}
