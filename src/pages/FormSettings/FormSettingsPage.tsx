import { NavLink, Outlet, useParams } from "react-router-dom"
import {
    SlidersHorizontal,
    Mail,
    CalendarClock,
    Braces,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Metadata for every settings section. The route slug is the source of truth:
 * it drives both the nav links here and the child routes in
 * `src/app/routes/index.tsx`.
 */
export interface SettingsSectionMeta {
    slug: string
    label: string
    description: string
    icon: LucideIcon
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
    {
        slug: "general",
        label: "General",
        description: "Behaviour, branding & display",
        icon: SlidersHorizontal,
    },
    {
        slug: "email-settings",
        label: "Email settings",
        description: "Notifications & reply-to",
        icon: Mail,
    },
    {
        slug: "access",
        label: "Access",
        description: "Scheduling & response limits",
        icon: CalendarClock,
    },
    {
        slug: "hidden-fields",
        label: "Hidden fields ",
        description: "Hidden fields & variables",
        icon: Braces,
    },
]

/**
 * Form Settings layout: a persistent section nav beside the active section's
 * content (rendered through `<Outlet />`). The nav sits to the left of the
 * content on desktop and collapses to a scrollable pill strip on mobile.
 */
export function FormSettingsPage() {
    const { formId } = useParams<{ formId: string }>()
    const base = `/form-settings/${formId ?? "new"}`

    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--editorial-purple-light)]">
            {/* Mobile: horizontally scrollable pill nav pinned to the top. */}
            <nav className="sticky top-0 z-20 border-b border-[var(--border)] px-4 py-3 md:hidden bg-[var(--background)]">
                <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {SETTINGS_SECTIONS.map(({ slug, label, icon: Icon }) => (
                        <NavLink
                            key={slug}
                            to={`${base}/${slug}`}
                            className={({ isActive }) =>
                                cn(
                                    "editorial-transition flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium",
                                    isActive
                                        ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                        : "border-[var(--border)] text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                                )
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="mx-auto flex max-w-[1160px] gap-8 px-4 py-6 md:px-8 md:py-10  bg-[var(--background)] rounded-xl md:mt-10">
                {/* Desktop: sticky vertical section nav. */}
                <aside className="hidden md:block md:w-64 md:shrink-0">
                    <div className="sticky top-10 flex flex-col gap-1">
                        {SETTINGS_SECTIONS.map(
                            ({ slug, label, description, icon: Icon }) => (
                                <NavLink
                                    key={slug}
                                    to={`${base}/${slug}`}
                                    className={({ isActive }) =>
                                        cn(
                                            "editorial-transition group flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left",
                                            isActive
                                                ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)]"
                                                : "border-transparent hover:bg-[var(--secondary)]",
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span
                                                className={cn(
                                                    "editorial-transition flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                                                    isActive
                                                        ? "border-[var(--editorial-primary-ring)] bg-[var(--card)] text-[var(--primary)]"
                                                        : "border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] group-hover:text-[var(--foreground)]",
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={cn(
                                                        "block text-sm font-medium",
                                                        isActive
                                                            ? "text-[var(--primary)]"
                                                            : "text-[var(--foreground)]",
                                                    )}
                                                >
                                                    {label}
                                                </span>
                                                <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted-foreground)]">
                                                    {description}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            ),
                        )}
                    </div>
                </aside>

                {/* Active section content. */}
                <div className="min-w-0 flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
