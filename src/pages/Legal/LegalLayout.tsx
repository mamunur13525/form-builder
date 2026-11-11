import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-100 selection:bg-[#FF5722] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0c0c0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 text-white transition hover:opacity-85"
          >
            <img
              src="/flogo.png"
              alt="FormFlow"
              className="h-8 w-8 rounded-lg object-contain shadow-sm"
            />
            <span className="font-display text-lg font-bold">FormFlow</span>
          </Link>

          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 border-b border-zinc-800 pb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5722]">
            Legal Information
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-base text-zinc-400">{subtitle}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Last modified: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none text-sm leading-relaxed text-zinc-300 md:text-base">
          {children}
        </div>

        <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-400">
          Have questions or need a Data Processing Agreement (DPA)? Email us at{" "}
          <a
            href="mailto:support@formflow.dev"
            className="text-[#FF5722] underline hover:opacity-85"
          >
            support@formflow.dev
          </a>
          .
        </div>
      </main>
    </div>
  );
}
