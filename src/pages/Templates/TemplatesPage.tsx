import { useMemo, useState } from "react"
import {
    ClipboardList,
    CalendarCheck,
    MessageSquareHeart,
    Users,
    Briefcase,
    GraduationCap,
    Search,
    ArrowRight,
    Sparkles,
    FileSearch,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useCreateForm } from "@/features/forms/hooks/useForms"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface Template {
    id: string
    title: string
    description: string
    category: string
    fieldCount: number
    icon: LucideIcon
    /** Soft tint used for the icon tile background. */
    tint: string
    /** A short, human label for the category badge. */
    badge: string
}

/**
 * Starter templates. Creating from one currently seeds a new blank form with
 * the template's title — the field presets are added in the builder.
 */
const TEMPLATES: Template[] = [
    {
        id: "contact",
        title: "Contact Form",
        description: "A calm way to let people reach you without exposing an inbox.",
        category: "General",
        fieldCount: 4,
        icon: ClipboardList,
        tint: "bg-[var(--editorial-primary-light)] text-[var(--primary)]",
        badge: "Everyday",
    },
    {
        id: "feedback",
        title: "Customer Feedback",
        description: "Understand how people feel about your product in a few questions.",
        category: "Research",
        fieldCount: 6,
        icon: MessageSquareHeart,
        tint: "bg-[var(--editorial-purple-light)] text-[var(--editorial-purple)]",
        badge: "Research",
    },
    {
        id: "event",
        title: "Event Registration",
        description: "Collect attendee details, dietary needs and session choices.",
        category: "Events",
        fieldCount: 7,
        icon: CalendarCheck,
        tint: "bg-[var(--editorial-blue)]/12 text-[var(--editorial-blue)]",
        badge: "Events",
    },
    {
        id: "application",
        title: "Job Application",
        description: "Gather candidate information and portfolio links in one pass.",
        category: "Hiring",
        fieldCount: 8,
        icon: Briefcase,
        tint: "bg-[var(--editorial-success)]/12 text-[#4E7F62]",
        badge: "Hiring",
    },
    {
        id: "survey",
        title: "Community Survey",
        description: "A longer questionnaire for research and audience discovery.",
        category: "Research",
        fieldCount: 10,
        icon: Users,
        tint: "bg-[var(--editorial-purple-light)] text-[var(--editorial-purple)]",
        badge: "Research",
    },
    {
        id: "course",
        title: "Course Enrolment",
        description: "Sign students up and record their prior experience.",
        category: "Education",
        fieldCount: 6,
        icon: GraduationCap,
        tint: "bg-[var(--editorial-blue)]/12 text-[var(--editorial-blue)]",
        badge: "Education",
    },
]

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

/** The first template gets a "Featured" treatment in the grid. */
const FEATURED_ID = "contact"

export function TemplatesPage() {
    const navigate = useNavigate()
    const createForm = useCreateForm()

    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("All")

    const visibleTemplates = useMemo(() => {
        const term = query.trim().toLowerCase()
        return TEMPLATES.filter((template) => {
            const matchesCategory = category === "All" || template.category === category
            const matchesQuery =
                !term ||
                template.title.toLowerCase().includes(term) ||
                template.description.toLowerCase().includes(term)
            return matchesCategory && matchesQuery
        })
    }, [query, category])

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
        <div className="editorial mx-auto w-full max-w-[1600px] space-y-8 px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8">
            <div>
                <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
                    Templates
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
                    Start from a considered layout instead of a blank page. Every template
                    is a normal form once created — edit anything you like.
                </p>
            </div>

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
                <div className="flex items-center gap-1 overflow-x-auto rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
                    {CATEGORIES.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className={cn(
                                "editorial-transition shrink-0 rounded-[13px] border px-4 py-2.5 text-sm font-medium",
                                category === item
                                    ? "border-[var(--editorial-border-light)] bg-[var(--card)] text-[var(--foreground)] shadow-[0_2px_8px_rgba(24,20,18,.06)]"
                                    : "border-transparent text-[var(--editorial-subtle)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)]",
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template grid */}
            {visibleTemplates.length === 0 ? (
                <Card className="editorial-shadow-sm mt-8 border-[var(--border)] bg-[var(--card)] sm:mt-10">
                    <CardContent className="flex flex-col items-center py-20 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] text-[var(--editorial-subtle)]">
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
                <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 xl:grid-cols-3">
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
                                    <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-[16px] bg-[var(--editorial-primary-selected)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-[var(--primary)] uppercase">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Featured
                                    </div>
                                )}

                                <CardContent className="flex flex-1 flex-col">
                                    {/* Icon tile — soft tinted square, not a generic circle */}
                                    <div
                                        className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-[18px]",
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
                                            {template.fieldCount} questions
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
        </div>
    )
}