import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryTabsProps {
    categories: string[]
    active: string
    counts: Record<string, number>
    onSelect: (category: string) => void
    onBack: () => void
}

/**
 * Category filter for the browse view, rendered two ways:
 *  - on mobile, a sticky horizontally-scrolling pill strip pinned to the top;
 *  - on desktop, a sticky vertical sidebar beside the results.
 *
 * Both renderings are emitted here (one hidden per breakpoint) so `BrowseView`
 * only has to place this component inside its responsive layout. Mirrors the
 * section nav in `FormSettingsPage`.
 */
export function CategoryTabs({
    categories,
    active,
    counts,
    onSelect,
    onBack,
}: CategoryTabsProps) {
    return (
        <>
            {/* Mobile: horizontally scrollable pill strip pinned to the top. */}
            <nav className="sticky top-0 z-20 border-b border border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-backdrop-filter:bg-[var(--card)]/80 lg:hidden rounded-2xl">
                <div className="flex items-center gap-3 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onBack}
                        className="shrink-0 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-1">
                        {categories.map((category) => (
                            <CategoryPill
                                key={category}
                                category={category}
                                active={active === category}
                                count={counts[category] ?? 0}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Desktop: sticky vertical sidebar. */}
            <aside className="hidden lg:block lg:w-60 lg:shrink-0 bg-[var(--card)] px-5 py-6 rounded-xl border border-[var(--border)] h-fit sticky top-6">
                <div className="sticky top-6 flex flex-col gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onBack}
                        className="mb-1 w-full justify-start text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <p className="editorial-eyebrow px-3 pt-1 pb-1 text-[var(--editorial-subtle)]">
                        Categories
                    </p>
                    {categories.map((category) => (
                        <CategoryNavRow
                            key={category}
                            category={category}
                            active={active === category}
                            count={counts[category] ?? 0}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            </aside>
        </>
    )
}

/** A count badge whose tone follows the active state. */
function CountBadge({ count, active }: { count: number; active: boolean }) {
    return (
        <span
            className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                active
                    ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                    : "bg-[var(--editorial-canvas)] text-[var(--editorial-subtle)]",
            )}
        >
            {count}
        </span>
    )
}

/** Horizontal pill used in the mobile strip. */
function CategoryPill({
    category,
    active,
    count,
    onSelect,
}: {
    category: string
    active: boolean
    count: number
    onSelect: (category: string) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={active}
            className={cn(
                "editorial-transition flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[13px] font-medium",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40 focus-visible:outline-none",
                active
                    ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
            )}
        >
            {category === "All" && <Sparkles className="h-4 w-4" />}
            {category}
            <CountBadge count={count} active={active} />
        </button>
    )
}

/** Full-width row used in the desktop sidebar (label left, count right). */
function CategoryNavRow({
    category,
    active,
    count,
    onSelect,
}: {
    category: string
    active: boolean
    count: number
    onSelect: (category: string) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={active}
            className={cn(
                "editorial-transition flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40 focus-visible:outline-none",
                active
                    ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                    : "border-transparent text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
            )}
        >
            <span className="flex-1 truncate">{category}</span>
            <CountBadge count={count} active={active} />
        </button>
    )
}
