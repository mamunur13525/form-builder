import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";

const highlights = [
  "Design pages that feel like a conversation.",
  "Share a link and watch responses land in real time.",
  "Read the results without exporting a spreadsheet.",
];

/**
 * Split-screen shell for the auth screens: an editorial brand panel on wide
 * viewports, and a single centred column on phones and tablets.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="editorial min-h-screen bg-[var(--editorial-canvas)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand panel — decorative, so it is dropped on small screens. */}
      <aside className="relative hidden overflow-hidden bg-[var(--editorial-surface)] px-14 py-16 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[var(--editorial-primary-light)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[var(--editorial-purple-light)] blur-3xl"
        />

        <Link
          to={ROUTES.HOME}
          className="editorial-transition relative flex w-fit items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--primary)] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl">FormFlow</span>
        </Link>

        <div className="relative max-w-lg">
          <p className="editorial-eyebrow text-[var(--primary)]">
            Forms, reimagined
          </p>
          <h2 className="mt-4 font-display text-[52px] leading-[1.05] text-[var(--foreground)]">
            Build forms that people actually finish.
          </h2>
          <ul className="mt-10 space-y-4">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-base leading-6 text-[var(--editorial-body)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-[var(--editorial-subtle)]">
          One question at a time. Just like a good conversation.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        <Link
          to={ROUTES.HOME}
          className="editorial-transition mb-8 flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)] lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--primary)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl">FormFlow</span>
        </Link>

        <div className="w-full max-w-[460px]">{children}</div>
      </main>
    </div>
  );
}
