import { Loader2, Shield, User, Users } from "lucide-react"
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useFormAccess, useUpdateFormAccess } from "@/features/forms/hooks/useForms"
import { showError, showSuccess } from "@/shared/hooks/useToast"

interface FormAccessDialogProps {
    formId: string
    formTitle: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FormAccessDialog({
    formId,
    formTitle,
    open,
    onOpenChange,
}: FormAccessDialogProps) {
    const { data: accessData, isLoading } = useFormAccess(formId, open)
    const updateAccess = useUpdateFormAccess(formId)

    const handleToggleAccess = (userId: string, currentCanEdit: boolean) => {
        const nextValue = !currentCanEdit
        updateAccess.mutate(
            { userId, canEdit: nextValue },
            {
                onSuccess: () => {
                    showSuccess(
                        nextValue ? "Access granted" : "Access revoked",
                        `Form edit access updated for member.`
                    )
                },
                onError: (err) => {
                    showError("Could not update access", err)
                },
            }
        )
    }

    const members = accessData?.members || []

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            className="editorial max-w-lg rounded-lg border-[var(--border)] bg-[var(--card)] p-8"
        >
            <DialogHeader>
                <div className="flex items-center gap-2 text-sm text-[var(--editorial-subtle)]">
                    <Shield className="h-4 w-4" />
                    <span>Access Control</span>
                </div>
                <DialogTitle className="font-display text-2xl text-[var(--foreground)] mt-1">
                    Manage Access: {formTitle}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-[var(--editorial-body)]">
                    Control which workspace members can edit this form. Workspace Admins always have edit access.
                </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10 text-[var(--editorial-body)] gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading access list…</span>
                    </div>
                ) : members.length === 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 p-6 text-center">
                        <Users className="mx-auto h-8 w-8 text-[var(--editorial-subtle)]" />
                        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">No other members</p>
                        <p className="mt-1 text-xs text-[var(--editorial-body)]">
                            Invite team members to your workspace to grant form permissions.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                        {members.map((member) => {
                            const isAdmin = member.role === "admin"
                            const isViewer = member.role === "viewer"
                            const canEditAll = member.canEditAllForms

                            return (
                                <div
                                    key={member.userId}
                                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--secondary)]/20 p-3 hover:bg-[var(--secondary)]/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {member.avatarUrl ? (
                                            <img
                                                src={member.avatarUrl}
                                                alt=""
                                                className="h-9 w-9 shrink-0 rounded-full object-cover border border-[var(--border)]"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)] border border-[var(--border)]">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                                {member.name || member.email}
                                            </p>
                                            <p className="text-xs text-[var(--editorial-subtle)] truncate">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        {isAdmin ? (
                                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                                Admin (Full access)
                                            </Badge>
                                        ) : isViewer ? (
                                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                                Viewer (Read-only)
                                            </Badge>
                                        ) : canEditAll ? (
                                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                                                Edits all forms
                                            </Badge>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-[var(--foreground)]">
                                                    {member.canEdit ? "Can edit" : "View only"}
                                                </span>
                                                <Switch
                                                    checked={member.canEdit}
                                                    disabled={updateAccess.isPending}
                                                    onCheckedChange={() => handleToggleAccess(member.userId, member.canEdit)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <DialogFooter className="mt-8">
                <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                >
                    Done
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
