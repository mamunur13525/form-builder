import { useNavigate, useParams } from "react-router-dom"
import { Building2, Check, Clock, Loader2, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WORKSPACE_ROLE_LABELS } from "@/entities/workspace/model/types"
import {
    useAcceptInvitation,
    useInvitationByToken,
    useRejectInvitation,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ROUTES } from "@/shared/constants/routes"

const pageClass =
    "editorial mx-auto flex min-h-dvh w-full max-w-[560px] flex-col justify-center px-4 py-16 sm:px-6"

const cardClass = "rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10"

function formatDate(value: string | null | undefined): string {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

/**
 * Whether a date has already passed. Kept at module scope so the clock is not
 * read from inside the render body.
 */
function isPastDate(value: string | null | undefined): boolean {
    if (!value) return false
    return new Date(value).getTime() < Date.now()
}

/**
 * Landing page for an invitation link — `/invitations/:token`, matching
 * `buildInviteUrl` on the server.
 *
 * The token is looked up before anything is offered, so a cancelled, expired or
 * already-used link explains itself instead of failing on click. This route sits
 * behind auth: the server checks the signed-in email against the invited
 * address, so there is no way to accept somebody else's invitation.
 */
export function AcceptInvitationPage() {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()

    const { data: invitation, isLoading, isError, error } = useInvitationByToken(token)

    const acceptInvitation = useAcceptInvitation()
    const rejectInvitation = useRejectInvitation()

    const isBusy = acceptInvitation.isPending || rejectInvitation.isPending

    // ----- Loading ---------------------------------------------------------
    if (isLoading) {
        return (
            <div className={pageClass}>
                <div className={cardClass}>
                    <div className="flex items-center gap-3 text-[var(--editorial-body)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm">Checking your invitation…</p>
                    </div>
                </div>
            </div>
        )
    }

    // ----- Bad link --------------------------------------------------------
    if (isError || !invitation) {
        return (
            <div className={pageClass}>
                <div className={cardClass}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/8 text-[var(--destructive)]">
                        <XCircle className="h-6 w-6" />
                    </span>
                    <h1 className="font-display mt-6 text-3xl text-[var(--foreground)]">
                        This invitation is not valid
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-[var(--editorial-body)]">
                        {error instanceof Error && error.message
                            ? error.message
                            : "The link may have expired, been cancelled, or already been used. Ask whoever invited you to send a new one."}
                    </p>
                    <Button
                        type="button"
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="editorial-transition mt-8 h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                    >
                        Go to dashboard
                    </Button>
                </div>
            </div>
        )
    }

    // A pending-but-lapsed invitation is reported as expired rather than offered.
    const isExpired = invitation.isExpired || isPastDate(invitation.expiresAt)
    const isOpen = invitation.status === "pending" && !isExpired

    return (
        <div className={pageClass}>
            <div className={cardClass}>
                {/* Workspace identity */}
                <div className="flex items-center gap-4">
                    {invitation.workspace?.logoUrl ? (
                        <img
                            src={invitation.workspace.logoUrl}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-[18px] border border-[var(--editorial-border-light)] object-cover"
                        />
                    ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                            <Building2 className="h-6 w-6" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                            Invitation
                        </p>
                        <p className="truncate text-lg text-[var(--foreground)]">
                            {invitation.workspace?.name ?? "A workspace"}
                        </p>
                    </div>
                </div>

                <h1 className="font-display mt-8 text-3xl leading-[1.15] text-[var(--foreground)]">
                    {invitation.invitedBy?.name
                        ? `${invitation.invitedBy.name} invited you to join`
                        : "You have been invited to join"}
                </h1>

                <p className="mt-3 text-sm leading-6 text-[var(--editorial-body)]">
                    You would join as{" "}
                    <span className="text-[var(--foreground)]">
                        {WORKSPACE_ROLE_LABELS[invitation.role]}
                    </span>
                    . The invitation was sent to{" "}
                    <span className="text-[var(--foreground)]">{invitation.email}</span> —
                    sign in with that address to accept it.
                </p>

                {/* Status */}
                {isOpen ? (
                    <p className="mt-4 flex items-center gap-2 text-xs text-[var(--editorial-subtle)]">
                        <Clock className="h-3 w-3" />
                        Valid until {formatDate(invitation.expiresAt)}
                    </p>
                ) : (
                    <div className="mt-6 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-5">
                        <p className="text-sm text-[var(--foreground)]">
                            {isExpired
                                ? "This invitation has expired"
                                : invitation.status === "accepted"
                                  ? "This invitation was already accepted"
                                  : invitation.status === "rejected"
                                    ? "This invitation was declined"
                                    : "This invitation was cancelled"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            Ask whoever invited you to send a new link.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3">
                    {isOpen ? (
                        <>
                            <Button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                    acceptInvitation.mutate(token as string, {
                                        onSuccess: () => navigate(ROUTES.DASHBOARD),
                                    })
                                }
                                className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                            >
                                {acceptInvitation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Joining…
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Accept invitation
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() =>
                                    rejectInvitation.mutate(token as string, {
                                        onSuccess: () => navigate(ROUTES.DASHBOARD),
                                    })
                                }
                                className="h-11 rounded-[16px] border-[var(--border)] px-6"
                            >
                                {rejectInvitation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Declining…
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4" />
                                        Decline
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                            className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                        >
                            Go to dashboard
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
