/**
 * Google Sign-In button component.
 *
 * Uses the Google Identity Services library (via `@react-oauth/google`) to
 * obtain a Google ID token (`credential`), then sends it to the backend
 * `/auth/google` endpoint.
 */

import { useCallback, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

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
      if (!idToken) return;

      googleAuthMutation.mutate(
        { idToken },
        {
          onSuccess: () => {
            navigate(redirectTo);
          },
          onError: (err) => {
            console.log({ err });
          },
          onSettled: () => {
            setIsPending(false);
          },
        },
      );
    },
    [googleAuthMutation, navigate, redirectTo],
  );
  if (isPending) {
    return (
      <Button variant={"outline"} className={"w-7/12 rounded-lg"}>
        <Spinner />
      </Button>
    );
  }
  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error("Google Sign-In failed")}
    />
  );
}
