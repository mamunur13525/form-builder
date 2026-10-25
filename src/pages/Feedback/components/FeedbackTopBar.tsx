import { NavLink } from "react-router-dom"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/shared/constants/routes"
import { Button } from "@/components/ui/button"
import { TypeFormLogo } from "./primitives"
import { NotificationsPopover } from "./NotificationsPopover"
import { UserMenu } from "./UserMenu"
import { useFeedbackUI } from "./feedback-ui"
import { useIsAuthenticated } from "../hooks"

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "relative py-4 text-sm font-medium transition-colors",
                    isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200",
                    isActive &&
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#FF5722]",
                )
            }
        >
            {children}
        </NavLink>
    )
}

export function FeedbackTopBar() {
    const { openSearch, openSubmit } = useFeedbackUI()
    const isAuthed = useIsAuthenticated()

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#111114]/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
                {/* Brand */}
                <NavLink to={ROUTES.FEEDBACK} className="flex items-center gap-2">
                    <TypeFormLogo />
                    <span className="text-[15px] font-bold tracking-tight text-white">TypeForm</span>
                </NavLink>

                {/* Section tabs */}
                <nav className="flex items-center gap-6">
                    <Tab to={ROUTES.FEEDBACK}>Feedback</Tab>
                    <Tab to={ROUTES.UPDATES}>Updates</Tab>
                </nav>

                {/* Right cluster */}
                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={openSearch}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 outline-none hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF5722]/40"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                    <NotificationsPopover />
                    {isAuthed ? (
                        <div className="ml-1">
                            <UserMenu onSubmitPost={openSubmit} />
                        </div>
                    ) : (
                        <NavLink to={ROUTES.LOGIN} className="ml-1">
                            <Button size="sm" className="h-9 px-4 text-sm">
                                Log in
                            </Button>
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    )
}
