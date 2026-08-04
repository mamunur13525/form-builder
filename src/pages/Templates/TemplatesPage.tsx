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
    },
    {
        id: "feedback",
        title: "Customer Feedback",
        description: "Understand how people feel about your product in a few questions.",
        category: "Research",
        fieldCount: 6,
        icon: MessageSquareHeart,
    },
    {
        id: "event",
        title: "Event Registration",
        description: "Collect attendee details, dietary needs and session choices.",
        category: "Events",
        fieldCount: 7,
        icon: CalendarCheck,
    },
    {
        id: "application",
        title: "Job Application",
        description: "Gather candidate information and portfolio links in one pass.",
        category: "Hiring",
        fieldCount: 8,
        icon: Briefcase,
    },
    {
        id: "survey",
        title: "Community Survey",
        description: "A longer questionnaire for research and audience discovery.",
        category: "Research",
        fieldCount: 10,
        icon: Users,
    },
    {
        id: "course",
        title: "Course Enrolment",
        description: "Sign students up and record their prior experience.",
        category: "Education",
        fieldCount: 6,
        icon: GraduationCap,
    },
]

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

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
                <div className="editorial-transition flex h-[52px] w-full items-center gap-3 rounded-full border border-[var(--input)] bg-[var(--card)] px-5 py-1 focus-within:border-[var(--primary)] sm:px-6 lg:min-w-[280px] lg:flex-1">
                    <Search className="h-5 w-5 shrink-0 text-[var(--editorial-subtle)]" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search templates..."
                        aria-label="Search templates"
                        className="h-full flex-1 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-[var(--editorial-subtle)] focus-visible:ring-0"
                    />
                </div>
                {/* Chips scroll sideways on narrow screens rather than wrapping. */}
                <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
                    {CATEGORIES.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className={cn(
                                "editorial-transition h-11 shrink-0 rounded-[16px] border px-4 text-sm",
                                category === item
                                    ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                    : "border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]",
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {visibleTemplates.length === 0 ? (
                <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="py-20 text-center">
                        <p className="text-base text-[var(--editorial-subtle)]">
                            No templates match your search
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className="editorial-transition editorial-shadow-sm flex flex-col rounded-[24px] border-[var(--border)] bg-[var(--card)] p-6 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(110,80,60,.08)]"
                        >
                            <CardContent className="flex flex-1 flex-col p-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                                    <template.icon className="h-5 w-5" />
                                </div>

                                <h2 className="mt-6 font-display text-2xl leading-tight text-[var(--foreground)]">
                                    {template.title}
                                </h2>
                                <p className="mt-2 flex-1 text-base leading-6 text-[var(--editorial-body)]">
                                    {template.description}
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                    <span className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        {template.fieldCount} questions
                                    </span>
                                    <Button
                                        onClick={() => createFromTemplate(template)}
                                        disabled={createForm.isPending}
                                        className="editorial-transition h-11 shrink-0 gap-2 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]"
                                    >
                                        Use template
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
