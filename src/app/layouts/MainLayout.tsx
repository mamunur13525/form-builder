import type { ReactNode } from "react"
import { Sidebar } from "../../widgets/Sidebar"
import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { ROUTES } from "../../shared/constants/routes"

/** Routes that render inside the workspace chrome (sidebar + content area). */
const WORKSPACE_ROUTES: string[] = [
    ROUTES.DASHBOARD,
    ROUTES.FORMS,
    ROUTES.TEMPLATES,
    ROUTES.SETTINGS,
    ROUTES.PRICING,
]

export function MainLayout({ children }: { children: ReactNode }) {
    const location = useLocation()
    const hasSidebar = WORKSPACE_ROUTES.includes(location.pathname)

    // Drawer state only matters below `lg`, where the sidebar is off-canvas.
    const [drawerOpen, setDrawerOpen] = useState(false)

    // A route change means the user navigated, so the drawer should not linger.
    useEffect(() => {
        setDrawerOpen(false)
    }, [location.pathname])

    if (!hasSidebar) {
        return (
            <div className="editorial min-h-dvh bg-[var(--editorial-canvas)]">
                <main>{children}</main>
            </div>
        )
    }

    return (
        <div className="editorial min-h-dvh bg-[var(--editorial-canvas)]">
            <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* The sidebar is pinned from `lg` up, so only reserve space there. */}
            <div className="lg:ml-[20rem]">
                {/* Mobile chrome — the only way to reach the nav below `lg`. */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--editorial-canvas)]/95 px-4 backdrop-blur-sm sm:px-6 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={drawerOpen}
                        className="editorial-transition flex h-11 w-11 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] active:scale-[.98]"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-display text-xl text-[var(--foreground)]">FormFlow</span>
                </header>

                <main>{children}</main>
            </div>
        </div>
    )
}
