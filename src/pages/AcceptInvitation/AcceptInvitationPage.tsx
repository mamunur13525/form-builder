import { useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, Building2, Check, Clock, Loader2, LogIn, LogOut, UserPlus, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WORKSPACE_ROLE_LABELS } from "@/entities/workspace/model/types"
import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth"
import {
    useAcceptInvitation,
    useInvitationByToken,
    useRejectInvitation,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ROUTES } from "@/shared/constants/routes"
import { tokenStorage } from "@/shared/utils/storage"

const pageClass =
    "editorial mx-auto flex min-h-dvh w-full max-w-[560px] flex-col justify-center px-4 py-16 sm:px-6"

const cardClass = "rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 sm:p-10 shadow-sm"

function formatDate(value: string | null | undefined): string {
    if (!value) return "—"
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function isPastDate(value: string | null | undefined): boolean {
    if (!value) return false
    return new Date(value).getTime() < Date.now()
}

export function AcceptInvitationPage() {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()

    const hasToken = Boolean(tokenStorage.getAccessToken())
    const { data: currentUser } = useCurrentUser()
    const logout = useLogout()

    const { data: invitation, isLoading, isError, error } = useInvitationByToken(token)

    const acceptInvitation = useAcceptInvitation()
    const rejectInvitation = useRejectInvitation()

    const isBusy = acceptInvitation.isPending || rejectInvitation.isPending || logout.isPending

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
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/8 text-[var(--destructive)]">
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
                        onClick={() => navigate(hasToken ? ROUTES.DASHBOARD : ROUTES.LOGIN)}
                        className="editorial-transition mt-8 h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                    >
                        {hasToken ? "Go to dashboard" : "Go to sign in"}
                    </Button>
                </div>
            </div>
        )
    }

    const isExpired = invitation.isExpired || isPastDate(invitation.expiresAt)
    const isOpen = invitation.status === "pending" && !isExpired

    const targetInvitePath = `/invite/${token}`
    const loginRedirectUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(targetInvitePath)}&email=${encodeURIComponent(invitation.email)}`
    const signupRedirectUrl = `${ROUTES.SIGNUP}?redirect=${encodeURIComponent(targetInvitePath)}&email=${encodeURIComponent(invitation.email)}`

    const isEmailMismatch =
        hasToken &&
        Boolean(currentUser?.email) &&
        currentUser?.email?.toLowerCase().trim() !== invitation.email.toLowerCase().trim()

    const handleSwitchAccount = () => {
        logout.mutate(undefined, {
            onSuccess: () => {
                navigate(loginRedirectUrl)
            },
        })
    }

    return (
        <div className={pageClass}>
            <div className={cardClass}>
                {/* Workspace identity */}
                <div className="flex items-center gap-4">
                    {invitation.workspace?.logoUrl ? (
                        <img
                            src={invitation.workspace.logoUrl}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-lg border border-[var(--editorial-border-light)] object-cover"
                        />
                    ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                            <Building2 className="h-6 w-6" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                            Workspace Invitation
                        </p>
                        <p className="truncate text-lg font-semibold text-[var(--foreground)]">
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
                    <span className="font-medium text-[var(--foreground)] capitalize">
                        {WORKSPACE_ROLE_LABELS[invitation.role] || invitation.role}
                    </span>
                    . This invitation is intended for{" "}
                    <span className="font-medium text-[var(--foreground)]">{invitation.email}</span>.
                </p>

                {/* Status */}
                {isOpen ? (
                    <p className="mt-4 flex items-center gap-2 text-xs text-[var(--editorial-subtle)]">
                        <Clock className="h-3 w-3" />
                        Valid until {formatDate(invitation.expiresAt)}
                    </p>
                ) : (
                    <div className="mt-6 rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-5">
                        <p className="text-sm font-medium text-[var(--foreground)]">
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

                {/* Email mismatch notice */}
                {isOpen && isEmailMismatch && (
                    <div className="mt-6 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div className="text-xs leading-5">
                                <p className="font-medium">Signed in with a different email</p>
                                <p className="mt-1">
                                    You are currently signed in as{" "}
                                    <span className="font-semibold">{currentUser?.email}</span>, but this invitation was sent to{" "}
                                    <span className="font-semibold">{invitation.email}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex flex-wrap gap-3">
                    {isOpen ? (
                        !hasToken ? (
                            /* Unauthenticated Guest preview actions */
                            <>
                                <Button
                                    type="button"
                                    onClick={() => navigate(loginRedirectUrl)}
                                    className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign in to accept
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(signupRedirectUrl)}
                                    className="h-11 rounded-lg border-[var(--border)] px-6 text-sm font-medium"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create account
                                </Button>
                            </>
                        ) : isEmailMismatch ? (
                            /* Logged in with different email */
                            <>
                                <Button
                                    type="button"
                                    onClick={handleSwitchAccount}
                                    disabled={isBusy}
                                    className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                                >
                                    {logout.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <LogOut className="h-4 w-4 mr-2" />
                                    )}
                                    Switch account
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isBusy}
                                    onClick={() =>
                                        acceptInvitation.mutate(token as string, {
                                            onSuccess: () => navigate(ROUTES.DASHBOARD),
                                        })
                                    }
                                    className="h-11 rounded-lg border-[var(--border)] px-6 text-sm"
                                >
                                    Try accepting anyway
                                </Button>
                            </>
                        ) : (
                            /* Authenticated with matching email */
                            <>
                                <Button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                        acceptInvitation.mutate(token as string, {
                                            onSuccess: () => navigate(ROUTES.DASHBOARD),
                                        })
                                    }
                                    className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                                >
                                    {acceptInvitation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Joining…
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
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
                                    className="h-11 rounded-lg border-[var(--border)] px-6"
                                >
                                    {rejectInvitation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Declining…
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-4 w-4 mr-2" />
                                            Decline
                                        </>
                                    )}
                                </Button>
                            </>
                        )
                    ) : (
                        <Button
                            type="button"
                            onClick={() => navigate(hasToken ? ROUTES.DASHBOARD : ROUTES.LOGIN)}
                            className="editorial-transition h-11 rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                        >
                            {hasToken ? "Go to dashboard" : "Go to sign in"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

