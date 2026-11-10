/**
 * Starter templates.
 *
 * The list is local for now, but it is served through a query so the page
 * already has the loading state and cache shape it needs: swap `DEMO_TEMPLATES`
 * for a `GET /templates` call and nothing in the UI has to change.
 */
import { useQuery } from "@tanstack/react-query"
import {
    Briefcase,
    CalendarCheck,
    ClipboardList,
    GraduationCap,
    MessageSquareHeart,
    Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Template {
    id: string
    title: string
    description: string
    category: string
    pageCount: number
    icon: LucideIcon
    /** Soft tint used for the icon tile background. */
    tint: string
    /** A short, human label for the category badge. */
    badge: string
}

export const DEMO_TEMPLATES: Template[] = [
    {
        id: "contact",
        title: "Contact Form",
        description: "A calm way to let people reach you without exposing an inbox.",
        category: "General",
        pageCount: 4,
        icon: ClipboardList,
        tint: "bg-[#FF5722]/15 text-[#FF5722]",
        badge: "Everyday",
    },
    {
        id: "feedback",
        title: "Customer Feedback",
        description: "Understand how people feel about your product in a few questions.",
        category: "Research",
        pageCount: 6,
        icon: MessageSquareHeart,
        tint: "bg-violet-500/15 text-violet-400",
        badge: "Research",
    },
    {
        id: "event",
        title: "Event Registration",
        description: "Collect attendee details, dietary needs and session choices.",
        category: "Events",
        pageCount: 7,
        icon: CalendarCheck,
        tint: "bg-sky-500/15 text-sky-400",
        badge: "Events",
    },
    {
        id: "application",
        title: "Job Application",
        description: "Gather candidate information and portfolio links in one pass.",
        category: "Hiring",
        pageCount: 8,
        icon: Briefcase,
        tint: "bg-emerald-500/15 text-emerald-400",
        badge: "Hiring",
    },
    {
        id: "survey",
        title: "Community Survey",
        description: "A longer questionnaire for research and audience discovery.",
        category: "Research",
        pageCount: 10,
        icon: Users,
        tint: "bg-amber-500/15 text-amber-400",
        badge: "Research",
    },
    {
        id: "course",
        title: "Course Enrolment",
        description: "Sign students up and record their prior experience.",
        category: "Education",
        pageCount: 6,
        icon: GraduationCap,
        tint: "bg-rose-500/15 text-rose-400",
        badge: "Education",
    },
]

export function useTemplates() {
    return useQuery({
        queryKey: ["templates"],
        queryFn: async () => DEMO_TEMPLATES,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
