import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Integration } from "../integrations.data"

interface IntegrationCardProps {
    integration: Integration
    onAction?: (integration: Integration) => void
}

/**
 * One integration in the grid. Every tile shares the same neutral, monochrome
 * treatment so the catalogue reads as a single coherent set; a *connected*
 * integration is the one thing that breaks that calm — a filled tile and an
 * "Active" marker — so live connections are legible at a glance.
 *
 * Presentational only: it renders the integration's own `cta` label and hands
 * clicks back through `onAction`.
 */
export function IntegrationCard({ integration, onAction }: IntegrationCardProps) {
    const Icon = integration.icon
    const connected = Boolean(integration.connected)

    return (
        <div
            className={cn(
                "group editorial-transition flex h-full flex-col rounded-2xl border bg-[var(--card)] p-5",
                "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(24,35,52,0.08)]",
                connected
                    ? "border-[var(--editorial-primary-ring)]"
                    : "border-[var(--border)] hover:border-[var(--editorial-primary-ring)]",
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "editorial-transition flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                        connected
                            ? "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] text-[var(--foreground)] group-hover:border-[var(--editorial-primary-ring)]",
                    )}
                >
                    <Icon className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {integration.title}
                    </p>
                    <p className="mt-0.5 text-[11px] tracking-[0.04em] text-[var(--editorial-subtle)] uppercase">
                        {integration.category}
                    </p>
                </div>

                {connected && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--editorial-success-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]">
                        <Check className="h-3 w-3" />
                        Active
                    </span>
                )}
            </div>

            <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[var(--editorial-body)]">
                {integration.description}
            </p>

            <Button
                size="sm"
                variant={connected ? "outline" : "default"}
                onClick={() => onAction?.(integration)}
                className="mt-4 w-full text-sm"
            >
                {integration.cta}
            </Button>
        </div>
    )
}
