/** Full-screen loading state shown while the form is being fetched. */
export function BuilderLoading() {
  return (
    <div className="editorial h-screen flex items-center justify-center bg-[var(--editorial-canvas)]">
      <div className="flex flex-col items-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border)] border-t-[var(--primary)] mb-6" />
        <p className="font-display text-2xl text-[var(--foreground)]">
          Loading form
        </p>
        <p className="mt-2 text-base text-[var(--editorial-subtle)]">
          One moment while we gather your pages.
        </p>
      </div>
    </div>
  );
}

interface BuilderErrorProps {
  error: string;
  onBack: () => void;
}

/** Full-screen error state shown when the form fails to load. */
export function BuilderError({ error, onBack }: BuilderErrorProps) {
  return (
    <div className="editorial h-screen flex items-center justify-center bg-[var(--editorial-canvas)] px-8">
      <div className="editorial-shadow-md flex max-w-md flex-col items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-10 py-12 text-center">
        <h2 className="font-display text-[32px] leading-tight text-[var(--foreground)]">
          Something went wrong
        </h2>
        <p className="mt-4 text-base leading-6 text-[var(--editorial-body)]">
          {error}
        </p>
        <button
          onClick={onBack}
          className="editorial-transition mt-8 h-[52px] rounded-lg bg-[var(--primary)] px-8 text-sm font-medium text-white hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
