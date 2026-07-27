/**
 * Google Sign-In button component.
 *
 * Uses the Google Identity Services library (via `@react-oauth/google`) to
 * obtain a Google ID token (`credential`), then sends it to the backend
 * `/auth/google` endpoint.
 */

import { useCallback } from "react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { useGoogleAuth } from "@/features/auth/hooks/useAuth"
import { ROUTES } from "@/shared/constants/routes"

interface GoogleSignInButtonProps {
    /** Where to navigate after successful auth. */
    redirectTo?: string
}

export function GoogleSignInButton({ redirectTo = ROUTES.DASHBOARD }: GoogleSignInButtonProps) {
    const navigate = useNavigate()
    const googleAuthMutation = useGoogleAuth()

    const handleSuccess = useCallback(
        (credentialResponse: CredentialResponse) => {
            const idToken = credentialResponse.credential
            if (!idToken) return

            googleAuthMutation.mutate(
                { idToken },
                {
                    onSuccess: () => {
                        navigate(redirectTo)
                    },
                },
            )
        },
        [googleAuthMutation, navigate, redirectTo],
    )

    return <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google Sign-In failed")} />
}