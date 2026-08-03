import type { ComponentType, ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Activity, ArrowLeft, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    title?: string
    description?: string
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
    title,
    description,
    actions,
    fill = false,
    children,
}: ResponsePageShellProps) {
    const { formId } = useParams<{ formId: string }>()
    const navigate = useNavigate()

    const hasHeader = Boolean(title || description)

    const handleTabChange = (value: ResponseTabValue) => {
        if (!formId || value === activeTab) return
        const tab = RESPONSE_TABS.find((item) => item.value === value)
        if (!tab) return
        navigate(tab.path.replace(":formId", formId))
    }

    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-md overflow-hidden">
            {hasHeader && (
                <div className="p-3 border-b">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            {title && <h1 className="text-lg font-bold">{title}</h1>}
                            {description && (
                                <p className="text-base text-muted-foreground">{description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs — controlled by the active route */}
            <div className="flex items-center justify-between gap-3 border-b px-2">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => handleTabChange(value as ResponseTabValue)}
                >
                    <TabsList className="bg-transparent h-9">
                        {RESPONSE_TABS.map(({ value, label, icon: Icon }) => (
                            <TabsTrigger key={value} value={value} className="text-sm gap-1.5 h-7">
                                <Icon className="h-4 w-4" />
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                {actions && <div className="flex items-center gap-1.5 pr-1">{actions}</div>}
            </div>

            {/* Content */}
            <div
                className={cn(
                    "flex-1",
                    fill ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto p-3",
                )}
            >
                {children}
            </div>
        </div>
    )
}
