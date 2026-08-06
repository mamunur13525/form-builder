import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ROUTES } from "../../shared/constants/routes"
import { useForgotPassword } from "../../features/auth/hooks/useAuth"
import {
    AuthCard,
    AuthField,
    authSubmitClass,
} from "../../features/auth/components/auth-primitives"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { Spinner } from "@/components/ui/spinner"

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const forgotPassword = useForgotPassword()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        forgotPassword.mutate(email, {
            onSuccess: () => {
                setSubmitted(true)
                showSuccess(
                    "Check your email",
                    "If the email exists, a reset link has been sent.",
                )
            },
            onError: (err) => {
                showError("Request failed", err)
            },
        })
    }

    if (submitted) {
        return (
            <AuthCard
                eyebrow="Check your inbox"
                title="Email sent"
                description="If an account exists with that email, you'll receive a password reset link shortly."
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--editorial-body)]">
                        Didn't receive an email? Check your spam folder or try again in a few
                        minutes.
                    </p>
                    <Link to={ROUTES.LOGIN}>
                        <Button variant="outline" className="w-full">
                            Back to sign in
                        </Button>
                    </Link>
                </div>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            eyebrow="Forgot your password?"
            title="Reset password"
            description="Enter your email and we'll send you a link to reset your password."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="space-y-4 pt-1">
                    <Button
                        type="submit"
                        className={authSubmitClass}
                        disabled={forgotPassword.isPending}
                    >
                        {forgotPassword.isPending && <Spinner data-icon="inline-start" />}
                        {forgotPassword.isPending ? "Sending..." : "Send reset link"}
                    </Button>

                    <div className="text-center">
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-sm text-[var(--editorial-body)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </form>
        </AuthCard>
    )
}
