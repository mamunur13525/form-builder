import type { ComponentType, ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Activity, BarChart3, FileText } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/shared/constants/routes"

export type ResponseTabValue = "submissions" | "summary" | "analytics"

interface ResponseTab {
    value: ResponseTabValue
    label: string
    icon: ComponentType<{ className?: string }>
    path: string
}

const RESPONSE_TABS: ResponseTab[] = [
    {
        value: "submissions",
        label: "Submissions",
        icon: FileText,
        path: ROUTES.FORM_RESPONSE_SUBMISSIONS,
    },
    {
        value: "summary",
        label: "Summary",
        icon: BarChart3,
        path: ROUTES.FORM_RESPONSE_SUMMARY,
    },
    {
        value: "analytics",
        label: "Analytics",
        icon: Activity,
        path: ROUTES.FORM_RESPONSE_ANALYTICS,
    },
]

interface ResponsePageShellProps {
    /** Tab matching the current route. Drives the active tab highlight. */
    activeTab: ResponseTabValue
    /** Optional page title. When omitted (together with `description`) the whole
     *  header row — including the back button — is not rendered. */
    /** Optional actions rendered on the right of the tab bar. */
    actions?: ReactNode
    /**
     * Let the content own its scrolling instead of scrolling the shell.
     * Needed by the submissions table, which uses a sticky header.
     */
    fill?: boolean
    children: ReactNode
}

/**
 * Shared chrome for the form response pages (Submissions / Summary / Analytics):
 * optional header, and the route-driven tab bar with inline actions.
 */
export function ResponsePageShell({
    activeTab,
    actions,
    fill = false,
    children,
}: ResponsePageShellProps) {
    const { formId } = useParams<{ formId: string }>()
    const navigate = useNavigate()

    const handleTabChange = (value: ResponseTabValue) => {
        if (!formId || value === activeTab) return
        const tab = RESPONSE_TABS.find((item) => item.value === value)
        if (!tab) return
        navigate(tab.path.replace(":formId", formId))
    }

    return (
        <div className="editorial editorial-shadow-md m-4 flex h-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] sm:m-8 sm:h-[calc(100%-4rem)]">
            {/* Navigation Tabs — controlled by the active route.
                The tab strip scrolls horizontally on narrow screens so the three
                labels never overflow or squash the actions on the right. */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--editorial-border-light)] px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => handleTabChange(value as ResponseTabValue)}
                    className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    <TabsList className="h-auto w-max gap-1 bg-transparent p-0">
                        {RESPONSE_TABS.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="editorial-transition h-9 gap-1.5 rounded-xl px-2.5 text-xs whitespace-nowrap text-[var(--editorial-body)] data-[selected]:border data-[selected]:border-[var(--editorial-primary-ring)] data-[selected]:bg-[var(--editorial-primary-selected)] data-[selected]:text-[var(--primary)] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                            >
                                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>

            {/* Content */}
            <div
                className={cn(
                    "flex-1",
                    fill ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto p-4 sm:p-8",
                )}
            >
                {children}
            </div>
        </div>
    )
}
