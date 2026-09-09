import { useEffect } from "react"
import { Building2, CreditCard, Settings, Sparkles, User as UserIcon, X } from "lucide-react"
import { BillingPage } from "@/pages/Billing"
import { PricingPage } from "@/pages/Pricing"
import { SettingsPage } from "@/pages/Settings"
import { WorkspaceSettingsPage } from "@/pages/WorkspaceSettings"
import { cn } from "@/shared/utils/cn"
import {
    type SettingsSection,
    useSettingsModalStore,
} from "@/shared/stores/settingsModalStore"

const NAV_ITEMS: { id: SettingsSection; label: string; icon: typeof UserIcon }[] = [
    { id: "account", label: "Account", icon: UserIcon },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "pricing", label: "Pricing", icon: Sparkles },
]

export function SettingsModal() {
    const open = useSettingsModalStore((state) => state.open)
    const section = useSettingsModalStore((state) => state.section)
    const setSection = useSettingsModalStore((state) => state.setSection)
    const closeSettings = useSettingsModalStore((state) => state.closeSettings)

    useEffect(() => {
        if (!open) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeSettings()
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        window.addEventListener("keydown", onKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [open, closeSettings])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={closeSettings}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                className="editorial relative z-50 flex h-[min(880px,92vh)] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg"
            >
                <aside className="flex w-[13.5rem] shrink-0 flex-col border-r border-[var(--editorial-border-light)] bg-[var(--secondary)]/60 p-4">
                    <p
                        id="settings-modal-title"
                        className="editorial-eyebrow px-2 pb-4 text-[var(--editorial-subtle)]"
                    >
                        Settings
                    </p>
                    <nav className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = section === item.id
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSection(item.id)}
                                    className={cn(
                                        "editorial-transition flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm",
                                        isActive
                                            ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                            : "border-transparent text-[var(--editorial-body)] hover:border-[var(--editorial-border-light)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between border-b border-[var(--editorial-border-light)] px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                            <Settings className="h-4 w-4 text-[var(--editorial-subtle)]" />
                            {NAV_ITEMS.find((item) => item.id === section)?.label}
                        </div>
                        <button
                            type="button"
                            onClick={closeSettings}
                            aria-label="Close settings"
                            className="editorial-transition flex h-9 w-9 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                        {section === "account" && <SettingsPage embedded />}
                        {section === "workspace" && <WorkspaceSettingsPage embedded />}
                        {section === "billing" && <BillingPage />}
                        {section === "pricing" && <PricingPage embedded />}
                    </div>
                </div>
            </div>
        </div>
    )
}
