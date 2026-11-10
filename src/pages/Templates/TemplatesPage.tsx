import { useMemo, useState } from "react"
import { Search, ArrowRight, Sparkles, FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreateForm } from "@/features/forms/hooks/useForms"
import { useTemplates, type Template } from "@/features/templates/hooks/useTemplates"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { PageLayout } from "@/shared/components/PageLayout"

/** The first template gets a "Featured" treatment in the grid. */
const FEATURED_ID = "contact"

/** Placeholder with the same footprint as a template card. */
function TemplateCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <Card
            className="animate-in fade-in duration-300 border-[var(--border)]"
            style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: "backwards",
            }}
        >
            <CardContent className="flex flex-1 flex-col">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <Skeleton className="mt-6 h-3 w-16" />
                <Skeleton className="mt-3 h-7 w-3/4" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--editorial-border-light)] pt-5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
            </CardContent>
        </Card>
    )
}

export function TemplatesPage() {
    const navigate = useNavigate()
    const createForm = useCreateForm()
    const { data: templates = [], isLoading } = useTemplates()

    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("All")

    const categories = useMemo(
        () => ["All", ...Array.from(new Set(templates.map((t) => t.category)))],
        [templates],
    )

    const visibleTemplates = useMemo(() => {
        const term = query.trim().toLowerCase()
        return templates.filter((template) => {
            const matchesCategory = category === "All" || template.category === category
            const matchesQuery =
                !term ||
                template.title.toLowerCase().includes(term) ||
                template.description.toLowerCase().includes(term)
            return matchesCategory && matchesQuery
        })
    }, [templates, query, category])

    /** Creates a form from the template and drops the user into the builder. */
    const createFromTemplate = (template: Template) => {
        createForm.mutate(
            { title: template.title },
            {
                onSuccess: (created) => navigate(`/form-builder/${created.id}`),
            },
        )
    }

    return (
        <PageLayout
            title="Templates"
            description="Start from a considered layout instead of a blank page. Every template is a normal form once created — edit anything you like."
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="editorial-transition flex h-[52px] w-full items-center gap-3 rounded-lg border border-[var(--input)] bg-[var(--card)] px-5 py-1 focus-within:border-[var(--primary)] sm:px-6 lg:min-w-[280px] lg:flex-1">
                    <Search className="h-5 w-5 shrink-0 text-[var(--editorial-subtle)]" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search templates..."
                        aria-label="Search templates"
                        className="h-full flex-1 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-[var(--editorial-subtle)] focus-visible:ring-0"
                    />
                </div>

                {/* Segmented control — inset track with a raised active item. */}
                <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible shadow-xs">
                    {categories.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className={cn(
                                "editorial-transition shrink-0 rounded-lg border px-4 py-2 text-sm font-medium cursor-pointer",
                                category === item
                                    ? "border-[#FF5722]/30 bg-[#FF5722]/15 text-[#FF5722] font-semibold shadow-sm"
                                    : "border-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100",
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template grid */}
            {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TemplateCardSkeleton key={index} index={index} />
                    ))}
                </div>
            ) : visibleTemplates.length === 0 ? (
                <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="flex flex-col items-center py-20 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] text-[var(--editorial-subtle)]">
                            <FileSearch className="h-6 w-6" />
                        </div>
                        <h2 className="font-display mt-5 text-2xl text-[var(--foreground)]">
                            No templates match your search
                        </h2>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--editorial-body)]">
                            Try a different keyword or clear the category filter to
                            see the full collection.
                        </p>
                        <Button
                            onClick={() => {
                                setQuery("")
                                setCategory("All")
                            }}
                        >
                            Clear filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleTemplates.map((template) => {
                        const isFeatured = template.id === FEATURED_ID
                        const Icon = template.icon

                        return (
                            <Card
                                key={template.id}
                                className={cn(
                                    isFeatured
                                        ? "border-[var(--editorial-primary-ring)]/60"
                                        : "border-[var(--border)]",
                                )}
                            >
                                {/* Featured ribbon */}
                                {isFeatured && (
                                    <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-lg bg-[var(--editorial-primary-selected)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-[var(--primary)] uppercase">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Featured
                                    </div>
                                )}

                                <CardContent className="flex flex-1 flex-col">
                                    {/* Icon tile — soft tinted square, not a generic circle */}
                                    <div
                                        className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-lg",
                                            template.tint,
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    {/* Category badge */}
                                    <span className="editorial-eyebrow mt-6 text-[var(--editorial-subtle)]">
                                        {template.badge}
                                    </span>

                                    <h2 className="font-display mt-2 text-[26px] leading-tight text-[var(--foreground)] [text-wrap:balance]">
                                        {template.title}
                                    </h2>
                                    <p className="mt-2 flex-1 text-[15px] leading-6 text-[var(--editorial-body)]">
                                        {template.description}
                                    </p>

                                    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--editorial-border-light)] pt-5">
                                        <span className="text-sm tabular-nums text-[var(--editorial-subtle)]">
                                            {template.pageCount} questions
                                        </span>
                                        <Button
                                            onClick={() => createFromTemplate(template)}
                                            disabled={createForm.isPending}
                                            className={'text-sm'}
                                        >
                                            Use template
                                            <ArrowRight className="h-4 w-4 transition-transform duration-250 group-hover:translate-x-0.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </PageLayout>
    )
}
