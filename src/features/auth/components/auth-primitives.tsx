import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Shared building blocks for the sign-in / sign-up screens.
 *
 * Both screens are the same layout with different fields, so the chrome lives
 * here to keep the two pages in sync.
 */

/** The editorial card that wraps an auth form. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="editorial-shadow w-full rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 sm:rounded-[32px] sm:p-10">
      <div className="mb-8">
        <p className="editorial-eyebrow text-[var(--primary)]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[32px] leading-tight text-[var(--foreground)] sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-6 text-[var(--editorial-body)]">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

/** A labelled text input with optional inline error copy. */
export function AuthField({
  id,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-[var(--editorial-body)]"
      >
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "editorial-transition h-[52px] rounded-[16px] border-[var(--input)] bg-[var(--background)] px-4 text-base text-[var(--foreground)] placeholder:text-[var(--editorial-subtle)] focus-visible:border-[var(--editorial-primary-ring)] focus-visible:ring-2 focus-visible:ring-[var(--editorial-primary-ring)] focus-visible:ring-offset-0",
          error && "border-[var(--destructive)]",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Primary coral submit button used by both auth forms. */
export const authSubmitClass =
  "editorial-transition w-full py-3 rounded-[16px] text-sm font-medium text-white  hover:-translate-y-0.5  active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none";

/** "Or continue with" rule. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative w-full py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <span className="w-full border-t border-[var(--editorial-border-light)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="editorial-eyebrow bg-[var(--card)] px-3 text-[var(--editorial-subtle)]">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Footer link that swaps between the sign-in and sign-up screens. */
export function AuthSwitchPrompt({
  prompt,
  linkLabel,
  to,
}: {
  prompt: string;
  linkLabel: string;
  to: (typeof ROUTES)[keyof typeof ROUTES];
}) {
  return (
    <p className="text-center text-sm text-[var(--editorial-body)]">
      {prompt}{" "}
      <Link
        to={to}
        className="editorial-transition font-medium text-[var(--primary)] underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
