import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ROUTES } from "../../shared/constants/routes";
import { useLogin } from "../../features/auth/hooks/useAuth";
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

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          showSuccess("Welcome back!", "You have been signed in successfully.");
          navigate(ROUTES.DASHBOARD);
        },
        onError: (err) => {
          showError("Sign in failed", err);
        },
      },
    );
  };

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in"
      description="Enter your credentials to pick up where you left off."
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
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="space-y-4 pt-1">
          <Button
            type="submit"
            className={authSubmitClass}
            disabled={login.isPending}
          >
            {login.isPending && <Spinner data-icon="inline-start" />}
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <AuthDivider label="Or continue with" />

          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>

          <AuthSwitchPrompt
            prompt="Don't have an account?"
            linkLabel="Sign up"
            to={ROUTES.SIGNUP}
          />
        </div>
      </form>
    </AuthCard>
  );
}
