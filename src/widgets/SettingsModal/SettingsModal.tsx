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

    const sectionLabel = NAV_ITEMS.find((item) => item.id === section)?.label

    return (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-6">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={closeSettings}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                className="editorial relative z-50 flex h-dvh max-h-dvh w-full flex-col overflow-hidden border-[var(--border)] bg-[var(--card)] shadow-lg max-md:border-0 max-md:rounded-none md:h-[min(880px,92vh)] md:max-w-[1120px] md:rounded-2xl md:border"
            >
                <h2 id="settings-modal-title" className="sr-only">
                    Settings
                </h2>
                {/* Mobile chrome — title + close sit above the scrolling tabs. */}
                <div className="flex items-center justify-between gap-3 border-b border-[var(--editorial-border-light)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
                    <p className="font-display text-lg text-[var(--foreground)]">
                        Settings
                    </p>
                    <button
                        type="button"
                        onClick={closeSettings}
                        aria-label="Close settings"
                        className="editorial-transition flex h-11 w-11 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
                    <aside className="shrink-0 border-b border-[var(--editorial-border-light)] bg-[var(--secondary)]/60 md:flex md:w-[13.5rem] md:flex-col md:border-b-0 md:border-r md:p-4">
                        <p className="editorial-eyebrow hidden px-2 pb-4 text-[var(--editorial-subtle)] md:block">
                            Settings
                        </p>
                        <nav
                            className="flex gap-1 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-col md:overflow-visible md:p-0"
                            aria-label="Settings sections"
                        >
                            {NAV_ITEMS.map((item) => {
                                const isActive = section === item.id
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSection(item.id)}
                                        className={cn(
                                            "editorial-transition inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm md:w-full md:gap-3 md:px-3",
                                            isActive
                                                ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                                : "border-transparent text-[var(--editorial-body)] hover:border-[var(--editorial-border-light)] hover:bg-[var(--card)] hover:text-[var(--foreground)]",
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </aside>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div className="hidden items-center justify-between border-b border-[var(--editorial-border-light)] px-6 py-3 md:flex">
                            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                                <Settings className="h-4 w-4 text-[var(--editorial-subtle)]" />
                                {sectionLabel}
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
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
                            {section === "account" && <SettingsPage embedded />}
                            {section === "workspace" && <WorkspaceSettingsPage embedded />}
                            {section === "billing" && <BillingPage />}
                            {section === "pricing" && <PricingPage embedded />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
