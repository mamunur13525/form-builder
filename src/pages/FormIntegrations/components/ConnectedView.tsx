import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Integration } from "../integrations.data"
import { IntegrationCard } from "./IntegrationCard"

interface ConnectedViewProps {
    connected: Integration[]
    featured: Integration[]
    total: number
    /** Current user's email, used to describe the "Email to me" connection. */
    email?: string
    onBrowse: () => void
    onAction?: (integration: Integration) => void
}

/** A live connection rendered as a horizontal row inside the Connected panel. */
function ConnectedRow({
    integration,
    email,
    onAction,
}: {
    integration: Integration
    email?: string
    onAction?: (integration: Integration) => void
}) {
    const Icon = integration.icon
    const subline =
        integration.id === "email-to-me" ? (
            <>
                Notifying{" "}
                <span className="font-medium text-[var(--foreground)]">
                    {email ?? "your email"}
                </span>{" "}
                for new submissions
            </>
        ) : (
            integration.description
        )

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                        {integration.title}
                    </p>
                    <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                        {subline}
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onAction?.(integration)}
                className="shrink-0 text-sm"
            >
                Manage
            </Button>
        </div>
    )
}

/**
 * The default landing view: what's already live for this form, followed by a
 * curated shortlist and a way into the full catalogue. Splitting this out keeps
 * the page shell to routing-level state and lets the two views evolve apart.
 */
export function ConnectedView({
    connected,
    featured,
    total,
    email,
    onBrowse,
    onAction,
}: ConnectedViewProps) {
    return (
        <div className="space-y-6">
            {/* What's live now */}
            <PanelCard>
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--editorial-border-light)] bg-[var(--editorial-primary-light)] text-[var(--primary)]">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-xl leading-tight text-[var(--foreground)] sm:text-2xl">
                            Connected
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[var(--editorial-body)]">
                            {connected.length > 0
                                ? "These integrations are active for this form."
                                : "Nothing is connected yet — pick a tool below to get started."}
                        </p>
                    </div>
                </div>

                {connected.length > 0 && (
                    <div className="mt-6 space-y-3">
                        {connected.map((integration) => (
                            <ConnectedRow
                                key={integration.id}
                                integration={integration}
                                email={email}
                                onAction={onAction}
                            />
                        ))}
                    </div>
                )}
            </PanelCard>

            {/* Connect more */}
            <PanelCard>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-xl leading-tight text-[var(--foreground)] sm:text-2xl">
                            Connect more tools
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[var(--editorial-body)]">
                            A few favourites to get you going, or browse the full
                            set of {total}.
                        </p>
                    </div>
                    <Button variant="outline" onClick={onBrowse} className="border! border-accent shrink-0 text-sm">
                        Browse all {total} <ArrowRight className='h-4! w-4!' />
                    </Button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {featured.map((integration) => (
                        <IntegrationCard
                            key={integration.id}
                            integration={integration}
                            onAction={onAction}
                        />
                    ))}
                </div>
            </PanelCard>
        </div>
    )
}

/** A titled surface used for the two landing sections — matches the settings cards. */
function PanelCard({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <section
            className={cn(
                "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7",
                className,
            )}
        >
            {children}
        </section>
    )
}
