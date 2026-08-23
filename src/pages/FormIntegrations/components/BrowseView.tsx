import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORIES, type Integration } from "../integrations.data"
import type { IntegrationGroup } from "../useIntegrationFilter"
import { CategoryTabs } from "./CategoryTabs"
import { IntegrationCard } from "./IntegrationCard"

interface BrowseViewProps {
    category: string
    onCategoryChange: (category: string) => void
    search: string
    onSearchChange: (search: string) => void
    groups: IntegrationGroup[]
    counts: Record<string, number>
    onBack: () => void
    onAction?: (integration: Integration) => void
}

/**
 * The full catalogue. Category navigation lives in {@link CategoryTabs}, which
 * is a sticky top strip on mobile and a left sidebar on desktop; this component
 * owns the responsive two-column frame and the results column (search + the
 * grid grouped by category). Emptiness is treated as a moment for direction
 * rather than a dead end — the empty state says how to recover.
 */
export function BrowseView({
    category,
    onCategoryChange,
    search,
    onSearchChange,
    groups,
    counts,
    onBack,
    onAction,
}: BrowseViewProps) {
    return (
        <div className="lg:flex lg:gap-8">
            <CategoryTabs
                categories={CATEGORIES}
                active={category}
                counts={counts}
                onSelect={onCategoryChange}
                onBack={onBack}
            />

            <div className="mt-6 min-w-0 flex-1 space-y-6 lg:mt-0 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 lg:p-8">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--editorial-subtle)]" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search integrations..."
                        aria-label="Search integrations"
                        className="h-12 rounded-2xl border-[var(--input)] bg-[var(--card)] pr-4 pl-10 text-base placeholder:text-[var(--editorial-subtle)]"
                    />
                </div>

                {groups.length === 0 ? (
                    <EmptyState
                        onClear={() => {
                            onSearchChange("")
                            onCategoryChange("All")
                        }}
                    />
                ) : (
                    <div className="space-y-8">
                        {groups.map((group) => (
                            <section key={group.category}>
                                <div className="mb-3 flex items-center gap-2">
                                    <h3 className="editorial-eyebrow text-[var(--foreground)]">
                                        {group.category}
                                    </h3>
                                    <span className="text-xs text-[var(--editorial-subtle)] tabular-nums">
                                        {group.items.length}
                                    </span>
                                    <div className="ml-1 flex-1 border-t border-[var(--editorial-border-light)]" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {group.items.map((integration) => (
                                        <IntegrationCard
                                            key={integration.id}
                                            integration={integration}
                                            onAction={onAction}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/** Shown when no integration matches the current filters. */
function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] text-[var(--editorial-subtle)]">
                <Search className="h-6 w-6" />
            </div>
            <h2 className="font-display mt-5 text-2xl text-[var(--foreground)]">
                No integrations match
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--editorial-body)]">
                Try a different keyword or clear the category filter.
            </p>
            <Button onClick={onClear} className="mt-5 text-sm">
                Clear filters
            </Button>
        </div>
    )
}
