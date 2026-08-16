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
        <div className="editorial editorial-shadow-md m-8 flex h-[calc(100%-4rem)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            {/* Navigation Tabs — controlled by the active route */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--editorial-border-light)] px-6 py-3">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => handleTabChange(value as ResponseTabValue)}
                >
                    <TabsList className="h-auto gap-1 bg-transparent p-0">
                        {RESPONSE_TABS.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="editorial-transition h-10 gap-2 rounded-[16px] px-4 text-sm text-[var(--editorial-body)] data-[selected]:border data-[selected]:border-[var(--editorial-primary-ring)] data-[selected]:bg-[var(--editorial-primary-selected)] data-[selected]:text-[var(--primary)]"
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {/* Content */}
            <div
                className={cn(
                    "flex-1",
                    fill ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto p-8",
                )}
            >
                {children}
            </div>
        </div>
    )
}
