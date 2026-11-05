import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Loader2, LogOut, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    hasWorkspacePermission,
    type WorkspaceDetail,
} from "@/entities/workspace/model/types"
import {
    useDeleteWorkspace,
    useLeaveWorkspace,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ROUTES } from "@/shared/constants/routes"
import { ConfirmDialog } from "./ConfirmDialog"

interface DangerZoneProps {
    workspace: WorkspaceDetail
    /** Number of active members, used to explain what leaving would do. */
    activeMemberCount: number
}

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

/**
 * Leaving and deleting.
 *
 * The owner cannot leave — the server rejects it, so rather than showing a
 * button that always fails, the row explains the two ways out (transfer or
 * delete).
 */
export function DangerZone({ workspace, activeMemberCount }: DangerZoneProps) {
    const navigate = useNavigate()

    const leaveWorkspace = useLeaveWorkspace()
    const deleteWorkspace = useDeleteWorkspace()

    const [leaveOpen, setLeaveOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [confirmation, setConfirmation] = useState("")

    /**
     * Clears the typed name whenever the delete dialog closes, so a previous
     * attempt never leaves the confirm button already enabled.
     */
    const handleDeleteOpenChange = (next: boolean) => {
        if (!next) setConfirmation("")
        setDeleteOpen(next)
    }

    const isOwner = workspace.currentUserRole === "owner"
    const canDelete = hasWorkspacePermission(workspace, "workspace:delete")

    const goHome = () => navigate(ROUTES.DASHBOARD)

    return (
        <section className="rounded-[24px] border border-[var(--destructive)]/25 bg-[var(--card)] p-8">
            <h2 className="font-display text-2xl text-[var(--foreground)]">
                Danger zone
            </h2>
            <p className="mt-1 text-sm text-[var(--editorial-body)]">
                These actions affect everyone in the workspace.
            </p>

            <div className="mt-8 space-y-4">
                {/* Leave */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-6">
                    <div className="min-w-0">
                        <p className="text-sm text-[var(--foreground)]">
                            Leave this workspace
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            {isOwner
                                ? "Owners cannot leave. Transfer ownership to someone else first, or delete the workspace."
                                : "You will lose access to its forms and settings. Someone with permission would have to invite you back."}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLeaveOpen(true)}
                        disabled={isOwner}
                        className="h-11 shrink-0 rounded-[16px] border-[var(--border)] px-5"
                    >
                        <LogOut className="h-4 w-4" />
                        Leave
                    </Button>
                </div>

                {/* Delete — owner only */}
                {canDelete && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/8 p-6">
                        <div className="min-w-0">
                            <p className="text-sm text-[var(--foreground)]">
                                Delete this workspace
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                                Permanently removes the workspace, its members,
                                invitations and activity history. This cannot be undone.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setDeleteOpen(true)}
                            className="editorial-transition h-11 shrink-0 rounded-[16px] bg-[var(--destructive)] px-5 text-sm font-medium text-white hover:opacity-90 active:scale-[.98]"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete workspace
                        </Button>
                    </div>
                )}
            </div>

            {/* Leave confirmation */}
            <ConfirmDialog
                open={leaveOpen}
                onOpenChange={setLeaveOpen}
                title="Leave this workspace?"
                description={
                    <>
                        You will lose access to{" "}
                        <strong className="text-[var(--foreground)]">
                            {workspace.name}
                        </strong>{" "}
                        immediately.
                        {activeMemberCount > 1
                            ? " The workspace stays with the other members."
                            : ""}
                    </>
                }
                confirmLabel="Leave workspace"
                destructive
                isPending={leaveWorkspace.isPending}
                onConfirm={() =>
                    leaveWorkspace.mutate(workspace.id, {
                        onSuccess: () => {
                            setLeaveOpen(false)
                            goHome()
                        },
                    })
                }
            />

            {/* Delete confirmation — typed, because it destroys other people's data */}
            <Dialog
                open={deleteOpen}
                onOpenChange={handleDeleteOpenChange}
                className="editorial max-w-lg rounded-[24px] border-[var(--border)] bg-[var(--card)] p-8"
            >
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-[var(--foreground)]">
                        Delete this workspace?
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm leading-6 text-[var(--editorial-body)]">
                        This removes the workspace for all{" "}
                        {activeMemberCount === 1
                            ? "of its members"
                            : `${activeMemberCount} of its members`}
                        , along with every invitation and its activity history.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex gap-3 rounded-[18px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/8 p-5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" />
                        <p className="text-xs leading-5 text-[var(--editorial-body)]">
                            There is no undo and no export. If you only want to step away,
                            transfer ownership and leave instead.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="delete-confirm"
                            className="text-sm text-[var(--editorial-body)]"
                        >
                            Type{" "}
                            <span className="text-[var(--foreground)]">
                                {workspace.name}
                            </span>{" "}
                            to confirm
                        </Label>
                        <Input
                            id="delete-confirm"
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            placeholder={workspace.name}
                            className={inputClass}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDeleteOpenChange(false)}
                        className="h-11 rounded-[16px] border-[var(--border)] px-6"
                    >
                        Keep workspace
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            confirmation.trim() !== workspace.name ||
                            deleteWorkspace.isPending
                        }
                        onClick={() =>
                            deleteWorkspace.mutate(workspace.id, {
                                onSuccess: () => {
                                    handleDeleteOpenChange(false)
                                    goHome()
                                },
                            })
                        }
                        className="editorial-transition h-11 rounded-[16px] bg-[var(--destructive)] px-6 text-sm font-medium text-white hover:opacity-90 active:scale-[.98]"
                    >
                        {deleteWorkspace.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            "Delete permanently"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </section>
    )
}
