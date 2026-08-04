import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ROUTES } from "../../shared/constants/routes";
import { useRegister } from "../../features/auth/hooks/useAuth";
import { GoogleSignInButton } from "../../features/auth/components/GoogleSignInButton";
import {
  AuthCard,
  AuthDivider,
  AuthField,
  AuthSwitchPrompt,
  authSubmitClass,
} from "../../features/auth/components/auth-primitives";
import { showError, showSuccess } from "@/shared/hooks/useToast";
import { Spinner } from "@/components/ui/spinner";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError(
        "Validation",
        new Error(
          "Passwords do not match. Please make sure both passwords are the same.",
        ),
      );
      return;
    }
    register.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          showSuccess(
            "Account created!",
            "Your account has been created successfully. Welcome aboard!",
          );
          navigate(ROUTES.DASHBOARD);
        },
        onError: (err) => {
          showError("Sign up failed", err);
        },
      },
    );
  };

  const passwordsMatch = password === confirmPassword || confirmPassword === "";

  return (
    <AuthCard
      eyebrow="Get started"
      title="Create your account"
      description="Sign up to start building beautiful forms."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AuthField
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={passwordsMatch ? undefined : "Passwords do not match"}
          required
        />

        <div className="space-y-4 pt-1">
          <Button
            type="submit"
            className={authSubmitClass}
            disabled={register.isPending || !passwordsMatch}
          >
            {register.isPending && <Spinner data-icon="inline-start" />}
            {register.isPending ? "Creating account..." : "Sign up"}
          </Button>

          <AuthDivider label="Or continue with" />

          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>

          <AuthSwitchPrompt
            prompt="Already have an account?"
            linkLabel="Sign in"
            to={ROUTES.LOGIN}
          />
        </div>
      </form>
    </AuthCard>
  );
}
