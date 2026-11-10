import { useState } from "react"
import { Check, Copy, FileText, Loader2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ASSIGNABLE_WORKSPACE_ROLES,
    WORKSPACE_ROLE_DESCRIPTIONS,
    WORKSPACE_ROLE_LABELS,
    type AssignableWorkspaceRole,
} from "@/entities/workspace/model/types"
import { useInviteMember } from "@/features/workspaces/hooks/useWorkspaces"
import { useForms } from "@/features/forms/hooks/useForms"
import { showError, showSuccess } from "@/shared/hooks/useToast"

interface InviteMemberDialogProps {
    workspaceId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Role pre-selected in the picker, from `settings.defaultMemberRole`. */
    defaultRole?: AssignableWorkspaceRole
    /**
     * Roles the current user may grant. An admin cannot mint another admin, so
     * the caller filters the list rather than letting the server reject it.
     */
    assignableRoles?: AssignableWorkspaceRole[]
}

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

/**
 * Invite somebody by email with workspace role and form permissions.
 */
export function InviteMemberDialog({
    workspaceId,
    open,
    onOpenChange,
    defaultRole = "member",
    assignableRoles = ASSIGNABLE_WORKSPACE_ROLES,
}: InviteMemberDialogProps) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<AssignableWorkspaceRole>(defaultRole)
    const [canEditAllForms, setCanEditAllForms] = useState(true)
    const [selectedFormIds, setSelectedFormIds] = useState<string[]>([])
    const [inviteUrl, setInviteUrl] = useState("")
    const [copied, setCopied] = useState(false)

    const inviteMember = useInviteMember(workspaceId)
    const { data: forms = [] } = useForms()

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setEmail("")
            setRole(defaultRole)
            setCanEditAllForms(true)
            setSelectedFormIds([])
            setInviteUrl("")
            setCopied(false)
        }
        onOpenChange(next)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl)
            setCopied(true)
            showSuccess("Invite link copied")
            window.setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            showError("Could not copy the link", error)
        }
    }

    const canSubmit =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !inviteMember.isPending

    const handleSubmit = () => {
        if (!canSubmit) return

        inviteMember.mutate(
            {
                email: email.trim().toLowerCase(),
                role,
                canEditAllForms: role === "member" ? canEditAllForms : undefined,
                preAssignedFormIds: role === "member" && !canEditAllForms ? selectedFormIds : undefined,
            },
            {
                onSuccess: (invitation) => {
                    if (invitation.inviteUrl) {
                        setInviteUrl(invitation.inviteUrl)
                        setEmail("")
                    } else {
                        handleOpenChange(false)
                    }
                },
            },
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            className="editorial max-w-lg rounded-lg border-[var(--border)] bg-[var(--card)] p-8"
        >
            <DialogHeader>
                <DialogTitle className="font-display text-2xl text-[var(--foreground)]">
                    Invite a member
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-[var(--editorial-body)]">
                    They will get a link that stays valid for 7 days. You can resend or
                    cancel it any time before it is accepted.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-sm text-[var(--editorial-body)]">
                        Email address
                    </Label>
                    <Input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="teammate@company.com"
                        className={inputClass}
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm text-[var(--editorial-body)]">Role</Label>
                    <Select
                        value={role}
                        onValueChange={(value) =>
                            setRole(value as AssignableWorkspaceRole)
                        }
                    >
                        <SelectTrigger className={inputClass + " w-full"}>
                            <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent className="editorial">
                            {assignableRoles.map((option) => (
                                <SelectItem key={option} value={option}>
                                    <span className="flex flex-col items-start">
                                        <span className="text-sm text-[var(--foreground)]">
                                            {WORKSPACE_ROLE_LABELS[option]}
                                        </span>
                                        <span className="text-xs text-[var(--editorial-subtle)]">
                                            {WORKSPACE_ROLE_DESCRIPTIONS[option]}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Form permissions for member role */}
                {role === "member" && (
                    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/40 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    Edit all forms
                                </p>
                                <p className="text-xs text-[var(--editorial-body)]">
                                    Allow this member to edit every form in this workspace
                                </p>
                            </div>
                            <Switch
                                checked={canEditAllForms}
                                onCheckedChange={(checked) => setCanEditAllForms(Boolean(checked))}
                            />
                        </div>

                        {!canEditAllForms && (
                            <div className="mt-3 space-y-2.5 border-t border-[var(--border)]/60 pt-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-[var(--foreground)]">
                                        Pre-assigned forms
                                    </p>
                                    <span className="text-xs text-[var(--editorial-subtle)]">
                                        {selectedFormIds.length} of {forms.length} selected
                                    </span>
                                </div>
                                {forms.length === 0 ? (
                                    <p className="text-xs italic text-[var(--editorial-subtle)]">
                                        No forms exist in this workspace yet.
                                    </p>
                                ) : (
                                    <div className="max-h-40 overflow-y-auto space-y-1 rounded border border-[var(--border)]/50 bg-[var(--card)] p-2">
                                        {forms.map((form) => {
                                            const fId = form.id || (form as any)._id
                                            const isSelected = selectedFormIds.includes(fId)
                                            return (
                                                <label
                                                    key={fId}
                                                    className="flex items-center gap-2.5 rounded p-1 hover:bg-[var(--secondary)]/60 cursor-pointer text-xs"
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedFormIds([...selectedFormIds, fId])
                                                            } else {
                                                                setSelectedFormIds(
                                                                    selectedFormIds.filter((id) => id !== fId)
                                                                )
                                                            }
                                                        }}
                                                    />
                                                    <FileText className="h-3.5 w-3.5 text-[var(--editorial-subtle)] shrink-0" />
                                                    <span className="truncate text-[var(--foreground)]">
                                                        {form.title || "Untitled Form"}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Shown after a successful invite, while no mailer is wired. */}
                {inviteUrl && (
                    <div className="rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-5">
                        <p className="text-sm text-[var(--foreground)]">
                            Invitation created
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            Send this link to your teammate — email delivery is not
                            configured yet.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 truncate rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs text-[var(--editorial-body)]">
                                {inviteUrl}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCopy}
                                className="h-11 shrink-0 rounded-lg border-[var(--border)] px-4"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="h-11 rounded-lg border-[var(--border)] px-6"
                >
                    {inviteUrl ? "Done" : "Cancel"}
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                >
                    {inviteMember.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending…
                        </>
                    ) : inviteUrl ? (
                        "Invite another"
                    ) : (
                        "Send invitation"
                    )}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
