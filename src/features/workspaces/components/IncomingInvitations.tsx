import { Check, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WORKSPACE_ROLE_LABELS } from "@/entities/workspace/model/types"
import {
    useAcceptInvitation,
    useIncomingInvitations,
    useRejectInvitation,
} from "@/features/workspaces/hooks/useWorkspaces"

/**
 * Invitations addressed to the signed-in user.
 *
 * The invite link is the main path in, but no mailer is wired yet — and even
 * once it is, links get lost. This lists anything outstanding so a user can join
 * without needing the original email. Renders nothing when there is nothing
 * pending, so it can be dropped in above any page.
 */
export function IncomingInvitations() {
    const { data: invitations = [], isLoading } = useIncomingInvitations()

    const acceptInvitation = useAcceptInvitation()
    const rejectInvitation = useRejectInvitation()

    const pending = invitations.filter(
        (invitation) => invitation.status === "pending" && !invitation.isExpired,
    )

    if (isLoading || pending.length === 0) return null

    const isBusy = acceptInvitation.isPending || rejectInvitation.isPending

    return (
        <section className="rounded-[24px] border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] p-8">
            <h2 className="font-display text-2xl text-[var(--foreground)]">
                {pending.length === 1
                    ? "You have an invitation"
                    : `You have ${pending.length} invitations`}
            </h2>
            <p className="mt-1 text-sm text-[var(--editorial-body)]">
                Accept to join, or decline to clear it.
            </p>

            <ul className="mt-6 space-y-3">
                {pending.map((invitation) => (
                    <li
                        key={invitation.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-5"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            {invitation.workspace?.logoUrl ? (
                                <img
                                    src={invitation.workspace.logoUrl}
                                    alt=""
                                    className="h-10 w-10 shrink-0 rounded-[14px] border border-[var(--editorial-border-light)] object-cover"
                                />
                            ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-sm font-semibold text-[var(--editorial-body)]">
                                    {(invitation.workspace?.name ?? "?")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="truncate text-sm text-[var(--foreground)]">
                                    {invitation.workspace?.name ?? "A workspace"}
                                </p>
                                <p className="truncate text-xs text-[var(--editorial-subtle)]">
                                    {WORKSPACE_ROLE_LABELS[invitation.role]}
                                    {invitation.invitedBy?.name
                                        ? ` · invited by ${invitation.invitedBy.name}`
                                        : ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() => rejectInvitation.mutate(invitation.token)}
                                className="h-11 rounded-[16px] px-4 text-sm text-[var(--editorial-body)]"
                            >
                                <X className="h-4 w-4" />
                                Decline
                            </Button>
                            <Button
                                type="button"
                                disabled={isBusy}
                                onClick={() => acceptInvitation.mutate(invitation.token)}
                                className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                            >
                                {acceptInvitation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Accept
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
