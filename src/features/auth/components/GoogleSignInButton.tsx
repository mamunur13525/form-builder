/**
 * Google Sign-In button component.
 *
 * Uses the Google Identity Services library (`@react-oauth/google`) and
 * the `<GoogleLogin>` component, which can return either:
 *  - ID token (`CredentialResponse.credential`), or
 *  - authorization `code`, depending on Google’s configured consent/UX path.
 *
 * This implementation is set up for the ID-token path and sends the token
 * to `POST /auth/google` as `{ idToken }`.
 */

import { useCallback, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { Spinner } from "@/components/ui/spinner";

interface GoogleSignInButtonProps {
  /** Where to navigate after successful auth. */
  redirectTo?: string;
}

export function GoogleSignInButton({
  redirectTo = ROUTES.DASHBOARD,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const googleAuthMutation = useGoogleAuth();
  const [isPending, setIsPending] = useState(false);

  const handleSuccess = useCallback(
    (credentialResponse: CredentialResponse) => {
      setIsPending(true);
      const idToken = credentialResponse.credential;
      if (!idToken) {
        console.error(
          "Google Sign-In: missing credential. Ensure your Google OAuth client is configured to return ID tokens.",
        );
        setIsPending(false);
        return;
      }

      googleAuthMutation.mutate(
        { idToken },
        {
          onSuccess: () => {
            navigate(redirectTo);
          },
          onError: (err) => {
            setIsPending(false);
          },
          onSettled: () => {
            setIsPending(false);
          },
        },
      );
    },
    [googleAuthMutation, navigate, redirectTo],
  );

  const handleError = useCallback(() => {
    console.error("Google Sign-In failed");
  }, []);

  if (isPending) {
    return (
      <button
        type="button"
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="editorial-transition h-9.5 w-full rounded-full border border-[var(--input)] bg-[var(--background)] text-sm font-medium text-gray-600 disabled:cursor-not-allowed  flex items-center justify-center gap-2.5"
        disabled={isPending}
      >
        <Spinner data-icon="inline-start" />
        Signing in...
      </button>
    );
  }

  return (
    <div className=" w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        type="standard"
        theme="outline"
        size="large"
        text="signin_with"
        shape="pill"
        width="100%"
        aria-label="Continue with Google"
      />
    </div>
  );
}
