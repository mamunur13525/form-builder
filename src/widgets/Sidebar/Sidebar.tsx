import { useNavigate, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    FileText,
    LayoutTemplate,
    Settings,
    LogOut,
    ChevronsUpDown,
    Sparkles,
    Megaphone,
} from "lucide-react"
import { ROUTES } from "../../shared/constants/routes"
import { cn } from "../../shared/utils/cn"
import { useSettingsModalStore } from "../../shared/stores/settingsModalStore"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu"
import { useLogout, useCurrentUser } from "../../features/auth/hooks/useAuth"
import { WorkspaceSwitcher } from "../WorkspaceSwitcher"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
    /** Drawer visibility on small screens. The sidebar is always shown from `lg` up. */
    open: boolean
    /** Closes the drawer — a no-op on desktop, where the sidebar is pinned. */
    onClose: () => void
}

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: "Forms", icon: FileText, path: ROUTES.FORMS },
    { label: "Templates", icon: LayoutTemplate, path: ROUTES.TEMPLATES },
]

/** First letters of the display name, used when the user has no avatar. */
function initialsOf(name: string | undefined): string {
    if (!name) return "?"
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const logout = useLogout()
    const { data: user } = useCurrentUser()
    const openSettings = useSettingsModalStore((state) => state.openSettings)

    const handleLogout = () => {
        logout.mutate()
        navigate(ROUTES.LOGIN)
    }

    /** Navigates and dismisses the drawer, so mobile taps don't leave it open. */
    const go = (path: string) => {
        navigate(path)
        onClose()
    }

    const openSettingsPanel = (section: "account" | "pricing") => {
        openSettings(section)
        onClose()
    }

    const displayName = user?.name || "Your account"
    const displayEmail = user?.email || "Not signed in"

    // Admins get an extra entry for managing the changelog.
    const items =
        user?.role === "admin"
            ? [...navItems, { label: "Updates", icon: Megaphone, path: ROUTES.ADMIN_UPDATES }]
            : navItems

    return (
        <>
            {/* Scrim — only used while the drawer is open on small screens */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={cn(
                    "fixed inset-0 z-30 bg-black/25 transition-opacity duration-250 ease-out lg:hidden",
                    open ? "opacity-100" : "pointer-events-none opacity-0",
                )}
            />

            <aside
                className={cn(
                    "editorial fixed left-0 top-0 z-40 flex h-dvh w-[20rem] max-w-[85vw] flex-col bg-transparent border-r border-[var(--border)] ",
                    "transition-transform duration-250 ease-out lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="editorial-shadow-md flex min-h-0 flex-1 flex-col bg-[var(--card)]">
                

                    {/* Active workspace + switcher */}
                    <div className="border-b border-[var(--editorial-border-light)] p-4">
                        <WorkspaceSwitcher onNavigate={onClose} />
                    </div>

                    {/* Navigation */}
                    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
                        {items.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => go(item.path)}
                                    className={cn(
                                        "editorial-transition flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                                        isActive
                                            ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                            : "border-transparent text-[var(--editorial-body)] hover:border-[var(--editorial-border-light)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Upgrade card — sits directly above the account section */}
                    <div className="px-4 pb-4">
                        <div className="rounded-[18px] border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] p-5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                                <p className="font-display text-xl text-[var(--foreground)]">
                                    Upgrade to Pro
                                </p>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-[var(--editorial-body)]">
                                Unlimited forms, custom domains and advanced analytics.
                            </p>
                            <Button
                                type="button"
                                onClick={() => openSettingsPanel("pricing")}
                                className="editorial-transition mt-4 h-11 w-full rounded-[16px] bg-[var(--primary)] text-sm font-medium text-white  hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]"
                            >
                                Upgrade now
                            </Button>
                        </div>
                    </div>

                    {/* Account — the menu opens upward so it stays on screen */}
                    <div className="border-t border-[var(--editorial-border-light)] p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="editorial-transition flex w-full items-center gap-3 rounded-[16px] border border-transparent px-3 py-2.5 text-left hover:border-[var(--editorial-border-light)] hover:bg-[var(--secondary)]"
                                aria-label="Account menu"
                            >
                                <Avatar size="lg">
                                    {user?.avatarUrl ? (
                                        <AvatarImage src={user.avatarUrl} />
                                    ) : (
                                        <AvatarFallback>{initialsOf(user?.name)}</AvatarFallback>
                                    )}
                                </Avatar>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-[var(--foreground)]">
                                        {displayName}
                                    </span>
                                    <span className="block truncate text-xs text-[var(--editorial-subtle)]">
                                        {displayEmail}
                                    </span>
                                </span>
                                <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--editorial-subtle)]" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="center"
                                sideOffset={12}
                                className="editorial rounded-[18px] border border-[var(--border)] bg-[var(--popover)] p-2"
                            >
                                <DropdownMenuItem
                                    className="rounded-[12px] px-3 py-2.5"
                                    onClick={() => openSettingsPanel("account")}
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="rounded-[12px] px-3 py-2.5"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>
        </>
    )
}
