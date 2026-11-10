import type {
    AssignableWorkspaceRole,
    Workspace,
    WorkspaceMember,
} from "@/entities/workspace/model/types"
import {
    useCancelInvitation,
    useRemoveMember,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ConfirmDialog } from "./ConfirmDialog"
import { InviteMemberDialog } from "./InviteMemberDialog"
import { TransferOwnershipDialog } from "./TransferOwnershipDialog"

interface MembersPanelDialogsProps {
    workspace: Workspace
    members: WorkspaceMember[]
    currentUserId: string | undefined
    assignableRoles: AssignableWorkspaceRole[]
    inviteOpen: boolean
    onInviteOpenChange: (open: boolean) => void
    transferOpen: boolean
    onTransferOpenChange: (open: boolean) => void
    pendingRemoval: WorkspaceMember | null
    onPendingRemovalChange: (member: WorkspaceMember | null) => void
    pendingCancel: WorkspaceMember | null
    onPendingCancelChange: (member: WorkspaceMember | null) => void
}

/** Invite, transfer-ownership and remove/cancel confirmation dialogs. */
export function MembersPanelDialogs({
    workspace,
    members,
    currentUserId,
    assignableRoles,
    inviteOpen,
    onInviteOpenChange,
    transferOpen,
    onTransferOpenChange,
    pendingRemoval,
    onPendingRemovalChange,
    pendingCancel,
    onPendingCancelChange,
}: MembersPanelDialogsProps) {
    const removeMember = useRemoveMember(workspace.id)
    const cancelInvitation = useCancelInvitation(workspace.id)

    return (
        <>
            <InviteMemberDialog
                workspaceId={workspace.id}
                open={inviteOpen}
                onOpenChange={onInviteOpenChange}
                defaultRole={
                    workspace.settings?.defaultMemberRole === "owner"
                        ? "member"
                        : ((workspace.settings?.defaultMemberRole as AssignableWorkspaceRole) || "member")
                }
                assignableRoles={assignableRoles}
            />

            <TransferOwnershipDialog
                workspace={workspace}
                members={members}
                currentUserId={currentUserId}
                open={transferOpen}
                onOpenChange={onTransferOpenChange}
            />

            <ConfirmDialog
                open={Boolean(pendingRemoval)}
                onOpenChange={(open) => !open && onPendingRemovalChange(null)}
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
                        onSuccess: () => onPendingRemovalChange(null),
                    })
                }}
            />

            <ConfirmDialog
                open={Boolean(pendingCancel)}
                onOpenChange={(open) => !open && onPendingCancelChange(null)}
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
                        onSuccess: () => onPendingCancelChange(null),
                    })
                }}
            />
        </>
    )
}
