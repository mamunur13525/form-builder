import { useState } from "react"
import { Check, Copy, Loader2 } from "lucide-react"
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
    ASSIGNABLE_WORKSPACE_ROLES,
    WORKSPACE_ROLE_DESCRIPTIONS,
    WORKSPACE_ROLE_LABELS,
    type AssignableWorkspaceRole,
} from "@/entities/workspace/model/types"
import { useInviteMember } from "@/features/workspaces/hooks/useWorkspaces"
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
 * Invite somebody by email.
 *
 * No mailer is wired on the server yet, so the invite link comes back in the
 * response and is shown here to copy. Once SMTP is live this panel can be
 * dropped without touching anything else.
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
    const [inviteUrl, setInviteUrl] = useState("")
    const [copied, setCopied] = useState(false)

    const inviteMember = useInviteMember(workspaceId)

    /**
     * Resets on the way out so reopening starts clean — including the copied
     * link, which should not linger for the next invite. Done in the handler
     * rather than an effect because every close path routes through here.
     */
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setEmail("")
            setRole(defaultRole)
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
            { email: email.trim().toLowerCase(), role },
            {
                onSuccess: (invitation) => {
                    // Keep the dialog open when there is a link worth copying.
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
            className="editorial max-w-lg rounded-[24px] border-[var(--border)] bg-[var(--card)] p-8"
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

                {/* Shown after a successful invite, while no mailer is wired. */}
                {inviteUrl && (
                    <div className="rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-5">
                        <p className="text-sm text-[var(--foreground)]">
                            Invitation created
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            Send this link to your teammate — email delivery is not
                            configured yet.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 truncate rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-xs text-[var(--editorial-body)]">
                                {inviteUrl}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCopy}
                                className="h-11 shrink-0 rounded-[16px] border-[var(--border)] px-4"
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
                    className="h-11 rounded-[16px] border-[var(--border)] px-6"
                >
                    {inviteUrl ? "Done" : "Cancel"}
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
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
