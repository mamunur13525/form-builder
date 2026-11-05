import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    WORKSPACE_ROLE_LABELS,
    type Workspace,
    type WorkspaceMember,
} from "@/entities/workspace/model/types"
import { useTransferOwnership } from "@/features/workspaces/hooks/useWorkspaces"

interface TransferOwnershipDialogProps {
    workspace: Workspace
    members: WorkspaceMember[]
    currentUserId: string | undefined
    open: boolean
    onOpenChange: (open: boolean) => void
}

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

/**
 * Hand the workspace to another active member.
 *
 * Ownership is a one-way door for the person doing it — they drop to admin and
 * cannot take it back unilaterally — so this asks for the workspace name to be
 * typed out rather than relying on a single click.
 */
export function TransferOwnershipDialog({
    workspace,
    members,
    currentUserId,
    open,
    onOpenChange,
}: TransferOwnershipDialogProps) {
    const [memberId, setMemberId] = useState("")
    const [confirmation, setConfirmation] = useState("")

    const transferOwnership = useTransferOwnership(workspace.id)

    /**
     * Clears the picker and the typed confirmation on the way out, so a
     * half-finished transfer is never pre-filled the next time this opens.
     */
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setMemberId("")
            setConfirmation("")
        }
        onOpenChange(next)
    }

    // Only active members can take ownership, and never the current owner.
    const candidates = members.filter(
        (member) =>
            member.status === "active" &&
            !member.isOwner &&
            member.user?.id !== currentUserId,
    )

    const selected = candidates.find((member) => member.id === memberId)
    const canSubmit =
        Boolean(memberId) &&
        confirmation.trim() === workspace.name &&
        !transferOwnership.isPending

    const handleSubmit = () => {
        if (!canSubmit) return

        transferOwnership.mutate(memberId, {
            onSuccess: () => handleOpenChange(false),
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            className="editorial max-w-lg rounded-[24px] border-[var(--border)] bg-[var(--card)] p-8"
        >
            <DialogHeader>
                <DialogTitle className="font-display text-2xl text-[var(--foreground)]">
                    Transfer ownership
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-6 text-[var(--editorial-body)]">
                    The new owner gets full control, including the ability to delete this
                    workspace. You will keep access as an admin.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                {candidates.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] p-8 text-center">
                        <p className="text-sm text-[var(--editorial-body)]">
                            There is nobody to transfer to yet. Invite a member and wait
                            for them to accept first.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label className="text-sm text-[var(--editorial-body)]">
                                New owner
                            </Label>
                            <Select
                                value={memberId}
                                onValueChange={(value) => setMemberId(value ?? "")}
                            >
                                <SelectTrigger className={inputClass + " w-full"}>
                                    <SelectValue placeholder="Choose a member" />
                                </SelectTrigger>
                                <SelectContent className="editorial">
                                    {candidates.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <span className="flex flex-col items-start">
                                                <span className="text-sm text-[var(--foreground)]">
                                                    {member.user?.name || member.email}
                                                </span>
                                                <span className="text-xs text-[var(--editorial-subtle)]">
                                                    Currently{" "}
                                                    {WORKSPACE_ROLE_LABELS[member.role]}
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 rounded-[18px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/8 p-5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--destructive)]" />
                            <p className="text-xs leading-5 text-[var(--editorial-body)]">
                                This takes effect immediately and cannot be undone by you
                                alone —{" "}
                                {selected
                                    ? selected.user?.name || selected.email
                                    : "the new owner"}{" "}
                                would have to transfer it back.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="transfer-confirm"
                                className="text-sm text-[var(--editorial-body)]"
                            >
                                Type{" "}
                                <span className="text-[var(--foreground)]">
                                    {workspace.name}
                                </span>{" "}
                                to confirm
                            </Label>
                            <Input
                                id="transfer-confirm"
                                value={confirmation}
                                onChange={(event) => setConfirmation(event.target.value)}
                                placeholder={workspace.name}
                                className={inputClass}
                                autoComplete="off"
                            />
                        </div>
                    </>
                )}
            </div>

            <DialogFooter className="mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="h-11 rounded-[16px] border-[var(--border)] px-6"
                >
                    Cancel
                </Button>
                {candidates.length > 0 && (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="editorial-transition h-11 rounded-[16px] bg-[var(--destructive)] px-6 text-sm font-medium text-white hover:opacity-90 active:scale-[.98]"
                    >
                        {transferOwnership.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Transferring…
                            </>
                        ) : (
                            "Transfer ownership"
                        )}
                    </Button>
                )}
            </DialogFooter>
        </Dialog>
    )
}
